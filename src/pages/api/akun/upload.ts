import type { APIRoute } from 'astro';
import { getDb, media } from '../../../server/db';
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

const MAX_FORM_BYTES = MAX_UPLOAD_BYTES * 2 + 64 * 1024;

export const POST: APIRoute = async ({ locals, request }) => {
  const user = locals.user;
  if (!user) return apiError('Silakan masuk terlebih dahulu.', 401);
  if (user.status !== 'active') return apiError('Akun Anda belum aktif.', 403);

  const declaredLength = Number.parseInt(request.headers.get('content-length') ?? '0', 10);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_FORM_BYTES) {
    return apiError('Ukuran file maksimal 3MB.', 413);
  }
  if (!(await rateLimit('upload', user.id, 20, 60 * 60 * 1000))) {
    return apiError('Batas unggah per jam tercapai.', 429);
  }

  const form = await request.formData();
  const file = form.get('file');
  const thumb = form.get('thumb');
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

  const db = getDb();
  const key = buildMediaKey(file.name || 'photo.webp', `alumni/${user.id}`);
  await putMedia(key, bytes.buffer as ArrayBuffer, mime);

  const width = Number.parseInt(String(widthRaw ?? ''), 10);
  const height = Number.parseInt(String(heightRaw ?? ''), 10);

  await db.insert(media).values({
    id: newId(),
    key,
    bucket: 'media',
    filename: file.name || 'photo.webp',
    mime,
    size: file.size,
    width: Number.isFinite(width) && width > 0 ? width : null,
    height: Number.isFinite(height) && height > 0 ? height : null,
    alt: user.profile?.fullName ?? null,
    uploadedBy: user.id,
    createdAt: now(),
  });

  let thumbKey: string | null = null;
  if (thumb instanceof File && thumb.size > 0) {
    if (thumb.size > MAX_UPLOAD_BYTES) return apiError('Ukuran thumbnail maksimal 3MB.');
    const thumbBytes = new Uint8Array(await thumb.arrayBuffer());
    const thumbMime = sniffImageType(thumbBytes);
    if (!thumbMime || !ALLOWED_IMAGE_TYPES.has(thumbMime)) {
      return apiError('Thumbnail bukan gambar yang valid.');
    }
    thumbKey = buildMediaKey(thumb.name || 'thumb.webp', `alumni/${user.id}/thumb`);
    await putMedia(thumbKey, thumbBytes.buffer as ArrayBuffer, thumbMime);
  }

  return Response.json({ ok: true, key, thumbKey, url: mediaUrl(key), thumbUrl: mediaUrl(thumbKey) });
};
