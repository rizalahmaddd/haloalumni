import type { APIRoute } from 'astro';
import { desc, eq } from 'drizzle-orm';
import { getDb, posts } from '../../server/db';
import { getSettings } from '../../server/settings';
import { stripMarkdown } from '../../server/util';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async ({ site }) => {
  const settings = await getSettings();
  const origin = new URL(site ?? new URL('http://localhost:4321')).origin;
  const rows = await getDb()
    .select()
    .from(posts)
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.publishedAt))
    .limit(20);

  const items = rows
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${origin}/berita/${post.slug}</link>
      <guid isPermaLink="true">${origin}/berita/${post.slug}</guid>
      <pubDate>${new Date(post.publishedAt ?? post.createdAt).toUTCString()}</pubDate>
      <description>${escapeXml(post.excerpt ?? stripMarkdown(post.contentMd).slice(0, 300))}</description>
      ${post.category ? `<category>${escapeXml(post.category)}</category>` : ''}
      <content:encoded><![CDATA[${post.contentHtml}]]></content:encoded>
    </item>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(settings['site.name'])} — Berita</title>
    <link>${origin}/berita</link>
    <description>${escapeXml(settings['site.tagline'])}</description>
    <language>id-ID</language>
    <lastBuildDate>${new Date(rows[0]?.publishedAt ?? Date.now()).toUTCString()}</lastBuildDate>
    <atom:link href="${origin}/berita/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
};
