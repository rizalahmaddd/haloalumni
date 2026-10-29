# Arsitektur

## Stack

| Lapisan | Teknologi |
|---|---|
| Framework | Astro 7 (SSR) + React islands |
| Runtime | Cloudflare Workers (`@astrojs/cloudflare`) |
| Database | Cloudflare D1 + Drizzle ORM |
| Media | Cloudflare R2 (`alumni-media`, `alumni-private`) |
| Styling | Tailwind CSS v4 + token CSS Liquid Glass |
| Email | Resend |
| Anti-bot | Cloudflare Turnstile |
| Test | Vitest + Playwright |

## Struktur folder

```
src/
  actions/      mutasi form (Astro Actions, Zod)
  components/   UI publik, akun, admin, kartu, glass
  layouts/      Base, Public, Account, Admin, Auth
  lib/          kompresi gambar sisi klien
  pages/        route publik, akun, admin, API, sitemap, 404/500
  server/       db, auth, email, storage, security, settings, url, cache
  styles/       token, material glass, global
workers/cron/   Worker terjadwal (maintenance + digest)
migrations/     migrasi D1 dari Drizzle
scripts/        seed, promote admin, backup, preflight deploy
tests/          unit + e2e
```

## Route utama

**Publik:** `/`, `/direktori`, `/direktori/[slug]`, `/loker`, `/loker/[slug]`, `/loker/pasang`, `/berita`, `/berita/[slug]`, `/berita/rss.xml`, `/agenda`, `/agenda/[slug]`, `/donasi`, `/donasi/[slug]`, `/kontak`, `/[page]`, `/verifikasi/[token]`, `/sitemap.xml`, `/robots.txt`.

**Auth & akun:** `/daftar`, `/masuk`, `/auth/verify`, `/auth/keluar`, `/akun`, `/akun/profil`, `/akun/kartu`, `/akun/loker`, `/akun/agenda`, `/akun/donasi`.

**CMS:** `/admin` dan modul alumni, loker, berita, agenda, donasi, halaman, media, pesan, pengguna, pengaturan, audit.

**API:** `/api/admin/media`, `/api/admin/upload`, `/api/admin/export/[type]`, `/api/admin/bukti/[id]`, `/api/akun/upload`, `/api/donasi/konfirmasi`, `/api/kesehatan`, `/media/[...key]`.

## Alur data

- Mutasi formulir memakai Astro Actions. Action mengembalikan `{ redirect }`, lalu middleware mengubahnya menjadi `303` dan menambahkan header keamanan.
- Sesi pengguna diambil middleware dari cookie `HttpOnly` dan diverifikasi ke tabel `sessions`.
- Markdown dirender dan disanitasi **saat simpan** (`content_html`), bukan saat request.
- Gambar dikompres di browser menjadi WebP sebelum diunggah ke R2.
- Halaman publik memakai `s-maxage` hanya untuk pengunjung anonim; area privat `no-store`.
- Cron Worker terpisah agar tidak bergantung pada custom entrypoint adapter Astro.

## Keamanan

- Magic link 32 karakter, SHA-256, TTL 20 menit, sekali pakai.
- RBAC server: editor untuk konten, admin untuk alumni, donasi, pengguna, export, dan bukti transfer.
- Rate limit D1 per IP/identitas untuk login, registrasi, kontak, loker, donasi, dan upload.
- Upload: batas ukuran, MIME allowlist, magic bytes, SVG ditolak.
- CSP, HSTS, COOP, `X-Frame-Options`, `Permissions-Policy` di middleware.
- Audit log untuk aksi sensitif dan kegagalan email.

## Batas free tier

- Tidak mencatat page view ke D1 (analitik diserahkan ke Cloudflare Web Analytics).
- Markdown dirender saat simpan; QR dibuat di server sebagai SVG.
- Halaman publik minim JavaScript; React hanya untuk editor CMS dan kartu alumni.
- Backdrop-filter dibatasi pada lapisan utama dan punya fallback solid.
