export function setPublicCache(headers: Headers, seconds = 60, staleWhileRevalidate = 300): void {
  headers.set(
    'Cache-Control',
    `public, s-maxage=${seconds}, stale-while-revalidate=${staleWhileRevalidate}`,
  );
}

export function setNoCache(headers: Headers): void {
  headers.set('Cache-Control', 'private, no-store');
}
