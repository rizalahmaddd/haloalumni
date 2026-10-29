import { customAlphabet, nanoid } from 'nanoid';

export const now = () => Date.now();
export const newId = () => nanoid(21);

const TOKEN_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const newToken = (size = 32) => customAlphabet(TOKEN_ALPHABET, size)();
export const newCardToken = () => customAlphabet(TOKEN_ALPHABET, 16)();

export async function sha256(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function formatRupiah(value: number | null | undefined): string {
  if (value == null) return '-';
  return 'Rp' + new Intl.NumberFormat('id-ID').format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

export function formString(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export function formNullable(data: FormData, key: string): string | null {
  const value = formString(data, key);
  return value === '' ? null : value;
}

export function formInt(data: FormData, key: string): number | null {
  const value = formString(data, key);
  if (value === '') return null;
  const parsed = Number(value.replace(/[^\d-]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

export function formBool(data: FormData, key: string): boolean {
  const value = data.get(key);
  return value === 'on' || value === 'true' || value === '1';
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length - 1).trimEnd() + '…';
}

export function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function apiError(message: string, status = 400): Response {
  return Response.json({ ok: false, error: message }, { status });
}
