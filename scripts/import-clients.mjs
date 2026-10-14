#!/usr/bin/env node
/**
 * ONE-TIME IMPORT: copies the client logos that are currently hard-coded in
 * the website into the Content Manager (Firebase), so they can be edited there.
 *
 *   npm run import:clients
 *   npm run import:clients -- --dry-run   (just list what would be imported)
 *
 * It will ask for your Content Manager email + password (must be an admin).
 * Safe to run again — logos that were already imported are skipped.
 *
 * What it creates:
 *   • Category "Clients" with one sub-category per industry tab
 *     (Consumer, Education, Health Care, …)
 *   • Custom field group "Client Details" (display order, logo size, hide toggles)
 *   • One published post per client: title = name, featured image = logo
 */
import { readFileSync, existsSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CLIENTS_SLUG = 'clients';
const FIELD_GROUP_TITLE = 'Client Details';
const DEFAULT_LOGO_SIZE = 60;

/* ---------------------------------------------------------------- helpers */

function readEnv() {
  const env = { ...process.env };
  for (const file of ['.env', '.env.local']) {
    const p = join(ROOT, file);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  return env;
}

const slugify = (t) =>
  t.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
    .replace(/&/g, ' ').replace(/[^a-z0-9\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").trim();

function innerOf(html, name) {
  const a = html.indexOf(`<!--cms:${name}-->`);
  const b = html.indexOf(`<!--/cms:${name}-->`);
  if (a < 0 || b < 0) throw new Error(`Marker ${name} not found`);
  return html.slice(a, b);
}

/** Guess a readable name from a logo file name, e.g. "rasapoorna_foods_private_limited_logo.jpeg" → "Rasapoorna Foods Private Limited". */
function nameFromFile(src) {
  let base = basename(src, extname(src))
    .replace(/-\d+x\d+$/, '')
    .replace(/-e\d{9,}$/, '')
    .replace(/[-_](scaled|main|hd|new|website|svg|vector|logo|\d)$/gi, '')
    .replace(/[-_](scaled|main|hd|new|website|svg|vector|logo|\d)$/gi, '');
  const words = base.split(/[-_\s]+/).filter((w) => w && !/^(logo|svg|vector|hd|scaled|\d{3,}x\d{3,})$/i.test(w));
  if (!words.length || words.every((w) => /^\d+$/.test(w))) return `Client ${words.join(' ') || base}`;
  while (words.length > 1 && /^\d+$/.test(words.at(-1))) words.pop(); // "gunasheela 001" → "gunasheela"
  return words.slice(0, words.length > 5 ? 3 : words.length).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const CONTENT_TYPES = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.svg': 'image/svg+xml', '.gif': 'image/gif',
};

/* ---------------------------------------------------- read current website */

export function readCurrentLogos() {
  const clientsHtml = readFileSync(join(ROOT, 'src/content/pages/clients.html'), 'utf8');
  const homeHtml = readFileSync(join(ROOT, 'src/content/pages/home.html'), 'utf8');
  const cssPath = join(ROOT, 'public/assets/uploads/vb/css/post-12440.css');
  // Per-logo widths (desktop rules only — strip @media blocks first).
  const css = existsSync(cssPath)
    ? readFileSync(cssPath, 'utf8').replace(/@media[^{]*\{(?:[^{}]*\{[^}]*\})*[^{}]*\}/g, '')
    : '';
  const sizeOf = (elementId) => {
    const m = css.match(new RegExp(`vb-element-${elementId} img\\{width:(\\d+)%`));
    return m ? Number(m[1]) : null;
  };

  const tabsHtml = innerOf(clientsHtml, 'client-logo-tabs');
  const titles = [...tabsHtml.matchAll(/<span class="e-n-tab-title-text">([^<]*)<\/span>/g)].map((m) => decode(m[1]));
  const panelStarts = [...tabsHtml.matchAll(/<div id="e-n-tab-content-\d+" role="tabpanel"/g)].map((m) => m.index);

  const clients = new Map(); // src → client
  panelStarts.forEach((start, i) => {
    const panel = tabsHtml.slice(start, panelStarts[i + 1] ?? tabsHtml.length);
    const industry = i === 0 ? null : titles[i];
    for (const m of panel.matchAll(/vb-element-([0-9a-f]+) vb-widget vb-widget-image[\s\S]*?<img([^>]*)>/g)) {
      const attrs = m[2];
      const src = attrs.match(/\ssrc="([^"]+)"/)?.[1];
      if (!src) continue;
      const alt = decode(attrs.match(/\salt="([^"]*)"/)?.[1] ?? '');
      if (!clients.has(src)) {
        const size = sizeOf(m[1]);
        clients.set(src, {
          src,
          name: alt || nameFromFile(src),
          width: Number(attrs.match(/\swidth="(\d+)"/)?.[1]) || null,
          height: Number(attrs.match(/\sheight="(\d+)"/)?.[1]) || null,
          logoSize: size && size !== DEFAULT_LOGO_SIZE ? size : null,
          industries: new Set(),
          onClientsPage: true,
          onHome: false,
        });
      }
      if (industry) clients.get(src).industries.add(industry);
    }
  });

  // Home-page strip (first marquee group; the second is a copy).
  const marquee = innerOf(homeHtml, 'home-client-logos').split('deensimc-marquee-group')[1] ?? '';
  for (const m of marquee.matchAll(/<img[^>]*\ssrc="([^"]+)"/g)) {
    const src = m[1];
    if (!clients.has(src)) {
      clients.set(src, { src, name: nameFromFile(src), width: null, height: null, logoSize: null, industries: new Set(), onClientsPage: false, onHome: true });
    }
    clients.get(src).onHome = true;
  }

  return { industries: titles.slice(1), clients: [...clients.values()] };
}

/* ---------------------------------------------------------------- main */

async function main() {
  const env = readEnv();
  const config = {
    apiKey: env.PUBLIC_FIREBASE_API_KEY,
    authDomain: env.PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.PUBLIC_FIREBASE_APP_ID,
  };
  if (!process.argv.includes('--dry-run') && (!config.apiKey || !config.projectId)) {
    console.error('✖ Firebase keys missing. Copy .env.example to .env and fill it in first.');
    process.exit(1);
  }

  const { industries, clients } = readCurrentLogos();
  console.log(`Found ${clients.length} logos on the website and ${industries.length} industries: ${industries.join(', ')}\n`);
  if (process.argv.includes('--dry-run')) {
    for (const [i, c] of clients.entries()) {
      const where = [c.onHome && 'home', c.onClientsPage && 'clients page'].filter(Boolean).join(' + ');
      console.log(`${String(i + 1).padStart(3)}. ${c.name.padEnd(34)} ${[...c.industries].join(', ').padEnd(32)} ${where}${c.logoSize ? `  size ${c.logoSize}%` : ''}`);
    }
    process.exit(0);
  }

  const rl = createInterface({ input: stdin, output: stdout });
  const email = env.CMS_EMAIL || (await rl.question('Content Manager email: '));
  const password = env.CMS_PASSWORD || (await rl.question('Password: '));
  rl.close();

  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);
  if (!(await getDoc(doc(db, 'admins', user.uid))).exists()) {
    console.error('✖ This account is not an admin in the Content Manager.');
    process.exit(1);
  }
  console.log(`✔ Signed in as ${user.email}\n`);

  /* 1. Categories */
  const catSnap = await getDocs(collection(db, 'categories'));
  const cats = catSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const ensureCategory = async (name, parentId) => {
    const slug = slugify(name);
    const found = cats.find((c) => c.slug === slug);
    if (found) return found;
    const data = { name, slug, description: '', parentId, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
    const created = { id: (await addDoc(collection(db, 'categories'), data)).id, ...data };
    cats.push(created);
    console.log(`  + category ${parentId ? '  └ ' : ''}${name}`);
    return created;
  };
  const root = await ensureCategory('Clients', null);
  const industryCats = new Map();
  for (const name of industries) industryCats.set(name, await ensureCategory(name, root.id));

  /* 2. Field group */
  const groups = await getDocs(collection(db, 'fieldGroups'));
  if (!groups.docs.some((g) => g.data().title === FIELD_GROUP_TITLE)) {
    const field = (name, label, type, instructions) => ({
      id: Math.random().toString(36).slice(2, 10), name, label, type, instructions, required: false, placeholder: '', options: [],
    });
    await addDoc(collection(db, 'fieldGroups'), {
      title: FIELD_GROUP_TITLE,
      description: 'Settings for client logos on the website.',
      location: 'categories',
      categoryIds: [root.id, ...[...industryCats.values()].map((c) => c.id)],
      fields: [
        field('display_order', 'Display order', 'number', 'Lower numbers show first. Leave empty to show at the end.'),
        field('logo_size', 'Logo size (%)', 'number', `Optional. Width of the logo in its box. Normal size is ${DEFAULT_LOGO_SIZE}.`),
        field('hide_on_home', 'Hide on home page', 'toggle', 'Turn on to keep this logo out of the home-page logo strip.'),
        field('hide_on_clients_page', 'Hide on Clients page', 'toggle', 'Turn on to keep this logo off the Clients page.'),
      ],
      active: true,
      order: groups.size,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log(`  + field group "${FIELD_GROUP_TITLE}"`);
  }

  /* 3. One post per client */
  const postSnap = await getDocs(collection(db, 'posts'));
  const imported = new Set(postSnap.docs.map((d) => d.data().importSource).filter(Boolean));
  const usedSlugs = new Set(postSnap.docs.map((d) => d.data().slug));
  const uniqueSlug = (name) => {
    const base = slugify(name) || 'client';
    let s = base;
    for (let i = 2; usedSlugs.has(s); i++) s = `${base}-${i}`;
    usedSlugs.add(s);
    return s;
  };

  console.log('');
  let added = 0;
  let skipped = 0;
  const now = new Date();
  const month = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;

  for (const [i, c] of clients.entries()) {
    const label = `[${String(i + 1).padStart(2)}/${clients.length}] ${c.name}`;
    if (imported.has(c.src)) {
      skipped++;
      console.log(`  = ${label} (already imported)`);
      continue;
    }
    const file = join(ROOT, 'public', decodeURIComponent(c.src));
    if (!existsSync(file)) {
      console.warn(`  ! ${label} — file not found: public${c.src}`);
      continue;
    }

    // Upload the logo to the Media Library.
    const ext = extname(file).toLowerCase();
    const contentType = CONTENT_TYPES[ext] ?? 'application/octet-stream';
    const fileName = basename(file);
    const path = `media/${month}/${Date.now()}-${fileName.toLowerCase().replace(/[^a-z0-9.]+/g, '-')}`;
    const bytes = readFileSync(file);
    await uploadBytes(ref(storage, path), new Uint8Array(bytes), { contentType, cacheControl: 'public, max-age=31536000' });
    const url = await getDownloadURL(ref(storage, path));
    const media = { name: fileName, url, path, contentType, size: bytes.length, alt: c.name, width: c.width, height: c.height };
    const mediaRef = await addDoc(collection(db, 'media'), { ...media, createdAt: serverTimestamp() });

    // Create the client post.
    const catList = [root, ...[...c.industries].map((n) => industryCats.get(n)).filter(Boolean)];
    await addDoc(collection(db, 'posts'), {
      title: c.name,
      slug: uniqueSlug(c.name),
      content: '',
      excerpt: '',
      featuredImage: { id: mediaRef.id, url, path, name: fileName, alt: c.name, contentType, width: c.width, height: c.height },
      categoryIds: catList.map((x) => x.id),
      categorySlugs: catList.map((x) => x.slug),
      status: 'published',
      publishedAt: Timestamp.fromDate(now),
      seoTitle: '',
      seoDescription: '',
      customFields: {
        display_order: i + 1,
        logo_size: c.logoSize,
        hide_on_home: !c.onHome,
        hide_on_clients_page: !c.onClientsPage,
      },
      authorId: user.uid,
      authorName: user.displayName || user.email || '',
      importSource: c.src,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    added++;
    console.log(`  + ${label}${c.industries.size ? `  (${[...c.industries].join(', ')})` : ''}`);
  }

  console.log(`\n✔ Done — ${added} added, ${skipped} already there.`);
  console.log('  Names were guessed from file names — rename them in Content Manager → Posts (filter: Clients).');
  console.log('  Then rebuild the website (npm run build) to see the logos from the CMS.');
  process.exit(0);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main().catch((err) => {
  const code = err?.code ? ` (${err.code})` : '';
  console.error(`\n✖ Import failed${code}: ${err?.message ?? err}`);
  if (err?.code === 'auth/invalid-credential') console.error('  Wrong email or password.');
  if (String(err?.code).includes('permission')) console.error('  Check that the Firestore and Storage rules from the Content Manager are published.');
  process.exit(1);
});
