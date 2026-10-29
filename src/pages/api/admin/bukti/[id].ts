import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { donations, getDb } from '../../../../server/db';
import { isAdmin } from '../../../../server/auth/types';
import { getPrivate } from '../../../../server/storage/r2';

export const GET: APIRoute = async ({ locals, params }) => {
  if (!isAdmin(locals.user)) return new Response('Akses ditolak', { status: 403 });

  const [row] = await getDb()
    .select({ proofKey: donations.proofKey })
    .from(donations)
    .where(eq(donations.id, params.id ?? ''))
    .limit(1);

  if (!row?.proofKey) return new Response('Tidak ditemukan', { status: 404 });

  const object = await getPrivate(row.proofKey);
  if (!object) return new Response('Tidak ditemukan', { status: 404 });

  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType ?? 'application/octet-stream',
      'Content-Disposition': `attachment; filename="bukti-${params.id ?? 'donasi'}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
};
