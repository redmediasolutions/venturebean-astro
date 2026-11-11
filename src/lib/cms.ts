/**
 * Reads the Content Manager (Firestore) for the website.
 *
 * Pages that show Content Manager data render on request (server-side, on
 * Cloudflare), so a post published in the Content Manager appears on the site
 * without a rebuild.
 *
 * To keep Firebase reads low, everything is cached:
 *   - The Content Manager updates settings/siteVersion every time something is
 *     saved. The site checks that one document at most once a minute.
 *   - The posts and categories themselves are kept in Cloudflare's cache and
 *     only fetched again when that version changes (and every few hours anyway).
 *
 * Uses Firestore's REST API with the public web key, so it works the same on
 * Cloudflare and during the build. Only data the public may read is fetched:
 * published posts, categories and settings (see firestore.rules).
 */
import { firebaseEnv } from './firebase-env';

export interface CmsDoc {
  id: string;
  [field: string]: unknown;
}

export interface CmsData {
  posts: CmsDoc[];
  categories: CmsDoc[];
}

const VERSION_CHECK_MS = 60_000; // how often to ask "has anything changed?"
const MAX_AGE_MS = 6 * 60 * 60_000; // refresh at least this often regardless
const TIMEOUT_MS = 20_000;

export const isCmsConfigured = Boolean(firebaseEnv.apiKey && firebaseEnv.projectId);

const base = () => `https://firestore.googleapis.com/v1/projects/${firebaseEnv.projectId}/databases/(default)/documents`;

/* ---------------------------------------------------------------- Firestore REST */

type FsValue = Record<string, unknown>;

/** Firestore REST value → plain JSON (timestamps become ISO strings). */
function decode(v: FsValue | undefined): unknown {
  if (!v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return Number(v.doubleValue);
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('nullValue' in v) return null;
  if ('mapValue' in v) return decodeFields(((v.mapValue as { fields?: Record<string, FsValue> }) ?? {}).fields);
  if ('arrayValue' in v) return (((v.arrayValue as { values?: FsValue[] }) ?? {}).values ?? []).map(decode);
  if ('referenceValue' in v) return v.referenceValue;
  if ('geoPointValue' in v) return v.geoPointValue;
  return null;
}

function decodeFields(fields: Record<string, FsValue> | undefined): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, val] of Object.entries(fields ?? {})) out[k] = decode(val);
  return out;
}

function toDoc(d: { name: string; fields?: Record<string, FsValue> }): CmsDoc {
  return { id: d.name.split('/').pop() as string, ...decodeFields(d.fields) };
}

async function call(url: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`${url}${url.includes('?') ? '&' : '?'}key=${encodeURIComponent(firebaseEnv.apiKey)}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  return res;
}

async function fetchPublishedPosts(): Promise<CmsDoc[]> {
  const res = await call(`${base()}:runQuery`, {
    method: 'POST',
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'posts' }],
        where: { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'published' } } },
      },
    }),
  });
  if (!res.ok) throw new Error(`posts: Firestore answered ${res.status} ${(await res.text()).slice(0, 200)}`);
  const rows = (await res.json()) as { document?: { name: string; fields?: Record<string, FsValue> } }[];
  return rows.filter((r) => r.document).map((r) => toDoc(r.document!));
}

async function fetchCategories(): Promise<CmsDoc[]> {
  const docs: CmsDoc[] = [];
  let pageToken = '';
  do {
    const res = await call(`${base()}/categories?pageSize=300${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`);
    if (!res.ok) throw new Error(`categories: Firestore answered ${res.status}`);
    const json = (await res.json()) as { documents?: { name: string; fields?: Record<string, FsValue> }[]; nextPageToken?: string };
    docs.push(...(json.documents ?? []).map(toDoc));
    pageToken = json.nextPageToken ?? '';
  } while (pageToken);
  return docs;
}

/** settings/siteVersion.updatedAt — changes whenever the Content Manager saves something. */
async function fetchVersion(): Promise<string | null> {
  const res = await call(`${base()}/settings/siteVersion`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`version: Firestore answered ${res.status}`);
  const doc = toDoc((await res.json()) as { name: string; fields?: Record<string, FsValue> });
  return typeof doc.updatedAt === 'string' ? doc.updatedAt : null;
}

async function fetchAll(): Promise<CmsData> {
  const [posts, categories] = await Promise.all([fetchPublishedPosts(), fetchCategories()]);
  console.log(`[cms] Loaded ${posts.length} published posts and ${categories.length} categories from Firebase.`);
  return { posts, categories };
}

/* ---------------------------------------------------------------- caching */

// Cloudflare's cache (shared by all visitors at one data centre). Not there
// during the build or in `astro dev`, where the in-memory copy is enough.
const edgeCache = (): Cache | null => {
  const c = (globalThis as { caches?: CacheStorage & { default?: Cache } }).caches;
  return c && 'default' in c && c.default ? c.default : null;
};

let memory: { key: string; data: CmsData } | null = null;
let version: { value: string | null; checkedAt: number } | null = null;
let inflight: { key: string; promise: Promise<CmsData> } | null = null;

async function currentKey(): Promise<string> {
  const now = Date.now();
  if (!version || now - version.checkedAt > VERSION_CHECK_MS) {
    try {
      version = { value: await fetchVersion(), checkedAt: now };
    } catch (err) {
      console.warn(`[cms] Could not check for changes (${(err as Error).message}) — using the copy we have.`);
      version = { value: version?.value ?? null, checkedAt: now };
    }
  }
  return `${version.value ?? 'none'}|${Math.floor(now / MAX_AGE_MS)}`;
}

async function loadFor(key: string): Promise<CmsData> {
  const cache = edgeCache();
  const req = new Request(`https://venturebean.com/__cms-cache/${encodeURIComponent(key)}`);
  if (cache) {
    const hit = await cache.match(req);
    if (hit) return (await hit.json()) as CmsData;
  }
  const data = await fetchAll();
  if (cache) {
    await cache.put(
      req,
      new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400' } })
    );
  }
  return data;
}

/**
 * Published posts + categories from the Content Manager, or null if the site
 * isn't connected (no Firebase keys) or Firebase can't be reached and there's
 * no earlier copy to fall back on.
 */
export async function loadCms(): Promise<CmsData | null> {
  if (!isCmsConfigured) return null;
  const key = await currentKey();
  if (memory?.key === key) return memory.data;
  if (inflight?.key !== key) {
    inflight = { key, promise: loadFor(key) };
  }
  try {
    const data = await inflight.promise;
    memory = { key, data };
    return data;
  } catch (err) {
    console.warn(`[cms] Could not load from Firebase (${(err as Error).message}).`);
    return memory?.data ?? null;
  } finally {
    if (inflight?.key === key) inflight = null;
  }
}

/** Firestore dates arrive as ISO strings (or Date / {seconds}); null if missing. */
export function toDate(v: unknown): Date | null {
  if (!v) return null;
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;
  if (typeof v === 'string' || typeof v === 'number') {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof v === 'object' && typeof (v as { seconds?: unknown }).seconds === 'number') {
    return new Date((v as { seconds: number }).seconds * 1000);
  }
  return null;
}
