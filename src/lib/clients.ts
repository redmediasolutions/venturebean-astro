/**
 * Client logos, managed in the Content Manager:
 *
 *   Categories → "Clients"            (slug: clients)
 *     └ sub-categories = industries   (Consumer, Education, …) → tabs on the Clients page
 *   Posts in that category            → one post per client
 *     • Title            = client name (used as the logo's alt text)
 *     • Featured image   = the logo
 *     • Custom fields ("Client Details" group):
 *         display_order        number   lower shows first
 *         logo_size            number   % width, optional (default 60)
 *         hide_on_home         yes/no   hide from the home-page logo strip
 *         hide_on_clients_page yes/no   hide from the Clients page
 */
import { isCmsConfigured, loadCms, toDate } from './cms';

export const CLIENTS_CATEGORY_SLUG = 'clients';

export interface ClientLogo {
  id: string;
  name: string;
  logo: { url: string; alt: string; width: number | null; height: number | null };
  industryIds: string[];
  order: number;
  logoSize: number | null;
  onHome: boolean;
  onClientsPage: boolean;
}

export interface Industry {
  id: string;
  name: string;
  slug: string;
}

export interface ClientsData {
  clients: ClientLogo[];
  industries: Industry[];
}

async function load(): Promise<ClientsData | null> {
  if (!isCmsConfigured) {
    console.warn('[cms] Firebase keys missing — using the built-in client logos.');
    return null;
  }
  const data = await loadCms();
  if (!data) return null;
  const categories = data.categories.map((c) => ({
    id: c.id,
    name: String(c.name ?? ''),
    slug: String(c.slug ?? ''),
    parentId: (c.parentId as string | null) ?? null,
  }));
  const root = categories.find((c) => c.slug === CLIENTS_CATEGORY_SLUG);
  if (!root) {
    console.warn(`[cms] No "${CLIENTS_CATEGORY_SLUG}" category yet — using the built-in client logos.`);
    return null;
  }

  // "Clients" and everything below it.
  const tree = new Set([root.id]);
  for (let grew = true; grew; ) {
    grew = false;
    for (const c of categories) if (c.parentId && tree.has(c.parentId) && !tree.has(c.id)) tree.add(c.id), (grew = true);
  }
  const industries = categories
    .filter((c) => c.parentId === root.id)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ id, name, slug }) => ({ id, name, slug }));
  const parentOf = new Map(categories.map((c) => [c.id, c.parentId]));
  /** Map any category inside the tree to its industry (direct child of "Clients"). */
  const industryOf = (id: string): string | null => {
    let cur: string | null = id;
    while (cur && parentOf.get(cur) !== root.id) cur = parentOf.get(cur) ?? null;
    return cur;
  };

  const now = Date.now();
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

  const clients: ClientLogo[] = [];
  for (const p of data.posts as (Record<string, any> & { id: string })[]) {
    const catIds: string[] = Array.isArray(p.categoryIds) ? p.categoryIds : [];
    if (!catIds.some((id) => tree.has(id))) continue;
    const publishedAt = toDate(p.publishedAt);
    if (publishedAt && publishedAt.getTime() > now) continue; // scheduled
    const img = p.featuredImage;
    if (!img?.url) {
      console.warn(`[cms] Client "${p.title}" has no featured image (logo) — skipped.`);
      continue;
    }
    const f = (p.customFields ?? {}) as Record<string, unknown>;
    const name = String(p.title ?? '').trim();
    clients.push({
      id: p.id,
      name,
      logo: { url: img.url, alt: img.alt || name, width: num(img.width), height: num(img.height) },
      industryIds: [...new Set(catIds.filter((id) => tree.has(id) && id !== root.id).map(industryOf).filter(Boolean) as string[])],
      order: num(f.display_order) ?? Number.MAX_SAFE_INTEGER,
      logoSize: num(f.logo_size),
      onHome: f.hide_on_home !== true,
      onClientsPage: f.hide_on_clients_page !== true,
    });
  }
  clients.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

  if (clients.length === 0) {
    console.warn('[cms] The "Clients" category has no published posts — using the built-in client logos.');
    return null;
  }
  console.log(`[cms] Loaded ${clients.length} client logos and ${industries.length} industries from Firebase.`);
  return { clients, industries };
}

let parsed: { source: unknown; result: ClientsData | null } | null = null;

/** Client logos from the Content Manager, or null (→ keep the original logos). */
export async function getClientsData(): Promise<ClientsData | null> {
  try {
    const data = await loadCms();
    if (data && parsed?.source === data) return parsed.result;
    const result = await load();
    if (data) parsed = { source: data, result };
    return result;
  } catch (err) {
    console.warn(`[cms] Could not load client logos (${(err as Error)?.message ?? err}) — using the built-in logos.`);
    return null;
  }
}
