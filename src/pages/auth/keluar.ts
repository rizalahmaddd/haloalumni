import type { APIRoute } from 'astro';
import {
  clearSessionCookie,
  destroySession,
  SESSION_COOKIE,
} from '../../server/auth/session';

export const POST: APIRoute = async (context) => {
  const token = context.cookies.get(SESSION_COOKIE)?.value;
  if (token) await destroySession(token);
  clearSessionCookie(context.cookies);
  return context.redirect('/');
};
