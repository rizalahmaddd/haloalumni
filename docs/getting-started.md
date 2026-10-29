# Memulai

Panduan menjalankan Halo Alumni di komputer lokal.

## Prasyarat

- Node.js 24 (lihat `.nvmrc`; Astro 7 membutuhkan ≥22.23.4).
- npm 10+.
- Login Wrangler hanya diperlukan untuk deploy, tidak untuk development lokal.

## Setup

```bash
nvm use
npm install
cp .env.example .dev.vars          # isi minimal SESSION_SECRET
npm run db:migrate:local
npm run db:seed:local
npm run dev
```

Buka `http://localhost:4321`.

Isi `SESSION_SECRET` dengan string acak, misalnya hasil `openssl rand -base64 48`.

## Login lokal

Masukkan email alumni demo (mis. `admin@haloalumni.my.id`). Tanpa `RESEND_API_KEY`, tautan masuk dicetak di terminal:

```
[vite] [magic-link:dev] http://localhost:4321/auth/verify?token=...&next=%2Fakun
```

Buka tautan tersebut untuk masuk.

## Data demo

Seed menyertakan akun admin dan 21 alumni dengan foto, bio, karier, loker, berita, agenda, donasi, media, pesan, bookmark, dan audit log. Semua email demo bisa dipakai login.

Reset data lokal kapan saja:

```bash
rm -rf .wrangler/state/v3/d1
npm run db:migrate:local && npm run db:seed:local
```

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Dev server Astro + binding lokal D1/R2 |
| `npm run build` | Build Worker |
| `npm run preview` | Jalankan hasil build lewat Wrangler |
| `npm run deploy` | Preflight + build + deploy Worker |
| `npm run deploy:cron` | Preflight + deploy Worker cron |
| `npm run check` | `astro check` (TypeScript) |
| `npm test` | Unit test (Vitest) |
| `npm run test:e2e` | E2E Playwright |
| `npm run db:generate` | Generate migrasi Drizzle |
| `npm run db:migrate:local` | Terapkan migrasi ke D1 lokal |
| `npm run db:migrate:remote` | Terapkan migrasi ke D1 production |
| `npm run db:seed:local` | Isi data demo lokal |
| `npm run db:promote -- email@domain.com` | Jadikan akun admin |
| `npm run db:backup` | Export D1 ke `backups/` |

## Catatan

- Binding `DB` (D1), `MEDIA`, dan `PRIVATE` (R2) disediakan otomatis oleh adapter Cloudflare memakai penyimpanan lokal di `.wrangler/`.
- Rate limit tetap aktif di lokal. Kalau terkena batas saat testing, hapus tabel `rate_limits` lewat `npm run db:migrate:local` ulang setelah reset data.
- Playwright membutuhkan browser sekali: `npx playwright install chromium`.
