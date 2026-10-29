import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL('http://localhost:4321')).origin;
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /akun\nDisallow: /api\nDisallow: /verifikasi\nDisallow: /auth\n\nSitemap: ${base}/sitemap.xml\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
};
