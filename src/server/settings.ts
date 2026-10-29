import { env } from 'cloudflare:workers';
import { getDb, settings } from './db';
import { now } from './util';

export const defaultSettings = {
  'site.name': 'Halo Alumni',
  'site.tagline': 'Terhubung, tumbuh, dan berkontribusi bersama.',
  'site.institution_type': 'Sekolah',
  'site.year_label': 'Angkatan',
  'site.program_label': 'Jurusan',
  'site.nim_label': 'NIS',
  'site.accent': '#0071e3',
  'site.logo_key': '',
  'site.hero_title': 'Satu jaringan untuk seluruh alumni.',
  'site.hero_subtitle':
    'Temukan teman seangkatan, akses peluang karier, ikuti agenda reuni, dan dukung program almamater.',
  'site.email': 'halo@haloalumni.my.id',
  'site.phone': '',
  'site.whatsapp': '',
  'site.address': '',
  'site.instagram': '',
  'site.facebook': '',
  'site.youtube': '',
  'site.linkedin': '',
  'site.footer_note': 'Dikelola oleh sekretariat alumni.',
  'site.maintenance': 'false',
  'site.maintenance_message': 'Situs sedang dalam perawatan. Silakan kembali beberapa saat lagi.',
  'jobs.duration_days': '30',
} as const;

export type SettingsKey = keyof typeof defaultSettings;
export type Settings = Record<SettingsKey, string>;

let cache: { at: number; values: Settings } | null = null;

export async function getSettings(): Promise<Settings> {
  if (cache && now() - cache.at < 10_000) return cache.values;
  const rows = await getDb().select().from(settings);
  const values = { ...defaultSettings } as Settings;
  for (const row of rows) {
    if (row.key in values) values[row.key as SettingsKey] = row.value;
  }
  cache = { at: now(), values };
  return values;
}

export function clearSettingsCache() {
  cache = null;
}

export async function saveSettings(entries: Record<string, string>): Promise<void> {
  const timestamp = now();
  const statements = Object.entries(entries).map(([key, value]) =>
    env.DB.prepare(
      `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    ).bind(key, value, timestamp),
  );
  if (statements.length) await env.DB.batch(statements);
  clearSettingsCache();
}

export function label(settings: Settings, key: 'year' | 'program' | 'nim'): string {
  if (key === 'year') return settings['site.year_label'];
  if (key === 'program') return settings['site.program_label'];
  return settings['site.nim_label'];
}
