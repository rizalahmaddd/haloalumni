import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { donationCampaigns, donations, getDb } from '../../../server/db';
import { rateLimit } from '../../../server/security/rate-limit';
import { verifyTurnstile } from '../../../server/security/turnstile';
import { isPdf, putPrivate, sniffImageType } from '../../../server/storage/r2';
import { redirectWith } from '../../../server/http';
import { newId, now } from '../../../server/util';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const MAX_PROOF_BYTES = 5 * 1024 * 1024;
const MAX_FORM_BYTES = MAX_PROOF_BYTES + 128 * 1024;

export const POST: APIRoute = async (context) => {
  const declaredLength = Number.parseInt(context.request.headers.get('content-length') ?? '0', 10);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_FORM_BYTES) {
    return redirectWith('/donasi', { error: 'Ukuran bukti transfer maksimal 5MB.' });
  }

  const form = await context.request.formData();
  const string = (key: string) => {
    const value = form.get(key);
    return typeof value === 'string' ? value.trim() : '';
  };

  const campaignId = string('campaignId');
  const name = string('donorName');
  const email = string('email').toLowerCase();
  const amount = Number.parseInt(string('amount').replace(/[^\d]/g, ''), 10);
  const transferDate = string('transferDate');
  const message = string('message').slice(0, 500);
  const isAnonymous = form.get('isAnonymous') != null;
  const turnstile = string('cf-turnstile-response');
  const proof = form.get('proof');

  const [campaign] = await getDb()
    .select({ id: donationCampaigns.id, slug: donationCampaigns.slug, status: donationCampaigns.status })
    .from(donationCampaigns)
    .where(eq(donationCampaigns.id, campaignId))
    .limit(1);

  const back = campaign ? `/donasi/${campaign.slug}` : '/donasi';
  if (!campaign || campaign.status !== 'active') {
    return redirectWith(back, { error: 'Kampanye donasi tidak tersedia.' });
  }
  if (name.length < 2) return redirectWith(back, { error: 'Nama donatur wajib diisi.' });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return redirectWith(back, { error: 'Email tidak valid.' });
  }
  if (!Number.isFinite(amount) || amount < 1000) {
    return redirectWith(back, { error: 'Nominal minimal Rp1.000.' });
  }

  const ip = context.clientAddress ?? 'unknown';
  if (!(await rateLimit('donation', ip, 5, 24 * 60 * 60 * 1000))) {
    return redirectWith(back, { error: 'Batas konfirmasi donasi harian tercapai.' });
  }
  if (!(await verifyTurnstile(turnstile, context.clientAddress))) {
    return redirectWith(back, { error: 'Verifikasi keamanan gagal.' });
  }

  let proofKey: string | null = null;
  if (proof instanceof File && proof.size > 0) {
    if (!ALLOWED.has(proof.type)) {
      return redirectWith(back, { error: 'Bukti transfer harus berupa JPG, PNG, WebP, atau PDF.' });
    }
    if (proof.size > MAX_PROOF_BYTES) {
      return redirectWith(back, { error: 'Ukuran bukti transfer maksimal 5MB.' });
    }
    const bytes = new Uint8Array(await proof.arrayBuffer());
    const sniffed =
      proof.type === 'application/pdf' ? (isPdf(bytes) ? 'application/pdf' : null) : sniffImageType(bytes);
    if (!sniffed || !ALLOWED.has(sniffed) || sniffed !== proof.type) {
      return redirectWith(back, { error: 'Isi bukti transfer tidak sesuai dengan format file.' });
    }
    const extension = sniffed === 'application/pdf' ? 'pdf' : sniffed.split('/')[1];
    proofKey = `donations/${new Date().getFullYear()}/${newId()}.${extension}`;
    await putPrivate(proofKey, bytes.buffer as ArrayBuffer, sniffed);
  }

  await getDb().insert(donations).values({
    id: newId(),
    campaignId: campaign.id,
    donorName: name,
    donorEmail: email,
    donorUserId: context.locals.user?.id ?? null,
    amount,
    transferDate: transferDate || null,
    proofKey,
    message: message || null,
    isAnonymous,
    status: 'pending',
    createdAt: now(),
  });

  return redirectWith(back, {
    sukses: 'Konfirmasi donasi terkirim. Admin akan memverifikasi dalam 1–2 hari kerja.',
  });
};
