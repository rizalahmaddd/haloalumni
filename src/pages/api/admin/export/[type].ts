import type { APIRoute } from 'astro';
import { desc, eq } from 'drizzle-orm';
import {
  alumniProfiles,
  donationCampaigns,
  donations,
  eventRegistrations,
  getDb,
  users,
} from '../../../../server/db';
import { isAdmin } from '../../../../server/auth/types';
import { logAudit } from '../../../../server/audit';
import { formatDate } from '../../../../server/format';

function toCsv(rows: (string | number | null)[][]): string {
  const body = rows
    .map((row) =>
      row
        .map((cell) => {
          const raw = cell == null ? '' : String(cell);
          // Spreadsheet apps execute cells starting with these as formulas.
          const value = typeof cell === 'string' && /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
          return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
        })
        .join(','),
    )
    .join('\r\n');
  return `\uFEFF${body}`;
}

function download(csv: string, filename: string): Response {
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}

export const GET: APIRoute = async ({ locals, params, url }) => {
  if (!isAdmin(locals.user)) return new Response('Akses ditolak', { status: 403 });

  const db = getDb();
  const type = params.type ?? '';
  await logAudit({
    actorId: locals.user!.id,
    action: 'export.download',
    entityType: 'export',
    entityId: type,
    meta: { query: url.search },
  });

  if (type === 'alumni') {
    const rows = await db
      .select({
        fullName: alumniProfiles.fullName,
        email: users.email,
        angkatan: alumniProfiles.angkatan,
        program: alumniProfiles.program,
        nim: alumniProfiles.nim,
        city: alumniProfiles.city,
        company: alumniProfiles.company,
        jobTitle: alumniProfiles.jobTitle,
        status: alumniProfiles.status,
        cardNo: alumniProfiles.cardNo,
        phone: alumniProfiles.phone,
        verifiedAt: alumniProfiles.verifiedAt,
      })
      .from(alumniProfiles)
      .innerJoin(users, eq(alumniProfiles.userId, users.id))
      .orderBy(desc(alumniProfiles.angkatan));

    return download(
      toCsv([
        ['Nama', 'Email', 'Angkatan', 'Program', 'NIM', 'Kota', 'Perusahaan', 'Jabatan', 'Status', 'No. Kartu', 'Telepon', 'Terverifikasi'],
        ...rows.map((row) => [
          row.fullName,
          row.email,
          row.angkatan,
          row.program,
          row.nim,
          row.city,
          row.company,
          row.jobTitle,
          row.status,
          row.cardNo,
          row.phone,
          formatDate(row.verifiedAt),
        ]),
      ]),
      'alumni.csv',
    );
  }

  if (type === 'agenda') {
    const eventId = url.searchParams.get('eventId') ?? '';
    const rows = await db
      .select({
        name: eventRegistrations.name,
        email: eventRegistrations.email,
        phone: eventRegistrations.phone,
        guests: eventRegistrations.guests,
        status: eventRegistrations.status,
        note: eventRegistrations.note,
        createdAt: eventRegistrations.createdAt,
      })
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, eventId))
      .orderBy(desc(eventRegistrations.createdAt));

    return download(
      toCsv([
        ['Nama', 'Email', 'Telepon', 'Tamu', 'Status', 'Catatan', 'Waktu daftar'],
        ...rows.map((row) => [
          row.name,
          row.email,
          row.phone,
          row.guests,
          row.status,
          row.note,
          formatDate(row.createdAt),
        ]),
      ]),
      'peserta-agenda.csv',
    );
  }

  if (type === 'donasi') {
    const rows = await db
      .select({
        campaign: donationCampaigns.title,
        donor: donations.donorName,
        donorEmail: donations.donorEmail,
        amount: donations.amount,
        transferDate: donations.transferDate,
        status: donations.status,
        anonymous: donations.isAnonymous,
        createdAt: donations.createdAt,
      })
      .from(donations)
      .innerJoin(donationCampaigns, eq(donations.campaignId, donationCampaigns.id))
      .orderBy(desc(donations.createdAt));

    return download(
      toCsv([
        ['Kampanye', 'Donatur', 'Email', 'Nominal', 'Tanggal transfer', 'Status', 'Anonim', 'Dibuat'],
        ...rows.map((row) => [
          row.campaign,
          row.donor,
          row.donorEmail,
          row.amount,
          row.transferDate,
          row.status,
          row.anonymous ? 'Ya' : 'Tidak',
          formatDate(row.createdAt),
        ]),
      ]),
      'donasi.csv',
    );
  }

  return new Response('Tipe export tidak dikenal', { status: 404 });
};
