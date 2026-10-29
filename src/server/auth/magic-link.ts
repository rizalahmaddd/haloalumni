import { and, eq, gt, isNull } from 'drizzle-orm';
import { getDb, magicLinks } from '../db';
import { newId, newToken, now, sha256 } from '../util';

const MAGIC_LINK_TTL_MS = 20 * 60 * 1000;

export async function issueMagicLink(userId: string): Promise<string> {
  const db = getDb();
  const token = newToken(32);
  await db
    .delete(magicLinks)
    .where(and(eq(magicLinks.userId, userId), isNull(magicLinks.usedAt)));
  await db.insert(magicLinks).values({
    id: newId(),
    userId,
    tokenHash: await sha256(token),
    expiresAt: now() + MAGIC_LINK_TTL_MS,
    createdAt: now(),
  });
  return token;
}

export async function isMagicLinkUsable(token: string): Promise<boolean> {
  if (!token) return false;
  const [row] = await getDb()
    .select({ id: magicLinks.id })
    .from(magicLinks)
    .where(
      and(
        eq(magicLinks.tokenHash, await sha256(token)),
        isNull(magicLinks.usedAt),
        gt(magicLinks.expiresAt, now()),
      ),
    )
    .limit(1);
  return Boolean(row);
}

export async function consumeMagicLink(token: string): Promise<string | null> {
  if (!token) return null;
  const db = getDb();
  const rows = await db
    .update(magicLinks)
    .set({ usedAt: now() })
    .where(
      and(
        eq(magicLinks.tokenHash, await sha256(token)),
        isNull(magicLinks.usedAt),
        gt(magicLinks.expiresAt, now()),
      ),
    )
    .returning({ userId: magicLinks.userId });
  return rows[0]?.userId ?? null;
}
