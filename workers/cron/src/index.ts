interface Env {
  DB: D1Database;
  ADMIN_EMAIL?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
}

const DAY = 24 * 60 * 60 * 1000;

async function sendDigest(env: Env, counts: Record<string, number>): Promise<void> {
  if (!env.ADMIN_EMAIL || !env.RESEND_API_KEY) return;
  const rows = Object.entries(counts)
    .map(([label, value]) => `<li>${label}: <strong>${value}</strong></li>`)
    .join('');
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [env.ADMIN_EMAIL],
      subject: 'Ringkasan harian antrian alumni',
      html: `<h2>Ringkasan antrian</h2><ul>${rows}</ul><p>Buka CMS untuk menindaklanjuti.</p>`,
    }),
  }).catch((error) => console.error('[cron:email]', error));
}

async function sendWeeklyRecap(env: Env): Promise<void> {
  if (!env.ADMIN_EMAIL || !env.RESEND_API_KEY) return;
  const since = Date.now() - 7 * DAY;
  const [newUsers, newJobs, newDonations, totalAlumni] = await Promise.all([
    env.DB.prepare('SELECT count(*) AS value FROM users WHERE created_at >= ?').bind(since).first<{ value: number }>(),
    env.DB.prepare('SELECT count(*) AS value FROM jobs WHERE created_at >= ?').bind(since).first<{ value: number }>(),
    env.DB.prepare("SELECT count(*) AS value FROM donations WHERE status = 'verified' AND created_at >= ?")
      .bind(since)
      .first<{ value: number }>(),
    env.DB.prepare("SELECT count(*) AS value FROM alumni_profiles WHERE status = 'published'").first<{ value: number }>(),
  ]);
  const rows = [
    ['Pendaftar baru', Number(newUsers?.value ?? 0)],
    ['Loker baru', Number(newJobs?.value ?? 0)],
    ['Donasi terverifikasi', Number(newDonations?.value ?? 0)],
    ['Total alumni terbit', Number(totalAlumni?.value ?? 0)],
  ]
    .map(([label, value]) => `<li>${label}: <strong>${value}</strong></li>`)
    .join('');
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [env.ADMIN_EMAIL],
      subject: 'Rekap mingguan alumni',
      html: `<h2>Rekap 7 hari terakhir</h2><ul>${rows}</ul><p>Buka CMS untuk detail lengkap.</p>`,
    }),
  }).catch((error) => console.error('[cron:weekly]', error));
}

export default {
  async scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    const now = Date.now();
    ctx.waitUntil(
      (async () => {
        await env.DB.batch([
          env.DB.prepare(
            "UPDATE jobs SET status = 'expired', updated_at = ? WHERE status = 'published' AND expires_at IS NOT NULL AND expires_at < ?",
          ).bind(now, now),
          env.DB.prepare(
            "UPDATE donation_campaigns SET status = 'closed', updated_at = ? WHERE status = 'active' AND deadline IS NOT NULL AND deadline < ?",
          ).bind(now, now),
          env.DB.prepare(
            "UPDATE events SET status = 'done', updated_at = ? WHERE status = 'published' AND starts_at + ? < ?",
          ).bind(now, DAY, now),
          env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(now),
          env.DB.prepare('DELETE FROM magic_links WHERE expires_at < ?').bind(now - 7 * DAY),
          env.DB.prepare('DELETE FROM rate_limits WHERE window_start < ?').bind(now - DAY),
        ]);

        const [pendingAlumni, pendingJobs, pendingDonations, newMessages] = await Promise.all([
          env.DB.prepare("SELECT count(*) AS value FROM users WHERE status = 'pending'").first<{ value: number }>(),
          env.DB.prepare("SELECT count(*) AS value FROM jobs WHERE status = 'pending'").first<{ value: number }>(),
          env.DB.prepare("SELECT count(*) AS value FROM donations WHERE status = 'pending'").first<{ value: number }>(),
          env.DB.prepare("SELECT count(*) AS value FROM contact_messages WHERE status = 'new'").first<{ value: number }>(),
        ]);

        await sendDigest(env, {
          'Alumni menunggu': Number(pendingAlumni?.value ?? 0),
          'Loker menunggu': Number(pendingJobs?.value ?? 0),
          'Donasi menunggu': Number(pendingDonations?.value ?? 0),
          'Pesan baru': Number(newMessages?.value ?? 0),
        });

        if (event.cron === '0 18 * * 0') {
          await sendWeeklyRecap(env);
        }
      })(),
    );
  },
};
