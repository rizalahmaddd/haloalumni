import type { APIRoute } from 'astro';
import { getDb, media } from '../../../server/db';
import { isEditor } from '../../../server/auth/types';
import { rateLimit } from '../../../server/security/rate-limit';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  buildMediaKey,
  mediaUrl,
  putMedia,
  sniffImageType,
} from '../../../server/storage/r2';
import { apiError, newId, now } from '../../../server/util';

const MAX_FORM_BYTES = MAX_UPLOAD_BYTES + 64 * 1024;

export const POST: APIRoute = async ({ locals, request }) => {
  if (!isEditor(locals.user)) return apiError('Akses ditolak.', 403);

  const declaredLength = Number.parseInt(request.headers.get('content-length') ?? '0', 10);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_FORM_BYTES) {
    return apiError('Ukuran file maksimal 3MB.', 413);
  }
  if (!(await rateLimit('upload', locals.user!.id, 20, 60 * 60 * 1000))) {
    return apiError('Batas unggah per jam tercapai.', 429);
  }

  const form = await request.formData();
  const file = form.get('file');
  const alt = form.get('alt');
  const folderRaw = form.get('folder');
  const widthRaw = form.get('width');
  const heightRaw = form.get('height');

  if (!(file instanceof File)) return apiError('File tidak ditemukan.');
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) return apiError('Format harus JPG, PNG, atau WebP.');
  if (file.size > MAX_UPLOAD_BYTES) return apiError('Ukuran file maksimal 3MB.');

  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = sniffImageType(bytes);
  if (!mime || !ALLOWED_IMAGE_TYPES.has(mime)) {
    return apiError('Isi file bukan gambar JPG, PNG, atau WebP yang valid.');
  }

  const folder =
    typeof folderRaw === 'string' && folderRaw
      ? folderRaw.replace(/[^a-zA-Z0-9/_-]/g, '').replace(/\.{2,}/g, '').replace(/^\/+|\/+$/g, '')
      : 'library';

  const key = buildMediaKey(file.name || 'image.webp', folder);
  await putMedia(key, bytes.buffer as ArrayBuffer, mime);

  const width = Number.parseInt(String(widthRaw ?? ''), 10);
  const height = Number.parseInt(String(heightRaw ?? ''), 10);

  const id = newId();
  await getDb().insert(media).values({
    id,
    key,
    bucket: 'media',
    filename: file.name || 'image.webp',
    mime,
    size: file.size,
    width: Number.isFinite(width) && width > 0 ? width : null,
    height: Number.isFinite(height) && height > 0 ? height : null,
    alt: typeof alt === 'string' ? alt.slice(0, 200) : null,
    uploadedBy: locals.user!.id,
    createdAt: now(),
  });

  return Response.json({ ok: true, id, key, url: mediaUrl(key) });
};
