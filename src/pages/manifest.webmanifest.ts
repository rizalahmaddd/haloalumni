import type { APIRoute } from 'astro';
import { getSettings } from '../server/settings';

export const GET: APIRoute = async () => {
  const settings = await getSettings();
  const name = settings['site.name'];
  const manifest = {
    id: '/',
    name,
    short_name: name.length > 12 ? name.split(/\s+/)[0] : name,
    description: settings['site.tagline'],
    lang: 'id',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f2f2f7',
    theme_color: settings['site.accent'] || '#0071e3',
    icons: [
      { src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/brand/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/brand/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Direktori', url: '/direktori' },
      { name: 'Loker', url: '/loker' },
      { name: 'Agenda', url: '/agenda' },
      { name: 'Kartu alumni', url: '/akun/kartu' },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
};
