import { env } from 'cloudflare:workers';
import { newId } from '../util';

export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function sniffImageType(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png';
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp';
  }
  return null;
}

export function isPdf(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  );
}

export function mediaUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  if (/^https?:\/\//i.test(key)) return key;
  if (key.startsWith('/')) return key;
  const base = env.MEDIA_PUBLIC_URL?.replace(/\/$/, '');
  return base ? `${base}/${key}` : `/media/${key}`;
}

export function buildMediaKey(filename: string, prefix = 'uploads'): string {
  const extension = (filename.split('.').pop() ?? 'webp').toLowerCase().replace(/[^a-z0-9]/g, '');
  const date = new Date();
  const folder = `${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
  return `${prefix}/${folder}/${newId()}.${extension}`;
}

export async function putMedia(key: string, body: ArrayBuffer, contentType: string): Promise<void> {
  await env.MEDIA.put(key, body, {
    httpMetadata: {
      contentType,
      cacheControl: 'public, max-age=31536000, immutable',
    },
  });
}

export async function putPrivate(key: string, body: ArrayBuffer, contentType: string): Promise<void> {
  await env.PRIVATE.put(key, body, {
    httpMetadata: { contentType },
  });
}

export async function getPrivate(key: string): Promise<R2ObjectBody | null> {
  return env.PRIVATE.get(key);
}

export async function deleteMedia(key: string): Promise<void> {
  await env.MEDIA.delete(key);
}
