import type { APIRoute } from 'astro';

export const GET: APIRoute = async () =>
  Response.json({ ok: true, service: 'alumni', time: new Date().toISOString() });
