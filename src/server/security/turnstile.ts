import { env } from 'cloudflare:workers';

export async function verifyTurnstile(token: string | undefined, ip?: string): Promise<boolean> {
  const secret = env.TURNSTILE_SECRET;
  if (!secret) {
    if (env.TURNSTILE_SITE_KEY) {
      console.error('[turnstile] TURNSTILE_SECRET tidak dikonfigurasi; verifikasi ditolak.');
      return false;
    }
    return true;
  }
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set('remoteip', ip);
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });
    const data = (await response.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
