# Design System — Liquid Glass 27

Adopsi bahasa desain macOS 27 (desktop) dan iOS 27 (mobile): material kaca berlapis, sudut konsisten, toolbar unified dengan efek scroll-edge, sidebar kaca melayang, dan kontrol intensitas glass. Implementasi tidak memakai aset Apple; ikon memakai Lucide.

## Prinsip

1. **Keterbacaan dulu.** Teks selalu memakai warna solid, bukan transparan. Glass hanya untuk permukaan.
2. **Satu bahasa lintas perangkat.** Desktop memakai shell macOS (sidebar + toolbar), mobile memakai pola iOS (large title, bottom tab bar, sheet).
3. **Hemat GPU.** `backdrop-filter` hanya di nav, toolbar, kartu utama, modal, dan tab bar. Baris list memakai permukaan solid.
4. **Selalu ada fallback.** Tanpa `backdrop-filter`, dengan `prefers-reduced-transparency`, atau saat pengguna menyalakan "Kurangi transparansi", material berubah menjadi solid.

## Token

File: `src/styles/tokens.css`

| Kelompok | Token | Nilai |
|---|---|---|
| Radius | `--radius-window` / `--radius-panel` / `--radius-card` / `--radius-control` / `--radius-pill` | 26 / 22 / 18 / 10 / 999 px (kartu & list 22 px di layar sentuh) |
| Fill | `--fill` / `--fill-strong` | abu sistem untuk field, chip, seleksi sidebar |
| Blur | `--glass-blur-thin` / `--glass-blur` / `--glass-blur-thick` | 12 / 24 / 40 px |
| Saturasi | `--glass-sat` | 180% |
| Tint | `--glass-tint` | 0.45 (Jernih) → 0.95 (Berwarna), default 0.68 |
| Aksen | `--accent`, `--accent-soft`, `--accent-contrast` | dari pengaturan CMS |
| Gerak | `--ease-apple`, `--ease-spring`, `--dur-fast` / `--dur` / `--dur-slow` | 120 / 200 / 320 ms |

Warna mengikuti palet sistem: latar grouped `#f2f2f7`, sel `#ffffff`; dark mode (`data-theme="dark"` / `prefers-color-scheme`) memakai latar `#000000` dan sel `#1c1c1e`.

## Material

- `.glass` — panel regular, sidebar, kartu glass.
- `.glass-thin` — chip, tombol sekunder, tab bar.
- `.glass-thick` — modal, popover pengaturan, sheet.
- `.glass-panel` — panel konten besar (hero CTA, kartu statistik).
- `.solid-panel` — konten padat (form, tabel, artikel) agar teks tetap tajam.

Semua material memakai border 1px `--border-glass` dan inner highlight (specular) lewat `inset 0 1px 0`.

## Latar

Mesh gradient CSS murni (tanpa gambar) dengan hue berbeda per konteks:
- Direktori: biru aksen
- Loker: oranye
- Agenda: ungu
- Donasi: hijau
- Admin/akun: netral

Latar dibuat `position: fixed` di `body::before` agar tidak menambah biaya repaint saat scroll.

## Tipografi

- Stack: `system-ui, -apple-system, "SF Pro Text", "Segoe UI", Roboto`.
- Skala: display 40/48, title 28, headline 22, body 17, callout 16, subhead 15, footnote 13, caption 11.
- Heading besar memakai tracking negatif (`-0.025em` sampai `-0.045em`).
- Angka kartu dan tabel memakai `font-variant-numeric: tabular-nums`.

## Layout

### Desktop ≥1024px (macOS)
- Semua layout (publik, akun, admin) memakai shell yang sama: sidebar kaca melayang 240px (inset 10px, radius 22px) + area konten.
- Tinggi sidebar mengikuti isi, maksimal setinggi viewport dikurangi inset; kalau isinya lebih panjang, sidebar scroll sendiri.
- Footer berupa fine print satu-dua baris (tautan halaman info, kontak, sosial, hak cipta), bukan footer website multi-kolom.
- Sidebar: grup berjudul kecil non-kapital, item 32px, ikon berwarna aksen, item aktif memakai `--fill-strong`.
- Toolbar unified tanpa garis; material (blur + hairline) baru muncul saat konten di-scroll (`html[data-scrolled]`).
- Aksi toolbar dikelompokkan dalam kapsul kaca (`.toolbar-group`); kolom cari di posisi trailing.
- Kontrol desktop lebih rapat: tombol 36px, field 38px. Tidak ada hover lift; feedback lewat fill/shadow.

### Tablet 768–1023px (iPadOS)
- Sidebar disembunyikan; tab bar kapsul melayang di tengah (lebar maks 500px).
- Admin/akun memakai section tabs berbentuk kapsul yang bisa digeser.

### Mobile <768px (iOS)
- Nav bar ringkas (logo + grup tombol kapsul), transparan sampai konten di-scroll.
- Large title 34px; body 17px; field 17px agar Safari tidak auto-zoom.
- Bottom tab bar kapsul 5 item dengan seleksi pill dan safe-area inset.
- Daftar profil alumni berubah menjadi inset grouped list dengan separator.
- `.grid-2` selalu satu kolom, `.section-head` wrap, stat tile dua kolom.
- Menu yang tidak muat di tab bar (Berita, Donasi, Pasang loker, Kontak) tampil sebagai grouped list "Lainnya" di atas footer.
- `.data-table` berubah menjadi baris list: sel pertama jadi judul, sel lain jadi metadata, sel terakhir (aksi) rata kanan.
- Grid media dua kolom; halaman masuk/daftar rata atas.
- Target sentuh minimum 44px (CTA besar 50px).

## Kontrol Pengguna

`AppearanceMenu` (React island, `client:idle`):
- Tema: Sistem / Terang / Gelap.
- Intensitas Liquid Glass: slider 0.45–0.95 → `--glass-tint`.
- Kurangi transparansi: memaksa material solid.
- Disimpan di `localStorage`, diterapkan sebelum paint lewat inline script di `<head>`.

## Motion

- Durasi 120–320ms, easing `cubic-bezier(.32,.72,0,1)`.
- Press: `scale(0.975)`; hover kartu: `translateY(-2px)` + shadow.
- `prefers-reduced-motion: reduce` mematikan animasi dan transisi.

## Aksesibilitas

- Focus ring 3px aksen dengan offset 2px.
- Kontras teks minimal 4.5:1; glass selalu diberi tint solid yang cukup.
- Semua sheet/modal bisa ditutup `Esc`; dialog media memakai `<dialog>` native.
- Skip link ke `#konten` disediakan di semua layout.
- Form memakai label eksplisit; error ditampilkan sebagai teks, bukan hanya warna.

## Komponen

`src/components/glass/` untuk komponen permukaan (jika ditambah), `src/components/ui/` untuk tombol/badge/avatar, `src/components/public/` untuk kartu konten, `src/components/admin/` untuk editor markdown, media picker, dan uploader.

Aturan: komponen baru harus memakai token, bukan nilai warna/radius hardcode. Hindari menambah `backdrop-filter` pada elemen yang berulang banyak (baris tabel/list).
