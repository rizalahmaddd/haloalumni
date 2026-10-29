import { getActionContext } from 'astro:actions';
import { defineMiddleware } from 'astro:middleware';
import { getSessionUser, SESSION_COOKIE } from './server/auth/session';
import { isEditor } from './server/auth/types';
import { withParams } from './server/http';
import { getSettings } from './server/settings';
import { safeRedirectPath } from './server/url';
import { setNoCache, setPublicCache } from './server/cache';

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

function applySecurityHeaders(response: Response, secure: boolean): Response {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Content-Security-Policy', CSP);
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  if (secure) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  return response;
}

const PRIVATE_PREFIXES = ['/admin', '/akun', '/api', '/auth'];
const NEVER_CACHE_PATHS = ['/masuk', '/daftar', '/verifikasi', '/maintenance', '/berita/rss.xml'];

export const onRequest = defineMiddleware(async (context, next) => {
  const token = context.cookies.get(SESSION_COOKIE)?.value;
  context.locals.user = token ? await getSessionUser(token) : null;

  const { pathname } = context.url;
  const secure = context.url.protocol === 'https:';
  const redirect = (location: string, status: 302 | 303 = 303) =>
    applySecurityHeaders(context.redirect(safeRedirectPath(location, '/'), status), secure);

  if (pathname.startsWith('/admin')) {
    if (!context.locals.user) {
      return redirect(`/masuk?next=${encodeURIComponent(pathname)}`);
    }
    if (!isEditor(context.locals.user)) {
      return redirect('/akun');
    }
  }

  if (pathname.startsWith('/akun') && !context.locals.user) {
    return redirect(`/masuk?next=${encodeURIComponent(pathname)}`);
  }

  if (context.locals.user && (pathname === '/masuk' || pathname === '/daftar')) {
    return redirect('/akun');
  }

  const settings = await getSettings();
  if (
    settings['site.maintenance'] === 'true' &&
    pathname !== '/maintenance' &&
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/auth') &&
    !isEditor(context.locals.user)
  ) {
    return redirect('/maintenance', 302);
  }

  const response = await next();

  const payload = (
    context.locals as {
      _actionPayload?: {
        actionResult?: Parameters<ReturnType<typeof getActionContext>['deserializeActionResult']>[0];
      };
    }
  )._actionPayload;
  if (payload?.actionResult) {
    const { deserializeActionResult } = getActionContext(context);
    const result = deserializeActionResult(payload.actionResult);
    const target = (result.data as { redirect?: string } | undefined)?.redirect;
    if (target) {
      return redirect(target);
    }
    if (result.error) {
      const failure = result.error as { code?: string; message?: string };
      const message =
        failure.code === 'BAD_REQUEST'
          ? 'Data yang dikirim tidak valid. Periksa kembali isian Anda.'
          : (failure.message ?? 'Terjadi kesalahan. Silakan coba lagi.');
      return redirect(withParams(context.url.pathname, { error: message }));
    }
  }

  if (context.request.method === 'GET' && response.status < 400) {
    const isPrivate =
      PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix)) || pathname.startsWith('/verifikasi');
    const contentType = response.headers.get('Content-Type') ?? '';
    if (isPrivate || context.locals.user || token) {
      setNoCache(response.headers);
    } else if (!NEVER_CACHE_PATHS.includes(pathname) && contentType.includes('text/html')) {
      setPublicCache(response.headers, 60, 300);
    }
  }

  return applySecurityHeaders(response, secure);
});
