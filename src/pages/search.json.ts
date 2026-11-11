/**
 * Live search results for the header search box → /search.json?s=<words>
 */
import type { APIRoute } from 'astro';
import { search } from '../lib/search';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const q = (url.searchParams.get('s') ?? '').trim().slice(0, 100);
  const { results, total } = q ? await search(q, 6) : { results: [], total: 0 };
  return new Response(JSON.stringify({ q, total, results }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=60' },
  });
};
