import { defineAction } from 'astro:actions';
import { and, count, eq } from 'drizzle-orm';
import { z } from 'zod';
import { eventRegistrations, events, getDb } from '../server/db';
import { requireUser } from '../server/auth/guards';
import { withParams } from '../server/http';
import { optionalText } from '../server/form-schema';
import { newId, now } from '../server/util';

function fail(_context: unknown, path: string, message: string) {
  return { redirect: withParams(path, { error: message }) };
}

function ok(_context: unknown, path: string, message: string) {
  return { redirect: withParams(path, { sukses: message }) };
}

export const eventsActions = {
  rsvp: defineAction({
    accept: 'form',
    input: z.object({
      eventId: z.string().trim().min(1).max(40),
      slug: z.string().trim().min(1).max(140),
      phone: optionalText(30),
      guests: optionalText(3),
      note: optionalText(500),
    }),
    handler: async (input, context) => {
      const user = requireUser(context);
      if (!user.profile) {
        return fail(context, `/agenda/${input.slug}`, 'Lengkapi profil alumni terlebih dahulu.');
      }

      const db = getDb();
      const [event] = await db.select().from(events).where(eq(events.id, input.eventId)).limit(1);
      if (!event || event.status !== 'published') {
        return fail(context, `/agenda/${input.slug}`, 'Agenda tidak tersedia.');
      }
      if (event.registrationClosesAt && event.registrationClosesAt < now()) {
        return fail(context, `/agenda/${input.slug}`, 'Pendaftaran agenda sudah ditutup.');
      }

      const [existing] = await db
        .select({ id: eventRegistrations.id, status: eventRegistrations.status })
        .from(eventRegistrations)
        .where(
          and(
            eq(eventRegistrations.eventId, event.id),
            eq(eventRegistrations.userId, user.id),
          ),
        )
        .limit(1);

      let status: 'registered' | 'waitlist' = 'registered';
      if (!existing || existing.status === 'cancelled' || existing.status === 'waitlist') {
        const [total] = await db
          .select({ value: count() })
          .from(eventRegistrations)
          .where(
            and(
              eq(eventRegistrations.eventId, event.id),
              eq(eventRegistrations.status, 'registered'),
            ),
          );
        if (event.capacity && Number(total?.value ?? 0) >= event.capacity) {
          status = 'waitlist';
        }
      }

      const guests = Math.max(0, Math.min(5, Number.parseInt(input.guests, 10) || 0));

      if (existing) {
        await db
          .update(eventRegistrations)
          .set({
            phone: input.phone || null,
            guests,
            note: input.note || null,
            status: existing.status === 'attended' ? 'attended' : status,
          })
          .where(eq(eventRegistrations.id, existing.id));
      } else {
        await db.insert(eventRegistrations).values({
          id: newId(),
          eventId: event.id,
          userId: user.id,
          name: user.profile.fullName,
          email: user.email,
          phone: input.phone || null,
          guests,
          note: input.note || null,
          status,
          createdAt: now(),
        });
      }

      return ok(
        context,
        `/agenda/${input.slug}`,
        status === 'waitlist'
          ? 'Agenda sudah penuh. Anda masuk daftar tunggu.'
          : 'Pendaftaran agenda berhasil.',
      );
    },
  }),

  cancel: defineAction({
    accept: 'form',
    input: z.object({
      eventId: z.string().trim().min(1).max(40),
      slug: z.string().trim().min(1).max(140),
    }),
    handler: async (input, context) => {
      const user = requireUser(context);
      const db = getDb();
      const [existing] = await db
        .select({ id: eventRegistrations.id })
        .from(eventRegistrations)
        .where(
          and(
            eq(eventRegistrations.eventId, input.eventId),
            eq(eventRegistrations.userId, user.id),
          ),
        )
        .limit(1);
      if (!existing) {
        return fail(context, `/agenda/${input.slug}`, 'Anda belum terdaftar di agenda ini.');
      }
      await db
        .update(eventRegistrations)
        .set({ status: 'cancelled' })
        .where(eq(eventRegistrations.id, existing.id));
      return ok(context, `/agenda/${input.slug}`, 'Pendaftaran agenda dibatalkan.');
    },
  }),
};
