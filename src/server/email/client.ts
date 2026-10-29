import { env } from 'cloudflare:workers';
import { logAudit } from '../audit';

export interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail(email: OutgoingEmail): Promise<boolean> {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    console.info('[email:skipped]', email.to, email.subject);
    return false;
  }
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: [email.to],
        subject: email.subject,
        html: email.html,
        text: email.text,
        reply_to: email.replyTo,
      }),
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error('[email:failed]', response.status, detail);
      await logAudit({
        actorId: null,
        action: 'email.failed',
        entityType: 'email',
        entityId: email.to,
        meta: { subject: email.subject, status: response.status, detail: detail.slice(0, 300) },
      });
      return false;
    }
    return true;
  } catch (error) {
    console.error('[email:error]', error);
    await logAudit({
      actorId: null,
      action: 'email.error',
      entityType: 'email',
      entityId: email.to,
      meta: { subject: email.subject, error: String(error).slice(0, 300) },
    });
    return false;
  }
}

export function sendEmailSafe(email: OutgoingEmail, waitUntil?: (promise: Promise<unknown>) => void): void {
  const promise = sendEmail(email).catch(() => false);
  if (waitUntil) waitUntil(promise);
  else void promise;
}
