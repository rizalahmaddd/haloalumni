import { env } from 'cloudflare:workers';
import { now, sha256 } from '../util';
import { getSessionSecret } from '../auth/session';

export async function rateLimit(
  bucket: string,
  identity: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const key = `${bucket}:${await sha256(`${identity}:${getSessionSecret()}`)}`;
  const windowStart = Math.floor(now() / windowMs) * windowMs;
  const row = await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count) VALUES (?, ?, 1)
     ON CONFLICT(key) DO UPDATE SET
       count = CASE WHEN rate_limits.window_start = excluded.window_start
                    THEN rate_limits.count + 1 ELSE 1 END,
       window_start = excluded.window_start
     RETURNING count`,
  )
    .bind(key, windowStart)
    .first<{ count: number }>();
  return (row?.count ?? 1) <= limit;
}
