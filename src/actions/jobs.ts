import { defineAction } from 'astro:actions';
import { env } from 'cloudflare:workers';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { getDb, jobBookmarks, jobs as jobsTable } from '../server/db';
import { requireUser } from '../server/auth/guards';
import { adminNotificationEmail } from '../server/email/templates';
import { sendEmailSafe } from '../server/email/client';
import { renderMarkdown } from '../server/markdown';
import { rateLimit } from '../server/security/rate-limit';
import { verifyTurnstile } from '../server/security/turnstile';
import { getSettings } from '../server/settings';
import { withParams } from '../server/http';
import { optionalCheckbox, optionalText } from '../server/form-schema';
import { uniqueSlug } from '../server/slug';
import { newId, now } from '../server/util';
import { normalizeHttpUrl, safeRedirectPath } from '../server/url';

function fail(_context: unknown, path: string, message: string) {
  return { redirect: withParams(path, { error: message }) };
}

function ok(_context: unknown, path: string, message: string) {
  return { redirect: withParams(path, { sukses: message }) };
}


export const jobsActions = {
  submit: defineAction({
    accept: 'form',
    input: z.object({
      title: z.string().trim().min(3).max(160),
      company: z.string().trim().min(2).max(120),
      location: optionalText(120),
      workMode: z.enum(['onsite', 'hybrid', 'remote']),
      employmentType: z.enum(['full', 'part', 'contract', 'internship', 'freelance']),
      category: optionalText(80),
      description: z.string().trim().min(30).max(8000),
      applyUrl: optionalText(500),
      contactEmail: optionalText(200),
      submitterName: optionalText(120),
      submitterEmail: optionalText(200),
      'cf-turnstile-response': optionalCheckbox,
    }),
    handler: async (input, context) => {
      const ip = context.clientAddress ?? 'unknown';
      if (!(await rateLimit('job-submit', ip, 3, 24 * 60 * 60 * 1000))) {
        return fail(context, '/loker/pasang', 'Batas pengiriman loker harian tercapai.');
      }
      if (!(await verifyTurnstile(input['cf-turnstile-response'], context.clientAddress))) {
        return fail(context, '/loker/pasang', 'Verifikasi keamanan gagal.');
      }
      const applyUrl = normalizeHttpUrl(input.applyUrl, { allowMailto: true });
      if (input.applyUrl && !applyUrl) {
        return fail(context, '/loker/pasang', 'URL lamaran harus diawali http:// atau https://.');
      }
      if (!applyUrl && !z.email().safeParse(input.contactEmail.toLowerCase()).success) {
        return fail(context, '/loker/pasang', 'Isi URL lamaran yang valid atau email kontak.');
      }

      const db = getDb();
      const slug = await uniqueSlug(`${input.title} ${input.company}`, async (candidate) => {
        const [row] = await db
          .select({ id: jobsTable.id })
          .from(jobsTable)
          .where(eq(jobsTable.slug, candidate))
          .limit(1);
        return Boolean(row);
      });

      const settings = await getSettings();
      const durationDays = Math.max(7, Number.parseInt(settings['jobs.duration_days'], 10) || 30);
      const timestamp = now();

      await db.insert(jobsTable).values({
        id: newId(),
        slug,
        title: input.title,
        company: input.company,
        location: input.location || null,
        workMode: input.workMode,
        employmentType: input.employmentType,
        category: input.category || null,
        descriptionMd: input.description,
        descriptionHtml: renderMarkdown(input.description),
        applyUrl,
        contactEmail: input.contactEmail.toLowerCase() || null,
        submittedByUserId: context.locals.user?.id ?? null,
        submitterName: input.submitterName || null,
        submitterEmail: input.submitterEmail.toLowerCase() || null,
        status: 'pending',
        expiresAt: timestamp + durationDays * 24 * 60 * 60 * 1000,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      if (env.ADMIN_EMAIL) {
        sendEmailSafe(
          {
            to: env.ADMIN_EMAIL,
            subject: `Loker baru menunggu moderasi: ${input.title}`,
            html: adminNotificationEmail({
              siteName: settings['site.name'],
              siteUrl: context.url.origin,
              title: 'Loker baru menunggu moderasi',
              lines: [
                `Posisi: ${input.title}`,
                `Perusahaan: ${input.company}`,
                `Lokasi: ${input.location || '-'}`,
                `Pengirim: ${input.submitterName || input.submitterEmail || 'Publik'}`,
              ],
              link: `${context.url.origin}/admin/loker`,
            }),
          },
          (promise) => context.locals.cfContext?.waitUntil(promise),
        );
      }

      return ok(context, '/loker/pasang', 'Loker dikirim dan menunggu moderasi admin.');
    },
  }),

  toggleBookmark: defineAction({
    accept: 'form',
    input: z.object({
      jobId: z.string().trim().min(1).max(40),
      next: z.string().trim().max(300),
    }),
    handler: async (input, context) => {
      const user = requireUser(context);
      const db = getDb();
      const next = safeRedirectPath(input.next, '/loker');
      const [job] = await db
        .select({ id: jobsTable.id })
        .from(jobsTable)
        .where(eq(jobsTable.id, input.jobId))
        .limit(1);
      if (!job) return fail(context, next, 'Loker tidak ditemukan.');
      const [existing] = await db
        .select({ userId: jobBookmarks.userId })
        .from(jobBookmarks)
        .where(and(eq(jobBookmarks.userId, user.id), eq(jobBookmarks.jobId, input.jobId)))
        .limit(1);

      if (existing) {
        await db
          .delete(jobBookmarks)
          .where(and(eq(jobBookmarks.userId, user.id), eq(jobBookmarks.jobId, input.jobId)));
        return ok(context, next, 'Bookmark dihapus.');
      }

      await db.insert(jobBookmarks).values({
        userId: user.id,
        jobId: input.jobId,
        createdAt: now(),
      });
      return ok(context, next, 'Loker disimpan ke bookmark.');
    },
  }),
};
