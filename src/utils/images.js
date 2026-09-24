// Maps original WordPress upload URLs to local files in src/assets/wp/.
// `npm run assets` downloads them; until then <Img> falls back to the remote URL.

const WP_PREFIX = 'https://venturebean.com/wp-content/uploads/';

const localImages = import.meta.glob('/src/assets/wp/**/*.{jpg,jpeg,png,webp,avif,gif,svg}');

/** "https://venturebean.com/wp-content/uploads/2025/06/a.webp" -> "/src/assets/wp/2025/06/a.webp" */
export function toLocalKey(src) {
  if (typeof src !== 'string' || !src.startsWith(WP_PREFIX)) return null;
  return `/src/assets/wp/${src.slice(WP_PREFIX.length)}`;
}

/** Resolves to an ImageMetadata object when the asset has been downloaded, else null. */
export async function resolveLocal(src) {
  const key = toLocalKey(src);
  if (!key || !localImages[key]) return null;
  const mod = await localImages[key]();
  return mod.default;
}
