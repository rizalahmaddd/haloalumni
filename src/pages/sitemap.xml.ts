import type { APIRoute } from 'astro';
import { and, eq, gt, isNull, or } from 'drizzle-orm';
import {
  alumniProfiles,
  donationCampaigns,
  events,
  getDb,
  jobs,
  pages,
  posts,
} from '../server/db';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const STATIC_PATHS = ['/', '/direktori', '/loker', '/loker/pasang', '/berita', '/agenda', '/donasi', '/kontak'];

export const GET: APIRoute = async ({ site, url }) => {
  const origin = (site ? new URL(site) : url).origin;
  const timestamp = Date.now();
  const paths = new Set(STATIC_PATHS);

  try {
    const db = getDb();
    const [profiles, jobRows, postRows, eventRows, campaignRows, pageRows] = await Promise.all([
      db
        .select({ slug: alumniProfiles.slug })
        .from(alumniProfiles)
        .where(and(eq(alumniProfiles.status, 'published'), eq(alumniProfiles.directoryVisible, true))),
      db
        .select({ slug: jobs.slug })
        .from(jobs)
        .where(
          and(
            eq(jobs.status, 'published'),
            or(isNull(jobs.expiresAt), gt(jobs.expiresAt, timestamp)),
          ),
        ),
      db.select({ slug: posts.slug }).from(posts).where(eq(posts.status, 'published')),
      db.select({ slug: events.slug }).from(events).where(eq(events.status, 'published')),
      db
        .select({ slug: donationCampaigns.slug })
        .from(donationCampaigns)
        .where(or(eq(donationCampaigns.status, 'active'), eq(donationCampaigns.status, 'closed'))),
      db.select({ slug: pages.slug }).from(pages).where(eq(pages.status, 'published')),
    ]);

    for (const row of profiles) paths.add(`/direktori/${row.slug}`);
    for (const row of jobRows) paths.add(`/loker/${row.slug}`);
    for (const row of postRows) paths.add(`/berita/${row.slug}`);
    for (const row of eventRows) paths.add(`/agenda/${row.slug}`);
    for (const row of campaignRows) paths.add(`/donasi/${row.slug}`);
    for (const row of pageRows) paths.add(`/${row.slug}`);
  } catch (error) {
    console.error('[sitemap] gagal memuat data dinamis', error);
  }

  const urls = [...paths]
    .map((path) => `  <url><loc>${escapeXml(`${origin}${path}`)}</loc></url>`)
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    },
  );
};
