import { defineAction } from 'astro:actions';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { alumniProfiles, contactMessages, getDb, users } from '../server/db';
import { requireUser } from '../server/auth/guards';
import { hashIp } from '../server/auth/session';
import { sendEmailSafe } from '../server/email/client';
import { contactRelayEmail } from '../server/email/templates';
import { rateLimit } from '../server/security/rate-limit';
import { verifyTurnstile } from '../server/security/turnstile';
import { getSettings } from '../server/settings';
import { withParams } from '../server/http';
import { optionalCheckbox, optionalText } from '../server/form-schema';
import { uniqueSlug } from '../server/slug';
import { newId, now } from '../server/util';
import { normalizeHttpUrl } from '../server/url';

function fail(_context: unknown, path: string, message: string) {
  return { redirect: withParams(path, { error: message }) };
}

function ok(_context: unknown, path: string, message: string) {
  return { redirect: withParams(path, { sukses: message }) };
}

function cleanUrl(value: string): string | null {
  if (!value) return null;
  return normalizeHttpUrl(value);
}

function cleanMediaKey(value: string): string | null {
  if (!value) return null;
  if (value.startsWith('/') || /^https?:\/\//i.test(value)) return value;
  if (/^[a-zA-Z0-9][a-zA-Z0-9/_.-]*$/.test(value)) return value;
  return null;
}

function ownMediaKey(value: string, fallback: string | null, userId: string): string | null {
  const cleaned = cleanMediaKey(value);
  if (!cleaned) return fallback;
  if (cleaned === fallback) return cleaned;
  if (cleaned.startsWith(`alumni/${userId}/`)) return cleaned;
  return fallback;
}

export const alumni = {
  updateProfile: defineAction({
    accept: 'form',
    input: z.object({
      fullName: z.string().trim().min(2).max(120),
      angkatan: z.string().trim(),
      program: optionalText(120),
      nim: optionalText(40),
      phone: optionalText(30),
      whatsapp: optionalText(30),
      city: optionalText(80),
      province: optionalText(80),
      country: optionalText(80),
      company: optionalText(120),
      jobTitle: optionalText(120),
      industry: optionalText(80),
      bio: optionalText(1200),
      linkedinUrl: optionalText(300),
      instagramUrl: optionalText(300),
      websiteUrl: optionalText(300),
      photoKey: optionalText(300),
      thumbKey: optionalText(300),
      showEmail: optionalCheckbox,
      showPhone: optionalCheckbox,
      showWorkplace: optionalCheckbox,
      directoryVisible: optionalCheckbox,
    }),
    handler: async (input, context) => {
      const user = requireUser(context);
      if (input.fullName.length < 2) return fail(context, '/akun/profil', 'Nama lengkap wajib diisi.');
      const angkatan = Number.parseInt(input.angkatan, 10);
      if (!Number.isFinite(angkatan) || angkatan < 1900 || angkatan > 2100) {
        return fail(context, '/akun/profil', 'Angkatan tidak valid.');
      }

      const db = getDb();
      const [profile] = await db
        .select()
        .from(alumniProfiles)
        .where(eq(alumniProfiles.userId, user.id))
        .limit(1);

      const values = {
        fullName: input.fullName,
        angkatan,
        program: input.program || null,
        nim: input.nim || null,
        phone: input.phone || null,
        whatsapp: input.whatsapp || null,
        city: input.city || null,
        province: input.province || null,
        country: input.country || 'Indonesia',
        company: input.company || null,
        jobTitle: input.jobTitle || null,
        industry: input.industry || null,
        bio: input.bio || null,
        linkedinUrl: cleanUrl(input.linkedinUrl),
        instagramUrl: cleanUrl(input.instagramUrl),
        websiteUrl: cleanUrl(input.websiteUrl),
        photoKey: ownMediaKey(input.photoKey, profile?.photoKey ?? null, user.id),
        thumbKey: ownMediaKey(input.thumbKey, profile?.thumbKey ?? null, user.id),
        showEmail: Boolean(input.showEmail),
        showPhone: Boolean(input.showPhone),
        showWorkplace: Boolean(input.showWorkplace),
        directoryVisible: Boolean(input.directoryVisible),
        updatedAt: now(),
      };

      if (profile) {
        await db.update(alumniProfiles).set(values).where(eq(alumniProfiles.id, profile.id));
      } else {
        const slug = await uniqueSlug(input.fullName, async (candidate) => {
          const [row] = await db
            .select({ id: alumniProfiles.id })
            .from(alumniProfiles)
            .where(eq(alumniProfiles.slug, candidate))
            .limit(1);
          return Boolean(row);
        });
        await db.insert(alumniProfiles).values({
          id: newId(),
          userId: user.id,
          slug,
          status: 'draft',
          createdAt: now(),
          ...values,
        });
      }

      return ok(context, '/akun/profil', 'Profil berhasil disimpan.');
    },
  }),

  contactSupport: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().trim().min(2).max(120),
      email: z.string().trim().max(200),
      subject: optionalText(160),
      message: z.string().trim().min(10).max(2000),
      'cf-turnstile-response': optionalCheckbox,
    }),
    handler: async (input, context) => {
      if (!z.email().safeParse(input.email.toLowerCase()).success) {
        return fail(context, '/kontak', 'Email tidak valid.');
      }
      const ip = context.clientAddress ?? 'unknown';
      if (!(await rateLimit('contact-support', ip, 3, 24 * 60 * 60 * 1000))) {
        return fail(context, '/kontak', 'Batas pesan harian tercapai.');
      }
      if (!(await verifyTurnstile(input['cf-turnstile-response'], context.clientAddress))) {
        return fail(context, '/kontak', 'Verifikasi keamanan gagal.');
      }

      const settings = await getSettings();
      const db = getDb();
      await db.insert(contactMessages).values({
        id: newId(),
        name: input.name,
        email: input.email.toLowerCase(),
        subject: input.subject || 'Pesan dari halaman kontak',
        message: input.message,
        toUserId: null,
        ipHash: await hashIp(ip),
        status: 'new',
        createdAt: now(),
      });

      if (settings['site.email']) {
        sendEmailSafe(
          {
            to: settings['site.email'],
            replyTo: input.email,
            subject: `Pesan kontak: ${input.subject || input.name}`,
            html: contactRelayEmail({
              siteName: settings['site.name'],
              siteUrl: context.url.origin,
              fromName: input.name,
              fromEmail: input.email,
              message: input.message,
            }),
          },
          (promise) => context.locals.cfContext?.waitUntil(promise),
        );
      }

      return ok(context, '/kontak', 'Pesan Anda sudah dikirim ke sekretariat.');
    },
  }),

  contact: defineAction({
    accept: 'form',
    input: z.object({
      slug: z.string().trim().min(1).max(120),
      name: z.string().trim().min(2).max(120),
      email: z.string().trim().max(200),
      subject: optionalText(160),
      message: z.string().trim().min(10).max(2000),
      'cf-turnstile-response': optionalCheckbox,
    }),
    handler: async (input, context) => {
      const user = requireUser(context);
      if (user.status !== 'active') {
        return fail(context, `/direktori/${input.slug}`, 'Akun Anda belum diverifikasi admin.');
      }
      const [profile] = await getDb()
        .select({
          userId: alumniProfiles.userId,
          name: alumniProfiles.fullName,
          slug: alumniProfiles.slug,
          email: users.email,
        })
        .from(alumniProfiles)
        .innerJoin(users, eq(alumniProfiles.userId, users.id))
        .where(
          and(
            eq(alumniProfiles.slug, input.slug),
            eq(alumniProfiles.status, 'published'),
            eq(alumniProfiles.directoryVisible, true),
            eq(users.status, 'active'),
          ),
        )
        .limit(1);

      if (!profile) return fail(context, `/direktori/${input.slug}`, 'Profil tidak ditemukan.');
      if (context.locals.user?.id === profile.userId) {
        return fail(context, `/direktori/${input.slug}`, 'Anda tidak bisa mengirim pesan ke diri sendiri.');
      }
      if (!input.message || input.message.length < 10) {
        return fail(context, `/direktori/${input.slug}`, 'Pesan terlalu pendek.');
      }

      const ip = context.clientAddress ?? 'unknown';
      if (!(await rateLimit('contact', `${user.id}:${input.slug}`, 3, 24 * 60 * 60 * 1000))) {
        return fail(context, `/direktori/${input.slug}`, 'Batas pesan harian tercapai.');
      }
      if (!(await verifyTurnstile(input['cf-turnstile-response'], context.clientAddress))) {
        return fail(context, `/direktori/${input.slug}`, 'Verifikasi keamanan gagal.');
      }

      const db = getDb();
      await db.insert(contactMessages).values({
        id: newId(),
        name: input.name,
        email: user.email,
        subject: input.subject || 'Pesan dari direktori alumni',
        message: input.message,
        toUserId: profile.userId,
        ipHash: await hashIp(ip),
        status: 'new',
        createdAt: now(),
      });

      const settings = await getSettings();
      sendEmailSafe(
        {
          to: profile.email,
          replyTo: user.email,
          subject: `Pesan baru dari ${input.name}`,
          html: contactRelayEmail({
            siteName: settings['site.name'],
            siteUrl: context.url.origin,
            fromName: input.name,
            fromEmail: user.email,
            message: input.message,
            profileUrl: `${context.url.origin}/direktori/${profile.slug}`,
          }),
        },
        (promise) => context.locals.cfContext?.waitUntil(promise),
      );

      return ok(context, `/direktori/${input.slug}`, 'Pesan Anda sudah dikirim.');
    },
  }),
};
