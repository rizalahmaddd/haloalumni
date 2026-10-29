import { readFileSync } from 'node:fs';

const files = ['wrangler.jsonc', 'workers/cron/wrangler.jsonc'];
const problems = [];

for (const file of files) {
  const source = readFileSync(file, 'utf8');
  const ids = [...source.matchAll(/"database_id"\s*:\s*"([^"]+)"/g)].map((match) => match[1]);
  if (ids.length === 0) problems.push(`${file}: database_id tidak ditemukan.`);
  for (const id of ids) {
    if (/^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(id)) {
      problems.push(`${file}: database_id masih placeholder. Jalankan "wrangler d1 create alumni-db".`);
    }
  }
}

const config = readFileSync('wrangler.jsonc', 'utf8');
const siteUrl = config.match(/"PUBLIC_SITE_URL"\s*:\s*"([^"]+)"/)?.[1] ?? '';
if (!siteUrl || siteUrl.includes('localhost') || siteUrl.includes('example.com')) {
  problems.push(`wrangler.jsonc: PUBLIC_SITE_URL masih "${siteUrl || 'kosong'}". Isi domain produksi.`);
}

if (problems.length > 0) {
  console.error('\nPreflight gagal:\n');
  for (const problem of problems) console.error(`- ${problem}`);
  console.error('\nPerbaiki konfigurasi sebelum deploy.\n');
  process.exit(1);
}

console.log('Preflight OK: konfigurasi deploy terlihat siap.');
