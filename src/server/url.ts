export function normalizeHttpUrl(
  value: string | null | undefined,
  options: { allowMailto?: boolean } = {},
): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('//')) return null;
  if (options.allowMailto && /^mailto:[^\s]+$/i.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function safeRedirectPath(value: string | null | undefined, fallback = '/'): string {
  if (!value) return fallback;
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;
  return value;
}

export function sanitizeSearchTerm(value: string | null | undefined): string {
  return (value ?? '').replace(/[%_\\]/g, '').trim();
}
