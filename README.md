# Halo Alumni

Direktori alumni + CMS untuk sekolah, kampus, atau pesantren: profil alumni, loker, berita, agenda, donasi, dan kartu anggota digital dengan verifikasi QR. Dibangun dengan Astro 7 di Cloudflare Workers, D1, dan R2.

[![Astro](https://img.shields.io/badge/Astro-7-FF5D01?logo=astro&logoColor=white)](https://astro.build)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers_·_D1_·_R2-F38020?logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/workers/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?logo=drizzle&logoColor=black)](https://orm.drizzle.team)
[![Resend](https://img.shields.io/badge/Resend-email-000000?logo=resend&logoColor=white)](https://resend.com)
[![Turnstile](https://img.shields.io/badge/Cloudflare-Turnstile-F38020?logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/turnstile/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Demo](https://img.shields.io/badge/Demo-haloalumni.my.id-1f7a4d?logo=googlechrome&logoColor=white)](https://haloalumni.my.id)

![Demo Halo Alumni: beranda, dashboard CMS, direktori alumni, dan kartu anggota digital](./docs/media/demo.webp)

---

## Preview

Tangkapan layar dari data seed demo. Desktop memakai sidebar kaca + toolbar, mobile memakai large title dan bottom tab bar.

### Halaman publik

| Beranda | Direktori alumni |
|---|---|
| ![Beranda](./docs/media/screenshots/beranda.webp) | ![Direktori alumni dengan filter](./docs/media/screenshots/direktori.webp) |
| **Profil alumni** | **Papan loker** |
| ![Profil publik alumni](./docs/media/screenshots/profil.webp) | ![Daftar loker dengan filter](./docs/media/screenshots/loker.webp) |
| **Detail loker** | **Berita** |
| ![Detail lowongan kerja](./docs/media/screenshots/loker-detail.webp) | ![Artikel berita](./docs/media/screenshots/berita.webp) |
| **Agenda & RSVP** | **Kampanye donasi** |
| ![Detail agenda dengan RSVP](./docs/media/screenshots/agenda.webp) | ![Kampanye donasi dan form konfirmasi transfer](./docs/media/screenshots/donasi.webp) |

### Akun alumni & verifikasi kartu

| Dashboard alumni | Kartu anggota digital |
|---|---|
| ![Ringkasan akun alumni](./docs/media/screenshots/akun.webp) | ![Kartu alumni dengan QR](./docs/media/screenshots/kartu.webp) |
| **Verifikasi publik (hasil scan QR)** | |
| ![Halaman verifikasi kartu](./docs/media/screenshots/verifikasi.webp) | |

### CMS admin

| Dashboard & antrian moderasi | Moderasi alumni |
|---|---|
| ![Dashboard CMS](./docs/media/screenshots/admin.webp) | ![Daftar alumni di CMS](./docs/media/screenshots/admin-alumni.webp) |
| **Verifikasi donasi** | **Media library** |
| ![Daftar donasi di CMS](./docs/media/screenshots/admin-donasi.webp) | ![Media library](./docs/media/screenshots/admin-media.webp) |

### Mode gelap

| Beranda | Dashboard CMS | Kartu alumni |
|---|---|---|
| ![Beranda mode gelap](./docs/media/screenshots/dark-beranda.webp) | ![Dashboard CMS mode gelap](./docs/media/screenshots/dark-admin.webp) | ![Kartu alumni mode gelap](./docs/media/screenshots/dark-kartu.webp) |

### Mobile

![Tampilan mobile: beranda, direktori, kartu alumni, dan dashboard CMS](./docs/media/screenshots/mobile.webp)

---

## Fitur

### Direktori & kartu alumni
- **Pencarian dan filter** angkatan, program, kota, industri, dan perusahaan dengan pagination server-side.
- **Profil publik** dengan kontrol privasi per-field; email dan nomor HP hanya untuk anggota yang login.
- **Kartu anggota digital** dengan QR verifikasi publik dan mode cetak yang hanya mencetak kartu, bukan seluruh halaman.
- **Relay kontak**: pesan dikirim lewat email tanpa mengekspos alamat alumni.

### Akun alumni
- **Login passwordless** dengan magic link sekali pakai; registrasi + approval admin.
- **Dashboard alumni**: edit profil dan foto, kartu anggota, bookmark loker, RSVP agenda, dan riwayat donasi.
- **Upload foto** dikompres di browser menjadi WebP sebelum masuk R2.

### Loker & komunitas
- **Papan loker** dengan filter kategori, lokasi, mode kerja, dan tipe pekerjaan.
- **Submit loker** oleh publik/alumni, moderasi admin, featured, dan kedaluwarsa otomatis.
- **Berita** dengan editor markdown, kategori, cover, dan RSS.
- **Agenda** dengan RSVP, kapasitas, daftar tunggu, dan export peserta.
- **Halaman statis** dari CMS (Tentang, Kebijakan Privasi, dll.).

### Donasi
- **Kampanye donasi** dengan target, deadline, dan rekening dari CMS.
- **Konfirmasi transfer** dengan unggah bukti ke bucket privat.
- **Verifikasi admin** dan donor wall; progress dihitung dari donasi terverifikasi.

### CMS
- Dashboard antrian moderasi dan statistik.
- Modul alumni, loker, berita, agenda, donasi, halaman, media library, pesan, pengguna/role, pengaturan, dan audit log.
- Export CSV (admin, tercatat di audit), maintenance mode, dan anonimisasi akun.
- Media picker dengan kompresi 1600px dan metadata gambar.

### Tampilan
- Bahasa desain Liquid Glass: sidebar kaca + toolbar di desktop, large title + bottom tab bar di mobile.
- Menu tampilan: tema Sistem/Terang/Gelap, intensitas glass, dan opsi kurangi transparansi (tersimpan per perangkat).
- PWA: manifest, ikon maskable, dan halaman offline lewat service worker.
- SEO: sitemap, robots, RSS berita, dan gambar OG default.

### Keamanan & operasional
- Sesi D1 yang bisa dicabut, magic link SHA-256 sekali pakai, Turnstile, dan rate limit per IP/identitas.
- RBAC dicek di server; aksi sensitif masuk `audit_logs`.
- Upload divalidasi ukuran, MIME, dan magic bytes; CSP, HSTS, COOP, dan `no-store` untuk area privat.
- Cron harian untuk maintenance + digest admin, serta rekap mingguan.
- Preflight deploy menolak `database_id`/`PUBLIC_SITE_URL` yang masih placeholder.
- GitHub Actions: CI (test, `astro check`, build) dan backup D1 mingguan.

## Stack

| Lapisan | Teknologi |
|---|---|
| Framework | Astro 7 (SSR) + React islands |
| Runtime | Cloudflare Workers |
| Database | Cloudflare D1 + Drizzle ORM |
| Media | Cloudflare R2 |
| Styling | Tailwind CSS v4 + token Liquid Glass |
| Email | Resend |
| Anti-bot | Cloudflare Turnstile |
| Test | Vitest + Playwright |

## Menjalankan lokal

Prasyarat: Node.js 24 (lihat `.nvmrc`; Astro 7 butuh minimal 22.23.4) dan akun Cloudflare (hanya untuk deploy).

```bash
nvm use
npm install
cp .env.example .dev.vars          # isi minimal SESSION_SECRET (mis. openssl rand -hex 32)
npm run db:migrate:local
npm run db:seed:local
npm run dev
```

Buka `http://localhost:4321`. Login dengan email alumni demo (mis. `admin@haloalumni.my.id`); tanpa `RESEND_API_KEY`, tautan masuk dicetak di log dev server (`[magic-link:dev]`, lihat juga `npx astro dev logs`).

Detail lengkap ada di [docs/getting-started.md](./docs/getting-started.md).

## Skrip npm

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Dev server Astro |
| `npm run check` | Type check (`astro check`) |
| `npm test` / `npm run test:e2e` | Unit test Vitest / smoke test Playwright |
| `npm run db:generate` | Generate migrasi dari schema Drizzle |
| `npm run db:promote -- email@domain [local\|remote]` | Jadikan akun sebagai admin |
| `npm run db:backup` | Export D1 remote ke folder `backups/` |

## Dokumentasi

| Dokumen | Isi |
|---|---|
| [Memulai](./docs/getting-started.md) | Menjalankan Halo Alumni di komputer lokal |
| [Deploy ke Cloudflare](./docs/deployment.md) | D1, R2, secret, migrasi, Resend, cron, dan custom domain |
| [Arsitektur](./docs/architecture.md) | Stack, struktur folder, route, alur data, dan keamanan |
| [Design system](./docs/design-system.md) | Token, material Liquid Glass, tipografi, dan komponen |
| [Catatan implementasi](./docs/implementation-notes.md) | Keputusan teknis, penyimpangan, dan batasan |
| [Plan](./docs/plan.md) | Rencana produk dan fase implementasi (arsip) |
| [Kredit demo](./docs/demo-credits.md) | Sumber foto demo |

## Deploy

```bash
npx wrangler login
npx wrangler d1 create alumni-db
npx wrangler r2 bucket create alumni-media
npx wrangler r2 bucket create alumni-private
npm run db:migrate:remote
npm run db:seed:remote        # opsional, data demo
npm run deploy
npm run deploy:cron
```

Isi `account_id`, `database_id`, `PUBLIC_SITE_URL`, dan `EMAIL_FROM` di `wrangler.jsonc` serta `workers/cron/wrangler.jsonc`, lalu pasang secret `SESSION_SECRET`, `RESEND_API_KEY`, dan `ADMIN_EMAIL`. Panduan lengkap: [docs/deployment.md](./docs/deployment.md).

## Status demo

Seed (`scripts/seed.sql` + `scripts/seed-realistic.sql`) berisi 21 alumni terbit, 3 pendaftar pending, 8 loker terbit + 2 pending, 4 berita, 4 agenda, 2 kampanye donasi, 8 donasi, 30 aset media, pesan kontak, bookmark, dan audit log. Akun demo memakai email `@haloalumni.my.id`; jangan gunakan data ini untuk produksi nyata tanpa mengganti kredensial dan konten.

## Berkontribusi

Pull request dan laporan bug sangat diterima. Baca [CONTRIBUTING.md](./CONTRIBUTING.md) dulu. Celah keamanan dilaporkan secara privat sesuai [SECURITY.md](./SECURITY.md).

## Lisensi

Dirilis di bawah [lisensi MIT](./LICENSE).

## Kontak

Dibuat oleh [@rizalahmaddd](https://github.com/rizalahmaddd). Butuh bantuan atau kustomisasi?

- WhatsApp: [+62 857-7777-5477](https://wa.me/6285777775477)
- Website: [solusikoding.com](https://solusikoding.com)
