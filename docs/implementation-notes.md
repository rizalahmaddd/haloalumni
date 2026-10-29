# Catatan Implementasi

Dokumen ini mencatat keputusan teknis saat plan dieksekusi, termasuk penyimpangan dari `docs/plan.md`.

## Versi & lingkungan

- **Astro 7.4.2** + `@astrojs/cloudflare` 14.4.2 (memakai `@cloudflare/vite-plugin`, bukan output `_worker.js` lama).
- **Node 24** diwajibkan. `.nvmrc` diset ke `24`; Node 22.15 gagal karena Astro 7 meminta ≥22.23.4.
- `compatibility_date` diset **2026-10-26** karena workerd lokal belum mendukung 2026-10-28.
- Adapter memakai `imageService: 'passthrough'` dan `session: false` agar tidak membuat binding IMAGES/KV yang tidak dipakai. Hasil build hanya membawa `D1`, `R2 (MEDIA, PRIVATE)`, dan `ASSETS`.

## Perubahan cara kerja

1. **Redirect dari Astro Actions.** Astro 7 menyerialkan nilai balik action; mengembalikan `Response` menyebabkan error. Semua action mengembalikan `{ redirect: string }`, lalu middleware mengubahnya menjadi `303` setelah action dieksekusi. Redirect ini juga dipakai untuk error validasi (`BAD_REQUEST`) agar pengguna kembali ke form dengan pesan.
2. **Field form kosong = `null`.** Parser form Astro 7 mengubah field kosong menjadi `null`. Helper `optionalText()` dan `optionalCheckbox()` di `src/server/form-schema.ts` menormalkannya menjadi string kosong.
3. **Filter tanpa JavaScript.** Filter direktori/loker memakai checkbox + CSS (bukan `<details>`) agar panel selalu tampil di desktop dan bisa dibuka seperti sheet di mobile.
4. **Session tidak memakai Astro session/KV.** Sesi disimpan di tabel `sessions` (D1) dan cookie `HttpOnly`.
5. **Cron Worker terpisah.** `workers/cron` berjalan dengan trigger harian; tidak bergantung pada dukungan custom entrypoint adapter.
6. **Media default lewat Worker.** Route `/media/[...key]` menyajikan R2 dengan cache immutable. Set `MEDIA_PUBLIC_URL` bila ingin memakai custom domain R2.
7. **Tidak ada logging page view ke D1.** Analitik diserahkan ke Cloudflare Web Analytics agar write limit tidak habis.

## Data demo

- `scripts/seed.sql` berisi data dasar; `scripts/seed-realistic.sql` menambahkan 8 alumni, foto, bio, kontak, cover, agenda lampau, loker, dan donasi tambahan.
- Foto demo diunduh dari Unsplash ke `public/demo/` (portrait 640×640 WebP, cover 1200×675 WebP) agar tidak bergantung pada hotlink. Kredit ada di `docs/demo-credits.md`.
- Semua nama, perusahaan, kontak, dan tautan sosial bersifat fiktif. Email demo memakai domain `@haloalumni.my.id`, bukan `example.com`.
- Format tanggal/waktu memakai `Intl` dengan zona **Asia/Jakarta** agar tidak bergeser mengikuti timezone server (UTC).

## UI

- Desain mengikuti bahasa Liquid Glass macOS 27 / iOS 27: sidebar edge-to-edge, toolbar frosted, bottom tab bar mobile, slider intensitas glass, fallback transparansi.
- Section tabs horizontal hanya tampil di layar <1024px; desktop memakai sidebar.
- Preview markdown CMS disanitasi di browser; penyimpanan tetap disanitasi di server.
- Astro dev toolbar dimatikan untuk tampilan bersih dan performa dev.

## Pengujian

- `npm test`: 27 unit test (slug, token, markdown sanitization, helper form, format, URL builder, validasi URL & redirect).
- `npm run check`: 0 error.
- `npm run build` + `wrangler dev` (hasil build): route publik 200, `/admin` dan `/akun` redirect 302 tanpa sesi.
- Alur manual yang sudah diuji: request magic link → verifikasi → sesi, registrasi → approval admin + penerbitan kartu, update profil, submit loker, konfirmasi donasi, simpan bookmark.
- E2E Playwright tersedia (`playwright.config.ts`, `tests/e2e/smoke.spec.ts`); 5 smoke test lulus di Chromium. Jalankan `npx playwright install chromium` sekali di mesin baru, lalu `npm run test:e2e`.

