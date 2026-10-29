import { env } from 'cloudflare:workers';
import { and, eq, gt } from 'drizzle-orm';
import { alumniProfiles, getDb, sessions, users } from '../db';
import { newToken, now, sha256 } from '../util';
import type { SessionUser } from './types';

export const SESSION_COOKIE = 'alumni_session';
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function getSessionSecret(): string {
  if (env.SESSION_SECRET) return env.SESSION_SECRET;
  const site = env.PUBLIC_SITE_URL ?? '';
  if (site && !/localhost|127\.0\.0\.1/.test(site)) {
    throw new Error('SESSION_SECRET wajib dikonfigurasi di produksi.');
  }
  return 'dev-only-insecure-secret';
}

export async function hashIp(ip: string | undefined): Promise<string | null> {
  if (!ip) return null;
  return sha256(`${ip}:${getSessionSecret()}`);
}

export async function createSession(
  userId: string,
  ip: string | undefined,
  userAgent: string | undefined,
): Promise<{ token: string; maxAge: number }> {
  const token = newToken(40);
  const db = getDb();
  await db.insert(sessions).values({
    id: await sha256(token),
    userId,
    expiresAt: now() + SESSION_TTL_MS,
    ipHash: await hashIp(ip),
    userAgent: userAgent?.slice(0, 200) ?? null,
    createdAt: now(),
  });
  return { token, maxAge: Math.floor(SESSION_TTL_MS / 1000) };
}

export async function getSessionUser(token: string): Promise<SessionUser | null> {
  if (!token) return null;
  const rows = await getDb()
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      status: users.status,
      profileId: alumniProfiles.id,
      slug: alumniProfiles.slug,
      fullName: alumniProfiles.fullName,
      angkatan: alumniProfiles.angkatan,
      program: alumniProfiles.program,
      cardNo: alumniProfiles.cardNo,
      cardToken: alumniProfiles.cardToken,
      profileStatus: alumniProfiles.status,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .leftJoin(alumniProfiles, eq(alumniProfiles.userId, users.id))
    .where(and(eq(sessions.id, await sha256(token)), gt(sessions.expiresAt, now())))
    .limit(1);

  const row = rows[0];
  if (!row || row.status === 'suspended') return null;

  return {
    id: row.id,
    email: row.email,
    role: row.role,
    status: row.status,
    profile:
      row.profileId && row.slug && row.fullName && row.angkatan != null
        ? {
            id: row.profileId,
            slug: row.slug,
            fullName: row.fullName,
            angkatan: row.angkatan,
            program: row.program,
            cardNo: row.cardNo,
            cardToken: row.cardToken,
            status: row.profileStatus ?? 'draft',
          }
        : null,
  };
}

export async function destroySession(token: string): Promise<void> {
  if (!token) return;
  await getDb().delete(sessions).where(eq(sessions.id, await sha256(token)));
}

export async function destroyAllSessions(userId: string): Promise<void> {
  await getDb().delete(sessions).where(eq(sessions.userId, userId));
}

export function setSessionCookie(
  cookies: { set: (name: string, value: string, options: Record<string, unknown>) => void },
  token: string,
  maxAge: number,
  secure = true,
): void {
  cookies.set(SESSION_COOKIE, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge,
  });
}

export function clearSessionCookie(cookies: {
  delete: (name: string, options: Record<string, unknown>) => void;
}): void {
  cookies.delete(SESSION_COOKIE, { path: '/' });
}
