#!/usr/bin/env node
/**
 * Downloads every original WordPress image referenced in src/data/*.js into
 * src/assets/wp/<year>/<month>/<file>, mirroring the uploads path.
 * Astro then optimises them at build time (WebP, responsive widths).
 *
 * Usage:  npm run assets          (skips files that already exist)
 *         npm run assets -- --force
 *
 * Also refreshes the original favicons into /public.
 */
import { readdir, readFile, mkdir, writeFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'src/data');
const outDir = join(root, 'src/assets/wp');
const PREFIX = 'https://venturebean.com/wp-content/uploads/';
const force = process.argv.includes('--force');
const IMAGE_RE = /https:\/\/venturebean\.com\/wp-content\/uploads\/[^'"`\s)]+?\.(?:jpe?g|png|webp|avif|gif|svg)/gi;

const exists = (p) => access(p).then(() => true, () => false);

async function collectUrls() {
  const urls = new Set();
  const files = (await readdir(dataDir)).filter((f) => f.endsWith('.js'));
  for (const f of files) {
    let text = await readFile(join(dataDir, f), 'utf8');
    // expand the `${WP}` template shorthand used in the data files
    text = text.replace(/\$\{WP\}\//g, PREFIX);
    for (const m of text.matchAll(IMAGE_RE)) urls.add(m[0]);
  }
  return [...urls];
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'user-agent': 'VentureBean-Astro-Migration/1.0' } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
}

async function run() {
  const urls = await collectUrls();
  const favicons = [
    ['2024/06/cropped-Venture-Bean_-Logo-New-512x512-1-192x192.png', 'public/favicon-192.png'],
    ['2024/06/cropped-Venture-Bean_-Logo-New-512x512-1-180x180.png', 'public/apple-touch-icon.png'],
    ['2024/06/cropped-Venture-Bean_-Logo-New-512x512-1-32x32.png', 'public/favicon-32.png'],
  ];
  console.log(`Found ${urls.length} images.`);
  const failed = [];
  let done = 0;
  const queue = [
    ...urls.map((u) => [u, join(outDir, decodeURIComponent(u.slice(PREFIX.length)))]),
    ...favicons.map(([p, d]) => [PREFIX + p, join(root, d), true]),
  ];

  const worker = async () => {
    while (queue.length) {
      const [url, dest, always] = queue.shift();
      if (!force && !always && (await exists(dest))) {
        done++;
        continue;
      }
      try {
        await download(url, dest);
        done++;
        console.log(`✓ ${url.slice(PREFIX.length)}`);
      } catch (err) {
        failed.push(`${url} — ${err.message}`);
        console.warn(`✗ ${url} — ${err.message}`);
      }
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));

  console.log(`\n${done} ok, ${failed.length} failed.`);
  if (failed.length) {
    console.log('These images will fall back to the live URL at build time:\n' + failed.join('\n'));
    process.exitCode = 1;
  }
}

run();