## Batasan yang diketahui

- Sitemap dari `@astrojs/sitemap` hanya memuat route statis saat build; konten dinamis (profil, loker, berita) tidak otomatis masuk sitemap.
- Belum ada payment gateway; donasi diverifikasi manual.
- Belum ada email outbox/antrean; Resend dipanggil langsung (best-effort). Jika kuota 100/hari terlampaui, email akan gagal tanpa retry.
- CSP sudah aktif di middleware. Karena tema dimuat lewat inline script dan Turnstile memuat script eksternal, `script-src` masih mengizinkan `'unsafe-inline'` dan `challenges.cloudflare.com`; nonce belum diterapkan.
- Gambar tidak ditransformasi server (tanpa Cloudflare Images); kompresi dilakukan di browser.


## Audit & perbaikan lanjutan (Oktober 2026)

- **Auth**: Turnstile kini diverifikasi untuk login (sebelumnya hanya dirender). Verifikasi fail-closed bila site key ada tetapi secret tidak diisi. Rate limit login ditambah per IP (20/15 menit) di samping per IP+email. `?next=` diteruskan ke magic link dan divalidasi sebelum redirect.
- **RBAC**: approve/reject alumni, verifikasi donasi, kampanye + rekening, pengguna, audit, export CSV, dan bukti transfer kini wajib admin. Perubahan role mencabut seluruh sesi pengguna.
- **URL**: `applyUrl` divalidasi saat submit dan saat disimpan editor; hanya `http`, `https`, atau `mailto`. `next`/redirect internal menolak `//domain` dan URL absolut. URL sosial di pengaturan divalidasi, warna aksen dibatasi heksadesimal.
- **Upload**: cek `Content-Length` sebelum `formData()`, rate limit 20/jam, validasi magic bytes JPG/PNG/WebP/PDF, dan metadata `width`/`height` diisi dari kompresi browser. Bukti transfer disajikan sebagai attachment.
- **Sesi & logout**: GET dan POST `/auth/keluar` sama-sama menghapus sesi D1. `SESSION_SECRET` kosong di produksi memunculkan error, bukan fallback diam-diam.
- **Cache**: area `/admin`, `/akun`, `/api`, `/auth`, dan `/verifikasi` memakai `private, no-store`; halaman publik hanya di-cache untuk pengunjung anonim agar nama pengguna tidak bocor ke cache bersama.
- **Fitur**: waitlist RSVP dapat diakses lewat UI; `show_in_footer` dihormati; sitemap dinamis memuat profil/loker/berita/agenda/donasi; maintenance mode; anonimisasi akun; rekap cron mingguan; email moderasi loker & verifikasi donasi.
- **Media demo**: 30 aset `public/demo` kini juga terdaftar di tabel `media`, sehingga media picker terisi. Seed menambah akun pending, loker pending, pesan kontak, bookmark, dan audit log.
- **UI/a11y**: menu tampilan tidak lagi memakai React island (public page tanpa React), QR dirender server-side, filter mobile dapat dioperasikan keyboard, tab bar tidak menutupi footer, `role="alert"` pada pesan, `aria-current` pada chip, label pada tombol ikon, focus ring kolom pencarian, kontras teks tersier diperbaiki, fallback `backdrop-filter`, dan `scope="col"` pada tabel.
- **Cetak kartu**: halaman `/akun/kartu` memakai mode `print-card`; CSS print menyembunyikan seluruh UI dan hanya mencetak kartu pada satu halaman A4.
- **SEO**: JSON-LD Organization/Article/Event/JobPosting/Person, OG image per halaman, RSS dengan `content:encoded`, `lastBuildDate`, dan self link.
- **Ops**: `scripts/preflight.mjs` menolak deploy dengan `database_id`/`PUBLIC_SITE_URL` placeholder; workflow CI menjalankan test, check, dan build.

Batasan yang masih ada: antrean email/outbox belum ada (Resend tetap best-effort), payment gateway belum ada, transformasi gambar server belum ada, dan CSP masih memakai `'unsafe-inline'` untuk script tema.
