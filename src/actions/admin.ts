import { defineAction } from 'astro:actions';
import { env } from 'cloudflare:workers';
import { and, count, eq, isNull, ne } from 'drizzle-orm';
import { z } from 'zod';
import {
  alumniProfiles,
  contactMessages,
  donationCampaigns,
  donations,
  eventRegistrations,
  events,
  getDb,
  jobs,
  media,
  pages,
  posts,
  users,
} from '../server/db';
import { requireAdmin, requireEditor } from '../server/auth/guards';
import { destroyAllSessions } from '../server/auth/session';
import { logAudit } from '../server/audit';
import { sendEmailSafe } from '../server/email/client';
import {
  accountApprovedEmail,
  accountRejectedEmail,
  donationVerifiedEmail,
  jobModeratedEmail,
} from '../server/email/templates';
import { normalizeHttpUrl } from '../server/url';
import { fromDateTimeLocal } from '../server/format';
import { withParams } from '../server/http';
import { optionalCheckbox, optionalText } from '../server/form-schema';
import { renderMarkdown } from '../server/markdown';
import { defaultSettings, getSettings, saveSettings, type SettingsKey } from '../server/settings';
import { uniqueSlug } from '../server/slug';
import { newCardToken, newId, now } from '../server/util';

function done(_context: unknown, path: string, message: string) {
  return { redirect: withParams(path, { sukses: message }) };
}

function fail(_context: unknown, path: string, message: string) {
  return { redirect: withParams(path, { error: message }) };
}

async function uniqueFor(
  table: 'posts' | 'jobs' | 'events' | 'pages' | 'campaigns',
  base: string,
  excludeId?: string | null,
): Promise<string> {
  const db = getDb();
  return uniqueSlug(base, async (candidate) => {
    if (table === 'posts') {
      const [row] = await db
        .select({ id: posts.id })
        .from(posts)
        .where(excludeId ? and(eq(posts.slug, candidate), ne(posts.id, excludeId)) : eq(posts.slug, candidate))
        .limit(1);
      return Boolean(row);
    }
    if (table === 'jobs') {
      const [row] = await db
        .select({ id: jobs.id })
        .from(jobs)
        .where(excludeId ? and(eq(jobs.slug, candidate), ne(jobs.id, excludeId)) : eq(jobs.slug, candidate))
        .limit(1);
      return Boolean(row);
    }
    if (table === 'events') {
      const [row] = await db
        .select({ id: events.id })
        .from(events)
        .where(excludeId ? and(eq(events.slug, candidate), ne(events.id, excludeId)) : eq(events.slug, candidate))
        .limit(1);
      return Boolean(row);
    }
    if (table === 'pages') {
      const [row] = await db
        .select({ id: pages.id })
        .from(pages)
        .where(excludeId ? and(eq(pages.slug, candidate), ne(pages.id, excludeId)) : eq(pages.slug, candidate))
        .limit(1);
      return Boolean(row);
    }
    const [row] = await db
      .select({ id: donationCampaigns.id })
      .from(donationCampaigns)
      .where(
        excludeId
          ? and(eq(donationCampaigns.slug, candidate), ne(donationCampaigns.id, excludeId))
          : eq(donationCampaigns.slug, candidate),
      )
      .limit(1);
    return Boolean(row);
  });
}

async function generateCardNo(angkatan: number): Promise<string> {
  const db = getDb();
  const [row] = await db
    .select({ value: count() })
    .from(alumniProfiles)
    .where(eq(alumniProfiles.angkatan, angkatan));
  const base = Number(row?.value ?? 0);
  for (let index = 1; index <= 60; index += 1) {
    const candidate = `ALM-${angkatan}-${String(base + index).padStart(6, '0')}`;
    const [existing] = await db
      .select({ id: alumniProfiles.id })
      .from(alumniProfiles)
      .where(eq(alumniProfiles.cardNo, candidate))
      .limit(1);
    if (!existing) return candidate;
  }
  return `ALM-${angkatan}-${now().toString(36).toUpperCase().slice(-6)}`;
}

const optionalString = optionalText(1200);

