export { safeRedirectPath } from './url';

export function redirectTo(path: string, status: 303 | 302 = 303): Response {
  return new Response(null, { status, headers: { Location: path } });
}

export function withParams(
  path: string,
  params: Record<string, string | number | null | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== '') search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export function redirectWith(
  path: string,
  params: Record<string, string | number | null | undefined>,
  status: 303 | 302 = 303,
): Response {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== '') search.set(key, String(value));
  }
  const query = search.toString();
  return redirectTo(query ? `${path}?${query}` : path, status);
}
