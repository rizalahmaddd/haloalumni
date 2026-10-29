import type { APIRoute } from 'astro';
import { desc, like } from 'drizzle-orm';
import { getDb, media } from '../../../server/db';
import { sanitizeSearchTerm } from '../../../server/url';
import { isEditor } from '../../../server/auth/types';
import { mediaUrl } from '../../../server/storage/r2';
import { apiError } from '../../../server/util';

export const GET: APIRoute = async ({ locals, url }) => {
  if (!isEditor(locals.user)) return apiError('Akses ditolak.', 403);

  const q = (url.searchParams.get('q') ?? '').trim();
  const limit = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get('limit') ?? '40', 10) || 40));

  const rows = await getDb()
    .select()
    .from(media)
    .where(q ? like(media.filename, `%${sanitizeSearchTerm(q)}%`) : undefined)
    .orderBy(desc(media.createdAt))
    .limit(limit);

  return Response.json({
    ok: true,
    items: rows.map((row) => ({
      id: row.id,
      key: row.key,
      filename: row.filename,
      alt: row.alt,
      size: row.size,
      url: mediaUrl(row.key),
    })),
  });
};
