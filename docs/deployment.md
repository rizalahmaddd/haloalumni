# Deploy ke Cloudflare

Halo Alumni berjalan di Cloudflare Workers dengan D1 sebagai database, R2 untuk media, dan satu Worker terpisah untuk cron.

## 1. Prasyarat akun

- Akun Cloudflare dengan zona domain aktif (mis. `haloalumni.my.id`).
- R2 sudah diaktifkan di dashboard: **Storage & Databases → R2 → Enable R2**.
- Akun Resend dengan domain pengirim terverifikasi.

## 2. Buat resource

```bash
npx wrangler login
npx wrangler d1 create alumni-db
npx wrangler r2 bucket create alumni-media
npx wrangler r2 bucket create alumni-private
```

Salin `database_id` dari output D1.

## 3. Isi `wrangler.jsonc`

Sesuaikan:

- `account_id`: ID akun Cloudflare.
- `d1_databases[0].database_id`: hasil `wrangler d1 create`.
- `vars.PUBLIC_SITE_URL`: URL publik, mis. `https://haloalumni.my.id`.
- `vars.EMAIL_FROM`: pengirim yang domainnya terverifikasi di Resend.
- `routes`: custom domain. Hapus/ubah kalau memakai subdomain `workers.dev`.
- `r2_buckets`: nama bucket `alumni-media` dan `alumni-private`.

Samakan `database_id`, `account_id`, dan `EMAIL_FROM` di `workers/cron/wrangler.jsonc`.

## 4. Pasang secret

Secret tidak disimpan di repo:

```bash
npx wrangler secret put SESSION_SECRET     # openssl rand -base64 48
npx wrangler secret put RESEND_API_KEY     # permission "Sending access"
npx wrangler secret put ADMIN_EMAIL        # email admin untuk digest
```

Untuk Worker cron:

```bash
npx wrangler secret put RESEND_API_KEY --config workers/cron/wrangler.jsonc
npx wrangler secret put ADMIN_EMAIL --config workers/cron/wrangler.jsonc
```

Turnstile opsional. Kalau `TURNSTILE_SITE_KEY` diisi, `TURNSTILE_SECRET` **wajib** diisi juga — verifikasi akan fail-closed bila secret tidak ada.

## 5. Migrasi dan seed

Selalu migrasi **sebelum** deploy:

```bash
npm run db:migrate:remote
npm run db:seed:remote        # opsional, hanya untuk demo
```

## 6. Deploy

```bash
npm run deploy
npm run deploy:cron
```

`npm run deploy` menjalankan `scripts/preflight.mjs` dan menolak deploy bila `database_id` atau `PUBLIC_SITE_URL` masih placeholder. Build memakai `PUBLIC_SITE_URL` dari environment:

```bash
PUBLIC_SITE_URL=https://haloalumni.my.id npm run deploy
```

## 7. Resend

1. Buka [resend.com/domains](https://resend.com/domains), tambahkan `haloalumni.my.id`.
2. Tambahkan record SPF dan DKIM yang diberikan Resend ke DNS Cloudflare.
3. Tunggu status **Verified**.
4. Kirim uji dari halaman `/masuk` memakai email admin.

Tanpa domain terverifikasi, Resend menolak pengiriman dan kegagalan dicatat di `audit_logs` dengan action `email.failed`.

## 8. Cron

Worker `alumni-cron` berjalan harian pukul 18:00 UTC dan mingguan hari Minggu:

- menandai loker kedaluwarsa, kampanye ditutup, agenda selesai;
- menghapus sesi, magic link, dan rate limit lama;
- mengirim digest antrian moderasi harian dan rekap mingguan ke `ADMIN_EMAIL`.

Cron-only Worker memerlukan `workers_dev: false`, tetapi Cloudflare tetap meminta subdomain `workers.dev` terdaftar untuk akun tersebut.

## Checklist setelah deploy

- `https://haloalumni.my.id` mengembalikan 200 dan header CSP/HSTS.
- `/sitemap.xml` memuat profil, loker, berita, agenda, dan donasi.
- `/admin` mengarah ke `/masuk` tanpa sesi.
- Magic link diterima dan login berhasil.
- Upload foto dan bukti transfer berfungsi.
- `wrangler tail alumni` bersih dari error saat navigasi utama.
