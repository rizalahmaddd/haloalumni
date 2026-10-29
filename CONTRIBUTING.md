# Berkontribusi

Terima kasih sudah tertarik berkontribusi ke Halo Alumni!

## Alur

1. Buka issue dulu untuk perubahan besar, supaya arahnya disepakati sebelum mulai coding.
2. Fork repo, buat branch dari `main`.
3. Jalankan project di lokal mengikuti [docs/getting-started.md](./docs/getting-started.md).
4. Pastikan semua cek lolos sebelum membuat pull request:

   ```bash
   npm test
   npm run check
   npm run build
   ```

5. Kalau mengubah `src/server/db/schema.ts`, buat migrasi dengan `npm run db:generate` dan sertakan file migrasinya.

## Panduan kode

- TypeScript strict, tanpa `any` implisit.
- Teks yang terlihat pengguna memakai Bahasa Indonesia.
- Tulis komentar hanya untuk menjelaskan *alasan*, bukan mengulang apa yang dilakukan kode.
- Jangan pernah meng-commit secret, `.dev.vars`, `.env`, atau hasil `wrangler secret`.
- Jangan menambah dependency baru kalau bisa diselesaikan dengan API platform (Workers, D1, R2).

## Melaporkan bug

Gunakan template **Laporan bug** saat membuat issue. Sertakan langkah reproduksi, versi Node, dan pesan error. Untuk celah keamanan, ikuti [SECURITY.md](./SECURITY.md).