export const admin = {
  moderateAlumni: defineAction({
    accept: 'form',
    input: z.object({
      userId: z.string().trim().min(1).max(40),
      action: z.enum(['approve', 'reject', 'hide', 'publish']),
      note: optionalString,
    }),
    handler: async (input, context) => {
      const actor = requireAdmin(context);
      const db = getDb();
      const [row] = await db
        .select({
          userId: users.id,
          email: users.email,
          profileId: alumniProfiles.id,
          fullName: alumniProfiles.fullName,
          angkatan: alumniProfiles.angkatan,
          cardNo: alumniProfiles.cardNo,
          cardToken: alumniProfiles.cardToken,
          status: alumniProfiles.status,
        })
        .from(users)
        .leftJoin(alumniProfiles, eq(alumniProfiles.userId, users.id))
        .where(eq(users.id, input.userId))
        .limit(1);

      if (!row) return fail(context, '/admin/alumni', 'Alumni tidak ditemukan.');
      const timestamp = now();

      if (input.action === 'approve') {
        if (row.status === 'published' && actor.role !== 'admin') {
          return fail(context, '/admin/alumni', 'Hanya admin yang dapat menyetujui ulang alumni aktif.');
        }
        const cardNo = row.cardNo ?? (row.angkatan ? await generateCardNo(row.angkatan) : null);
        const cardToken = row.cardToken ?? newCardToken();
        await db.batch([
          db.update(users).set({ status: 'active', updatedAt: timestamp }).where(eq(users.id, row.userId)),
          db
            .update(alumniProfiles)
            .set({ status: 'published', verifiedAt: timestamp, cardNo, cardToken, updatedAt: timestamp })
            .where(eq(alumniProfiles.userId, row.userId)),
        ]);

        const settings = await getSettings();
        sendEmailSafe(
          {
            to: row.email,
            subject: `Akun alumni Anda aktif · ${settings['site.name']}`,
            html: accountApprovedEmail({
              siteName: settings['site.name'],
              siteUrl: context.url.origin,
              name: row.fullName ?? 'Alumni',
            }),
          },
          (promise) => context.locals.cfContext?.waitUntil(promise),
        );

        await logAudit({
          actorId: actor.id,
          action: 'alumni.approve',
          entityType: 'user',
          entityId: row.userId,
          meta: { cardNo },
        });
        return done(context, '/admin/alumni', 'Alumni disetujui dan kartu alumni diterbitkan.');
      }

      if (input.action === 'reject') {
        await db.batch([
          db.update(users).set({ status: 'suspended', updatedAt: timestamp }).where(eq(users.id, row.userId)),
          db
            .update(alumniProfiles)
            .set({ status: 'hidden', updatedAt: timestamp })
            .where(eq(alumniProfiles.userId, row.userId)),
        ]);
        const settings = await getSettings();
        sendEmailSafe(
          {
            to: row.email,
            subject: `Pendaftaran alumni · ${settings['site.name']}`,
            html: accountRejectedEmail({
              siteName: settings['site.name'],
              siteUrl: context.url.origin,
              name: row.fullName ?? 'Alumni',
              note: input.note,
            }),
          },
          (promise) => context.locals.cfContext?.waitUntil(promise),
        );
        await logAudit({
          actorId: actor.id,
          action: 'alumni.reject',
          entityType: 'user',
          entityId: row.userId,
          meta: { note: input.note },
        });
        return done(context, '/admin/alumni', 'Pendaftaran alumni ditolak.');
      }

      const nextStatus = input.action === 'hide' ? 'hidden' : 'published';
      await db
        .update(alumniProfiles)
        .set({ status: nextStatus, updatedAt: timestamp })
        .where(eq(alumniProfiles.userId, row.userId));
      await logAudit({
        actorId: actor.id,
        action: `alumni.${input.action}`,
        entityType: 'user',
        entityId: row.userId,
      });
      return done(context, '/admin/alumni', 'Status profil diperbarui.');
    },
  }),

  updateAlumni: defineAction({
    accept: 'form',
    input: z.object({
      userId: z.string().trim().min(1).max(40),
      fullName: z.string().trim().min(2).max(120),
      angkatan: z.string().trim().max(10),
      program: optionalText(120),
      nim: optionalText(40),
      city: optionalText(80),
      company: optionalText(120),
      jobTitle: optionalText(120),
      industry: optionalText(80),
      bio: optionalText(1200),
      status: z.enum(['draft', 'published', 'hidden']),
      directoryVisible: optionalCheckbox,
    }),
    handler: async (input, context) => {
      const actor = requireEditor(context);
      const angkatan = Number.parseInt(input.angkatan, 10);
      if (!Number.isFinite(angkatan)) return fail(context, `/admin/alumni/${input.userId}`, 'Angkatan tidak valid.');
      const db = getDb();
      await db
        .update(alumniProfiles)
        .set({
          fullName: input.fullName,
          angkatan,
          program: input.program || null,
          nim: input.nim || null,
          city: input.city || null,
          company: input.company || null,
          jobTitle: input.jobTitle || null,
          industry: input.industry || null,
          bio: input.bio || null,
          status: input.status,
          directoryVisible: Boolean(input.directoryVisible),
          updatedAt: now(),
        })
        .where(eq(alumniProfiles.userId, input.userId));
      await logAudit({
        actorId: actor.id,
        action: 'alumni.update',
        entityType: 'user',
        entityId: input.userId,
      });
      return done(context, `/admin/alumni/${input.userId}`, 'Data alumni disimpan.');
    },
  }),

  savePost: defineAction({
    accept: 'form',
    input: z.object({
      id: optionalText(40),
      title: z.string().trim().min(3).max(180),
      slug: optionalText(160),
      excerpt: optionalText(400),
      category: optionalText(80),
      contentMd: z.string().trim().min(10).max(60000),
      coverKey: optionalText(300),
      status: z.enum(['draft', 'published']),
      publishedAt: optionalText(40),
    }),
    handler: async (input, context) => {
      const actor = requireEditor(context);
      const db = getDb();
      const id = input.id || null;
      const slug = input.slug
        ? await uniqueFor('posts', input.slug, id)
        : await uniqueFor('posts', input.title, id);
      const timestamp = now();
      const existingPublished = input.publishedAt ? fromDateTimeLocal(input.publishedAt) : null;
      const publishedAt = input.status === 'published' ? (existingPublished ?? timestamp) : null;
      const html = renderMarkdown(input.contentMd);

      if (id) {
        await db
          .update(posts)
          .set({
            title: input.title,
            slug,
            excerpt: input.excerpt || null,
            category: input.category || null,
            contentMd: input.contentMd,
            contentHtml: html,
            coverKey: input.coverKey || null,
            status: input.status,
            publishedAt,
            updatedAt: timestamp,
          })
          .where(eq(posts.id, id));
      } else {
        await db.insert(posts).values({
          id: newId(),
          title: input.title,
          slug,
          excerpt: input.excerpt || null,
          category: input.category || null,
          contentMd: input.contentMd,
          contentHtml: html,
          coverKey: input.coverKey || null,
          status: input.status,
          authorId: actor.id,
          publishedAt,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      }

      await logAudit({
        actorId: actor.id,
        action: id ? 'post.update' : 'post.create',
        entityType: 'post',
        entityId: id,
        meta: { slug },
      });
      return done(context, '/admin/berita', 'Berita disimpan.');
    },
  }),

  deletePost: defineAction({
    accept: 'form',
    input: z.object({ id: z.string().trim().min(1).max(40) }),
    handler: async (input, context) => {
      const actor = requireEditor(context);
      await getDb().delete(posts).where(eq(posts.id, input.id));
      await logAudit({ actorId: actor.id, action: 'post.delete', entityType: 'post', entityId: input.id });
      return done(context, '/admin/berita', 'Berita dihapus.');
    },
  }),

  saveJob: defineAction({
    accept: 'form',
    input: z.object({
      id: optionalText(40),
      title: z.string().trim().min(3).max(160),
      company: z.string().trim().min(2).max(120),
      slug: optionalText(160),
      location: optionalText(120),
      workMode: z.enum(['onsite', 'hybrid', 'remote']),
      employmentType: z.enum(['full', 'part', 'contract', 'internship', 'freelance']),
      category: optionalText(80),
      descriptionMd: z.string().trim().min(20).max(20000),
      salaryMin: optionalText(20),
      salaryMax: optionalText(20),
      applyUrl: optionalText(500),
      contactEmail: optionalText(200),
      companyLogoKey: optionalText(300),
      status: z.enum(['draft', 'pending', 'published', 'rejected', 'expired']),
      featured: optionalCheckbox,
      expiresAt: optionalText(40),
    }),
    handler: async (input, context) => {
      const actor = requireEditor(context);
      const db = getDb();
      const id = input.id || null;
      const slug = input.slug
        ? await uniqueFor('jobs', input.slug, id)
        : await uniqueFor('jobs', `${input.title} ${input.company}`, id);
      const timestamp = now();
      const applyUrl = normalizeHttpUrl(input.applyUrl, { allowMailto: true });
      if (input.applyUrl && !applyUrl) {
        return fail(context, id ? `/admin/loker/${id}` : '/admin/loker/baru', 'URL lamaran harus diawali http:// atau https://.');
      }
      const contactEmail = input.contactEmail.toLowerCase();
      if (contactEmail && !z.email().safeParse(contactEmail).success) {
        return fail(context, id ? `/admin/loker/${id}` : '/admin/loker/baru', 'Email kontak tidak valid.');
      }
      if (!applyUrl && !contactEmail) {
        return fail(context, id ? `/admin/loker/${id}` : '/admin/loker/baru', 'Isi URL lamaran atau email kontak.');
      }
      const values = {
        title: input.title,
        company: input.company,
        slug,
        location: input.location || null,
        workMode: input.workMode,
        employmentType: input.employmentType,
        category: input.category || null,
        descriptionMd: input.descriptionMd,
        descriptionHtml: renderMarkdown(input.descriptionMd),
        salaryMin: input.salaryMin ? Number.parseInt(input.salaryMin, 10) || null : null,
        salaryMax: input.salaryMax ? Number.parseInt(input.salaryMax, 10) || null : null,
        applyUrl,
        contactEmail: contactEmail || null,
        companyLogoKey: input.companyLogoKey || null,
        status: input.status,
        featured: Boolean(input.featured),
        expiresAt: fromDateTimeLocal(input.expiresAt),
        publishedAt: input.status === 'published' ? timestamp : null,
        updatedAt: timestamp,
      };

      if (id) {
        const [current] = await db
          .select({ status: jobs.status, publishedAt: jobs.publishedAt })
          .from(jobs)
          .where(eq(jobs.id, id))
          .limit(1);
        if (current?.status === 'published' && input.status === 'published' && current.publishedAt) {
          values.publishedAt = current.publishedAt;
        }
        await db.update(jobs).set(values).where(eq(jobs.id, id));
      } else {
        await db.insert(jobs).values({ id: newId(), createdAt: timestamp, ...values });
      }
      await logAudit({
        actorId: actor.id,
        action: id ? 'job.update' : 'job.create',
        entityType: 'job',
        entityId: id,
        meta: { slug },
      });
      return done(context, '/admin/loker', 'Loker disimpan.');
    },
  }),

  moderateJob: defineAction({
    accept: 'form',
    input: z.object({
      id: z.string().trim().min(1).max(40),
      action: z.enum(['publish', 'reject', 'expire', 'draft']),
      note: optionalString,
    }),
    handler: async (input, context) => {
      const actor = requireEditor(context);
      const status =
        input.action === 'publish'
          ? 'published'
          : input.action === 'reject'
            ? 'rejected'
            : input.action === 'expire'
              ? 'expired'
              : 'draft';
      const [job] = await getDb()
        .select({
          title: jobs.title,
          submitterEmail: jobs.submitterEmail,
          contactEmail: jobs.contactEmail,
          slug: jobs.slug,
        })
        .from(jobs)
        .where(eq(jobs.id, input.id))
        .limit(1);
      await getDb()
        .update(jobs)
        .set({
          status,
          moderatorNote: input.note || null,
          publishedAt: status === 'published' ? now() : undefined,
          updatedAt: now(),
        })
        .where(eq(jobs.id, input.id));

      const recipient = job?.submitterEmail ?? job?.contactEmail;
      if (job && recipient && (status === 'published' || status === 'rejected')) {
        const settings = await getSettings();
        sendEmailSafe(
          {
            to: recipient,
            subject:
              status === 'published'
                ? `Loker Anda sudah tayang · ${settings['site.name']}`
                : `Loker Anda belum dapat diterbitkan · ${settings['site.name']}`,
            html: jobModeratedEmail({
              siteName: settings['site.name'],
              siteUrl: context.url.origin,
              title: job.title,
              approved: status === 'published',
              note: input.note,
              jobUrl: status === 'published' ? `${context.url.origin}/loker/${job.slug}` : undefined,
            }),
          },
          (promise) => context.locals.cfContext?.waitUntil(promise),
        );
      }

      await logAudit({
        actorId: actor.id,
        action: `job.${input.action}`,
        entityType: 'job',
        entityId: input.id,
      });
      return done(context, '/admin/loker', 'Status loker diperbarui.');
    },
  }),

  deleteJob: defineAction({
    accept: 'form',
    input: z.object({ id: z.string().trim().min(1).max(40) }),
    handler: async (input, context) => {
      const actor = requireEditor(context);
      await getDb().delete(jobs).where(eq(jobs.id, input.id));
      await logAudit({ actorId: actor.id, action: 'job.delete', entityType: 'job', entityId: input.id });
      return done(context, '/admin/loker', 'Loker dihapus.');
    },
  }),

  saveEvent: defineAction({
    accept: 'form',
    input: z.object({
      id: optionalText(40),
      title: z.string().trim().min(3).max(180),
      slug: optionalText(160),
      descriptionMd: z.string().trim().min(10).max(20000),
      location: optionalText(180),
      mode: z.enum(['offline', 'online', 'hybrid']),
      startsAt: z.string().trim().max(40),
      endsAt: optionalText(40),
      registrationClosesAt: optionalText(40),
      capacity: optionalText(10),
      coverKey: optionalText(300),
      status: z.enum(['draft', 'published', 'cancelled', 'done']),
    }),
    handler: async (input, context) => {
      const actor = requireEditor(context);
      const startsAt = fromDateTimeLocal(input.startsAt);
      if (!startsAt) return fail(context, '/admin/agenda', 'Tanggal mulai wajib diisi.');
      const db = getDb();
      const id = input.id || null;
      const slug = input.slug
        ? await uniqueFor('events', input.slug, id)
        : await uniqueFor('events', input.title, id);
      const values = {
        title: input.title,
        slug,
        descriptionMd: input.descriptionMd,
        descriptionHtml: renderMarkdown(input.descriptionMd),
        location: input.location || null,
        mode: input.mode,
        startsAt,
        endsAt: fromDateTimeLocal(input.endsAt),
        registrationClosesAt: fromDateTimeLocal(input.registrationClosesAt),
        capacity: input.capacity ? Number.parseInt(input.capacity, 10) || null : null,
        coverKey: input.coverKey || null,
        status: input.status,
        updatedAt: now(),
      };
      if (id) await db.update(events).set(values).where(eq(events.id, id));
      else await db.insert(events).values({ id: newId(), createdAt: now(), ...values });
      await logAudit({
        actorId: actor.id,
        action: id ? 'event.update' : 'event.create',
        entityType: 'event',
        entityId: id,
      });
      return done(context, '/admin/agenda', 'Agenda disimpan.');
    },
  }),

  deleteEvent: defineAction({
    accept: 'form',
    input: z.object({ id: z.string().trim().min(1).max(40) }),
    handler: async (input, context) => {
      const actor = requireEditor(context);
      await getDb().delete(events).where(eq(events.id, input.id));
      await logAudit({ actorId: actor.id, action: 'event.delete', entityType: 'event', entityId: input.id });
      return done(context, '/admin/agenda', 'Agenda dihapus.');
    },
  }),

  updateRegistration: defineAction({
    accept: 'form',
    input: z.object({
      id: z.string().trim().min(1).max(40),
      status: z.enum(['registered', 'waitlist', 'cancelled', 'attended']),
      eventId: z.string().trim().min(1).max(40),
    }),
    handler: async (input, context) => {
      const actor = requireEditor(context);
      await getDb()
        .update(eventRegistrations)
        .set({ status: input.status })
        .where(eq(eventRegistrations.id, input.id));
      await logAudit({
        actorId: actor.id,
        action: 'event.registration.update',
        entityType: 'event_registration',
        entityId: input.id,
      });
      return done(context, `/admin/agenda/${input.eventId}`, 'Status peserta diperbarui.');
    },
  }),

  saveCampaign: defineAction({
    accept: 'form',
    input: z.object({
      id: optionalText(40),
      title: z.string().trim().min(3).max(180),
      slug: optionalText(160),
      descriptionMd: z.string().trim().min(10).max(20000),
      targetAmount: optionalText(20),
      bankInfo: optionalText(1000),
      deadline: optionalText(40),
      coverKey: optionalText(300),
      status: z.enum(['draft', 'active', 'closed']),
    }),
    handler: async (input, context) => {
      const actor = requireAdmin(context);
      const db = getDb();
      const id = input.id || null;
      const slug = input.slug
        ? await uniqueFor('campaigns', input.slug, id)
        : await uniqueFor('campaigns', input.title, id);
      const values = {
        title: input.title,
        slug,
        descriptionMd: input.descriptionMd,
        descriptionHtml: renderMarkdown(input.descriptionMd),
        targetAmount: Number.parseInt(input.targetAmount, 10) || 0,
        bankInfo: input.bankInfo || null,
        deadline: fromDateTimeLocal(input.deadline),
        coverKey: input.coverKey || null,
        status: input.status,
        updatedAt: now(),
      };
      if (id) await db.update(donationCampaigns).set(values).where(eq(donationCampaigns.id, id));
      else await db.insert(donationCampaigns).values({ id: newId(), createdAt: now(), ...values });
      await logAudit({
        actorId: actor.id,
        action: id ? 'campaign.update' : 'campaign.create',
        entityType: 'campaign',
        entityId: id,
      });
      return done(context, '/admin/donasi', 'Kampanye disimpan.');
    },
  }),

  deleteCampaign: defineAction({
    accept: 'form',
    input: z.object({ id: z.string().trim().min(1).max(40) }),
    handler: async (input, context) => {
      const actor = requireAdmin(context);
      await getDb().delete(donationCampaigns).where(eq(donationCampaigns.id, input.id));
      await logAudit({
        actorId: actor.id,
        action: 'campaign.delete',
        entityType: 'campaign',
        entityId: input.id,
      });
      return done(context, '/admin/donasi', 'Kampanye dihapus.');
    },
  }),

  verifyDonation: defineAction({
    accept: 'form',
    input: z.object({
      id: z.string().trim().min(1).max(40),
      action: z.enum(['verify', 'reject']),
    }),
    handler: async (input, context) => {
      const actor = requireAdmin(context);
      const [donation] = await getDb()
        .select({
          donorName: donations.donorName,
          donorUserId: donations.donorUserId,
          amount: donations.amount,
          campaignSlug: donationCampaigns.slug,
          campaignTitle: donationCampaigns.title,
        })
        .from(donations)
        .innerJoin(donationCampaigns, eq(donations.campaignId, donationCampaigns.id))
        .where(eq(donations.id, input.id))
        .limit(1);

      await getDb()
        .update(donations)
        .set({
          status: input.action === 'verify' ? 'verified' : 'rejected',
          verifiedBy: actor.id,
          verifiedAt: now(),
        })
        .where(eq(donations.id, input.id));

      if (donation?.donorUserId) {
        const [donor] = await getDb()
          .select({ email: users.email })
          .from(users)
          .where(eq(users.id, donation.donorUserId))
          .limit(1);
        if (donor) {
          const settings = await getSettings();
          sendEmailSafe(
            {
              to: donor.email,
              subject:
                input.action === 'verify'
                  ? `Donasi Anda sudah diverifikasi · ${settings['site.name']}`
                  : `Konfirmasi donasi · ${settings['site.name']}`,
              html: donationVerifiedEmail({
                siteName: settings['site.name'],
                siteUrl: context.url.origin,
                donorName: donation.donorName,
                campaignTitle: donation.campaignTitle,
                campaignUrl: `${context.url.origin}/donasi/${donation.campaignSlug}`,
                amount: donation.amount,
                verified: input.action === 'verify',
              }),
            },
            (promise) => context.locals.cfContext?.waitUntil(promise),
          );
        }
      }

      await logAudit({
        actorId: actor.id,
        action: `donation.${input.action}`,
        entityType: 'donation',
        entityId: input.id,
      });
      return done(context, '/admin/donasi', 'Konfirmasi donasi diperbarui.');
    },
  }),

  savePage: defineAction({
    accept: 'form',
    input: z.object({
      id: optionalText(40),
      title: z.string().trim().min(2).max(160),
      slug: optionalText(120),
      contentMd: z.string().trim().min(5).max(40000),
      status: z.enum(['draft', 'published']),
      showInFooter: optionalCheckbox,
      sortOrder: optionalText(10),
    }),
    handler: async (input, context) => {
      const actor = requireEditor(context);
      const db = getDb();
      const id = input.id || null;
      const slug = input.slug
        ? await uniqueFor('pages', input.slug, id)
        : await uniqueFor('pages', input.title, id);
      const values = {
        title: input.title,
        slug,
        contentMd: input.contentMd,
        contentHtml: renderMarkdown(input.contentMd),
        status: input.status,
        showInFooter: Boolean(input.showInFooter),
        sortOrder: Number.parseInt(input.sortOrder, 10) || 0,
        updatedAt: now(),
      };
      if (id) await db.update(pages).set(values).where(eq(pages.id, id));
      else await db.insert(pages).values({ id: newId(), ...values });
      await logAudit({
        actorId: actor.id,
        action: id ? 'page.update' : 'page.create',
        entityType: 'page',
        entityId: id,
      });
      return done(context, '/admin/halaman', 'Halaman disimpan.');
    },
  }),

  deletePage: defineAction({
    accept: 'form',
    input: z.object({ id: z.string().trim().min(1).max(40) }),
    handler: async (input, context) => {
      const actor = requireEditor(context);
      await getDb().delete(pages).where(eq(pages.id, input.id));
      await logAudit({ actorId: actor.id, action: 'page.delete', entityType: 'page', entityId: input.id });
      return done(context, '/admin/halaman', 'Halaman dihapus.');
    },
  }),

  updateSettings: defineAction({
    accept: 'form',
    input: z.object({}).catchall(z.string()),
    handler: async (input, context) => {
      const actor = requireAdmin(context);
      const entries: Record<string, string> = {};
      for (const key of Object.keys(defaultSettings)) {
        if (typeof input[key] === 'string') entries[key] = input[key];
      }
      if (Object.keys(entries).length === 0) {
        return fail(context, '/admin/pengaturan', 'Tidak ada pengaturan yang dikirim.');
      }
      if (entries['site.accent'] && !/^#[0-9a-f]{6}$/i.test(entries['site.accent'])) {
        return fail(context, '/admin/pengaturan', 'Warna aksen harus format heksadesimal, mis. #0071e3.');
      }
      if (entries['jobs.duration_days']) {
        const days = Number.parseInt(entries['jobs.duration_days'], 10);
        if (!Number.isFinite(days) || days < 7 || days > 365) {
          return fail(context, '/admin/pengaturan', 'Masa aktif loker harus antara 7 dan 365 hari.');
        }
        entries['jobs.duration_days'] = String(days);
      }
      if (entries['site.email'] && !z.email().safeParse(entries['site.email']).success) {
        return fail(context, '/admin/pengaturan', 'Email sekretariat tidak valid.');
      }
      for (const key of ['site.instagram', 'site.linkedin', 'site.facebook', 'site.youtube']) {
        if (entries[key] && !normalizeHttpUrl(entries[key])) {
          return fail(context, '/admin/pengaturan', `URL ${key.replace('site.', '')} tidak valid.`);
        }
      }
      await saveSettings(entries);
      await logAudit({
        actorId: actor.id,
        action: 'settings.update',
        entityType: 'settings',
        meta: { keys: Object.keys(entries) },
      });
      return done(context, '/admin/pengaturan', 'Pengaturan disimpan.');
    },
  }),

  updateUserRole: defineAction({
    accept: 'form',
    input: z.object({
      userId: z.string().trim().min(1).max(40),
      role: z.enum(['alumni', 'editor', 'admin']),
    }),
    handler: async (input, context) => {
      const actor = requireAdmin(context);
      if (input.userId === actor.id) {
        return fail(context, '/admin/pengguna', 'Anda tidak dapat mengubah role akun sendiri.');
      }
      await getDb()
        .update(users)
        .set({ role: input.role, updatedAt: now() })
        .where(eq(users.id, input.userId));
      await destroyAllSessions(input.userId);
      await logAudit({
        actorId: actor.id,
        action: 'user.role',
        entityType: 'user',
        entityId: input.userId,
        meta: { role: input.role },
      });
      return done(context, '/admin/pengguna', 'Role pengguna diperbarui. Sesi lama dicabut.');
    },
  }),

  deleteUser: defineAction({
    accept: 'form',
    input: z.object({
      userId: z.string().trim().min(1).max(40),
      confirm: optionalCheckbox,
    }),
    handler: async (input, context) => {
      const actor = requireAdmin(context);
      if (input.userId === actor.id) {
        return fail(context, '/admin/pengguna', 'Anda tidak dapat menghapus akun sendiri.');
      }
      if (!input.confirm) {
        return fail(context, '/admin/pengguna', 'Centang konfirmasi sebelum menghapus akun.');
      }
      const db = getDb();
      const [row] = await db
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);
      if (!row) return fail(context, '/admin/pengguna', 'Pengguna tidak ditemukan.');

      const timestamp = now();
      const anonymousName = 'Alumni Terhapus';
      await db.batch([
        db
          .update(users)
          .set({
            email: `deleted-${input.userId}@deleted.invalid`,
            status: 'suspended',
            role: 'alumni',
            updatedAt: timestamp,
          })
          .where(eq(users.id, input.userId)),
        db
          .update(alumniProfiles)
          .set({
            fullName: anonymousName,
            slug: `alumni-terhapus-${input.userId.slice(0, 8).toLowerCase()}`,
            program: null,
            nim: null,
            photoKey: null,
            thumbKey: null,
            city: null,
            province: null,
            company: null,
            jobTitle: null,
            industry: null,
            bio: null,
            linkedinUrl: null,
            instagramUrl: null,
            websiteUrl: null,
            phone: null,
            whatsapp: null,
            showEmail: false,
            showPhone: false,
            showWorkplace: false,
            directoryVisible: false,
            status: 'hidden',
            cardNo: null,
            cardToken: null,
            updatedAt: timestamp,
          })
          .where(eq(alumniProfiles.userId, input.userId)),
      ]);
      await destroyAllSessions(input.userId);
      await logAudit({
        actorId: actor.id,
        action: 'user.anonymize',
        entityType: 'user',
        entityId: input.userId,
        meta: { previousEmail: row.email },
      });
      return done(context, '/admin/pengguna', 'Akun dianonimkan dan seluruh sesi dicabut.');
    },
  }),

  updateMessageStatus: defineAction({
    accept: 'form',
    input: z.object({
      id: z.string().trim().min(1).max(40),
      status: z.enum(['new', 'read', 'replied', 'spam']),
    }),
    handler: async (input, context) => {
      const actor = requireEditor(context);
      await getDb()
        .update(contactMessages)
        .set({ status: input.status })
        .where(
          actor.role === 'admin'
            ? eq(contactMessages.id, input.id)
            : and(eq(contactMessages.id, input.id), isNull(contactMessages.toUserId)),
        );
      await logAudit({
        actorId: actor.id,
        action: 'message.status',
        entityType: 'contact_message',
        entityId: input.id,
      });
      return done(context, '/admin/pesan', 'Status pesan diperbarui.');
    },
  }),

  deleteMedia: defineAction({
    accept: 'form',
    input: z.object({ id: z.string().trim().min(1).max(40) }),
    handler: async (input, context) => {
      const actor = requireEditor(context);
      const db = getDb();
      const [row] = await db
        .select({ key: media.key })
        .from(media)
        .where(eq(media.id, input.id))
        .limit(1);
      if (row) {
        await env.MEDIA.delete(row.key).catch((error) => console.error('[media:delete]', error));
        await db.delete(media).where(eq(media.id, input.id));
      }
      await logAudit({ actorId: actor.id, action: 'media.delete', entityType: 'media', entityId: input.id });
      return done(context, '/admin/media', 'Media dihapus.');
    },
  }),
};

export type AdminSettingsInput = Partial<Record<SettingsKey, string>>;
