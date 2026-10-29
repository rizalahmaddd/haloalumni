import { defineAction } from 'astro:actions';
import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { getDb, alumniProfiles, users } from '../server/db';
import { issueMagicLink } from '../server/auth/magic-link';
import { sendEmailSafe } from '../server/email/client';
import {
  accountExistsEmail,
  adminNotificationEmail,
  magicLinkEmail,
  registrationReceivedEmail,
} from '../server/email/templates';
import { rateLimit } from '../server/security/rate-limit';
import { verifyTurnstile } from '../server/security/turnstile';
import { getSettings } from '../server/settings';
import { withParams } from '../server/http';
import { safeRedirectPath } from '../server/url';
import { optionalCheckbox, optionalText } from '../server/form-schema';
import { slugify, uniqueSlug } from '../server/slug';
import { newId, now } from '../server/util';

function fail(_context: unknown, path: string, message: string) {
  return { redirect: withParams(path, { error: message }) };
}

function ok(_context: unknown, path: string, message: string) {
  return { redirect: withParams(path, { sukses: message }) };
}

const emailField = z.string().trim().max(200);

export const auth = {
  requestLink: defineAction({
    accept: 'form',
    input: z.object({
      email: emailField,
      next: optionalText(300),
      'cf-turnstile-response': optionalCheckbox,
    }),
    handler: async (input, context) => {
      const email = input.email.toLowerCase();
      const valid = z.email().safeParse(email);
      if (!valid.success) return fail(context, '/masuk', 'Masukkan alamat email yang valid.');

      const ip = context.clientAddress ?? 'unknown';
      if (!(await rateLimit('login-ip', ip, 20, 15 * 60 * 1000))) {
        return fail(context, '/masuk', 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.');
      }
      if (!(await rateLimit('login', `${ip}:${email}`, 5, 15 * 60 * 1000))) {
        return fail(context, '/masuk', 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.');
      }
      if (!(await verifyTurnstile(input['cf-turnstile-response'], context.clientAddress))) {
        return fail(context, '/masuk', 'Verifikasi keamanan gagal. Muat ulang halaman dan coba lagi.');
      }

      const db = getDb();
      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (user && user.status !== 'suspended') {
        const token = await issueMagicLink(user.id);
        const settings = await getSettings();
        const origin = context.url.origin;
        const next = safeRedirectPath(input.next, '/akun');
        const link = `${origin}/auth/verify?${new URLSearchParams({ token, next }).toString()}`;
        sendEmailSafe(
          {
            to: email,
            subject: `Masuk ke ${settings['site.name']}`,
            html: magicLinkEmail({ siteName: settings['site.name'], siteUrl: origin, link }),
          },
          (promise) => context.locals.cfContext?.waitUntil(promise),
        );
        const isLocal =
          context.url.hostname === 'localhost' ||
          context.url.hostname === '127.0.0.1' ||
          context.url.hostname.endsWith('.local');
        if (!env.RESEND_API_KEY && isLocal) console.info('[magic-link:dev]', link);
      }

      return ok(
        context,
        '/masuk',
        'Jika email terdaftar, kami sudah mengirim tautan masuk. Periksa kotak masuk Anda.',
      );
    },
  }),

  register: defineAction({
    accept: 'form',
    input: z.object({
      fullName: z.string().trim().min(2).max(120),
      email: emailField,
      angkatan: z.string().trim().max(10),
      program: optionalText(120),
      nim: optionalText(40),
      phone: optionalText(30),
      consent: optionalCheckbox,
      'cf-turnstile-response': optionalCheckbox,
    }),
    handler: async (input, context) => {
      const email = input.email.toLowerCase();
      const emailValid = z.email().safeParse(email);
      if (!emailValid.success) return fail(context, '/daftar', 'Alamat email tidak valid.');
      if (input.fullName.length < 2) return fail(context, '/daftar', 'Nama lengkap wajib diisi.');
      if (!input.consent) return fail(context, '/daftar', 'Anda harus menyetujui kebijakan privasi.');
      if (input.angkatan.length < 2) return fail(context, '/daftar', 'Angkatan wajib diisi.');

      const ip = context.clientAddress ?? 'unknown';
      if (!(await rateLimit('register', ip, 3, 60 * 60 * 1000))) {
        return fail(context, '/daftar', 'Terlalu banyak pendaftaran dari jaringan ini. Coba lagi nanti.');
      }
      if (!(await verifyTurnstile(input['cf-turnstile-response'], context.clientAddress))) {
        return fail(context, '/daftar', 'Verifikasi keamanan gagal. Muat ulang halaman dan coba lagi.');
      }

      const db = getDb();
      const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
      if (existing) {
        const settings = await getSettings();
        sendEmailSafe(
          {
            to: email,
            subject: `Email sudah terdaftar · ${settings['site.name']}`,
            html: accountExistsEmail({
              siteName: settings['site.name'],
              siteUrl: context.url.origin,
            }),
          },
          (promise) => context.locals.cfContext?.waitUntil(promise),
        );
        return ok(
          context,
          '/daftar',
          'Pendaftaran Anda sudah dikirim. Kami akan mengirim email setelah admin menyetujui akun.',
        );
      }

      const slug = await uniqueSlug(input.fullName || slugify(input.fullName), async (candidate) => {
        const [row] = await db
          .select({ id: alumniProfiles.id })
          .from(alumniProfiles)
          .where(eq(alumniProfiles.slug, candidate))
          .limit(1);
        return Boolean(row);
      });

      const userId = newId();
      const timestamp = now();
      await db.batch([
        db.insert(users).values({
          id: userId,
          email,
          role: 'alumni',
          status: 'pending',
          createdAt: timestamp,
          updatedAt: timestamp,
        }),
        db.insert(alumniProfiles).values({
          id: newId(),
          userId,
          slug,
          fullName: input.fullName,
          angkatan: Number.parseInt(input.angkatan, 10) || new Date().getFullYear(),
          program: input.program || null,
          nim: input.nim || null,
          phone: input.phone || null,
          status: 'draft',
          createdAt: timestamp,
          updatedAt: timestamp,
        }),
      ]);

      const settings = await getSettings();
      sendEmailSafe(
        {
          to: email,
          subject: `Pendaftaran diterima · ${settings['site.name']}`,
          html: registrationReceivedEmail({
            siteName: settings['site.name'],
            siteUrl: context.url.origin,
            name: input.fullName,
          }),
        },
        (promise) => context.locals.cfContext?.waitUntil(promise),
      );

      if (env.ADMIN_EMAIL) {
        sendEmailSafe(
          {
            to: env.ADMIN_EMAIL,
            subject: `Pendaftar alumni baru: ${input.fullName}`,
            html: adminNotificationEmail({
              siteName: settings['site.name'],
              siteUrl: context.url.origin,
              title: 'Pendaftar alumni baru',
              lines: [
                `Nama: ${input.fullName}`,
                `Email: ${email}`,
                `Angkatan: ${input.angkatan}`,
                input.program ? `Program: ${input.program}` : 'Program: -',
              ],
              link: `${context.url.origin}/admin/alumni`,
            }),
          },
          (promise) => context.locals.cfContext?.waitUntil(promise),
        );
      }

      return ok(
        context,
        '/daftar',
        'Pendaftaran Anda sudah dikirim. Kami akan mengirim email setelah admin menyetujui akun.',
      );
    },
  }),
};
