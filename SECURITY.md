# Kebijakan Keamanan

## Melaporkan celah keamanan

Mohon **jangan** melaporkan celah keamanan lewat issue publik.

Laporkan secara privat lewat tab **Security → Report a vulnerability** di repo ini (GitHub Private Vulnerability Reporting). Sertakan:

- jenis celah dan dampaknya,
- langkah untuk mereproduksi,
- versi atau commit yang terdampak.

Laporan akan ditanggapi secepatnya. Setelah perbaikan dirilis, pelapor akan dicantumkan di catatan rilis kalau berkenan.

## Praktik keamanan proyek

- Magic link disimpan sebagai SHA-256, sekali pakai, dan kedaluwarsa dalam 20 menit.
- Sesi disimpan di D1 dan dapat dicabut saat logout atau perubahan role.
- Semua aksi sensitif dicek di server (`requireEditor` / `requireAdmin`) dan dicatat di `audit_logs`.
- Upload divalidasi ukuran, MIME, dan magic bytes; bukti transfer disimpan di bucket privat.
- Markdown disanitasi dengan allowlist sebelum disimpan sebagai HTML.
- Secret hanya lewat `wrangler secret put`, tidak pernah masuk repo.

## Versi yang didukung

Perbaikan keamanan hanya dirilis untuk versi terbaru di branch `main`.
