-- Bagian data demo realistis: profil tambahan, foto, bio, cover, dan nominal donasi.
-- Dijalankan setelah seed.sql.

INSERT OR IGNORE INTO users (id, email, role, status, email_verified_at, created_at, updated_at) VALUES
  ('u-demo-0000000000013', 'aditya.pratama@haloalumni.my.id', 'alumni', 'active', 1790820000000, 1790820000000, 1790820000000),
  ('u-demo-0000000000014', 'citra.lestari@haloalumni.my.id', 'alumni', 'active', 1790820000000, 1790820000000, 1790820000000),
  ('u-demo-0000000000015', 'bimo.prasetyo@haloalumni.my.id', 'alumni', 'active', 1790820000000, 1790820000000, 1790820000000),
  ('u-demo-0000000000016', 'ayu.wulandari@haloalumni.my.id', 'alumni', 'active', 1790820000000, 1790820000000, 1790820000000),
  ('u-demo-0000000000017', 'rangga.maulana@haloalumni.my.id', 'alumni', 'active', 1790820000000, 1790820000000, 1790820000000),
  ('u-demo-0000000000018', 'dewi.kartika@haloalumni.my.id', 'alumni', 'active', 1790820000000, 1790820000000, 1790820000000),
  ('u-demo-0000000000019', 'hendra.gunawan@haloalumni.my.id', 'alumni', 'active', 1790820000000, 1790820000000, 1790820000000),
  ('u-demo-0000000000020', 'sri.wahyuni@haloalumni.my.id', 'alumni', 'active', 1790820000000, 1790820000000, 1790820000000);

INSERT OR IGNORE INTO alumni_profiles
  (id, user_id, slug, full_name, angkatan, program, nim, city, province, country, company, job_title, industry,
   bio, instagram_url, linkedin_url, phone, whatsapp, show_email, show_phone, show_workplace, directory_visible,
   status, card_no, card_token, verified_at, created_at, updated_at, photo_key, thumb_key)
VALUES
  ('p-demo-000000000013', 'u-demo-0000000000013', 'aditya-pratama', 'Aditya Pratama', 2008, 'Teknik Sipil', '08012', 'Jakarta', 'DKI Jakarta', 'Indonesia',
   'Waskita Karya', 'Project Manager', 'Konstruksi',
   'Project manager di Waskita Karya. Mengelola proyek jalan tol dan jembatan, dengan pengalaman lapangan di Sumatra dan Kalimantan.',
   NULL, 'https://www.linkedin.com/in/haloalumni-adityapratama', '+62 811-2345-6713', NULL, 1, 0, 1, 1,
   'published', 'ALM-2008-00001', 'ADITYA08CARD0001', 1790820000000, 1790820000000, 1790820000000,
   '/demo/alumni/aditya-pratama.webp', '/demo/alumni/aditya-pratama.webp'),
  ('p-demo-000000000014', 'u-demo-0000000000014', 'citra-lestari', 'Citra Lestari', 2012, 'Sastra Inggris', '12015', 'Jakarta', 'DKI Jakarta', 'Indonesia',
   'UNESCO Jakarta', 'Content Strategist', 'Media & Budaya',
   'Content strategist di UNESCO Jakarta. Menyusun kampanye komunikasi publik untuk pendidikan, budaya, dan literasi digital.',
   'https://www.instagram.com/haloalumni.citralestari', 'https://www.linkedin.com/in/haloalumni-citralestari', '+62 811-2345-6714', '+62 811-2345-6714', 1, 0, 1, 1,
   'published', 'ALM-2012-00002', 'CITRA12CARD00001', 1790820000000, 1790820000000, 1790820000000,
   '/demo/alumni/citra-lestari.webp', '/demo/alumni/citra-lestari.webp'),
  ('p-demo-000000000015', 'u-demo-0000000000015', 'bimo-prasetyo', 'Bimo Prasetyo', 2015, 'Hubungan Internasional', '15008', 'Jakarta', 'DKI Jakarta', 'Indonesia',
   'Kementerian Luar Negeri', 'Policy Analyst', 'Pemerintahan',
   'Policy analyst di Kementerian Luar Negeri. Menangani kerja sama ekonomi kawasan dan isu diplomasi digital.',
   NULL, 'https://www.linkedin.com/in/haloalumni-bimoprasetyo', '+62 811-2345-6715', NULL, 0, 0, 1, 1,
   'published', 'ALM-2015-00002', 'BIMO15CARD000001', 1790820000000, 1790820000000, 1790820000000,
   '/demo/alumni/bimo-prasetyo.webp', '/demo/alumni/bimo-prasetyo.webp'),
  ('p-demo-000000000016', 'u-demo-0000000000016', 'ayu-wulandari', 'Ayu Wulandari', 2017, 'Farmasi', '17021', 'Surabaya', 'Jawa Timur', 'Indonesia',
   'Kalbe Farma', 'Product Specialist', 'Kesehatan',
   'Product specialist di Kalbe Farma. Mengembangkan strategi produk kesehatan konsumen untuk wilayah Indonesia Timur.',
   'https://www.instagram.com/haloalumni.ayuwulandari', 'https://www.linkedin.com/in/haloalumni-ayuwulandari', '+62 811-2345-6716', '+62 811-2345-6716', 1, 1, 1, 1,
   'published', 'ALM-2017-00002', 'AYU17CARD0000001', 1792465200000, 1790820000000, 1790820000000,
   '/demo/alumni/ayu-wulandari.webp', '/demo/alumni/ayu-wulandari.webp'),
  ('p-demo-000000000017', 'u-demo-0000000000017', 'rangga-maulana', 'Rangga Maulana', 2013, 'Arsitektur', '13033', 'Bandung', 'Jawa Barat', 'Indonesia',
   'Studio Rangga', 'Architect & Founder', 'Arsitektur',
   'Arsitek dan pendiri Studio Rangga. Mengerjakan hunian tropis dan ruang publik dengan pendekatan material lokal.',
   'https://www.instagram.com/haloalumni.studiorangga', 'https://www.linkedin.com/in/haloalumni-ranggapratama', '+62 811-2345-6717', NULL, 1, 0, 1, 1,
   'published', 'ALM-2013-00002', 'RANGGA13CARD0001', 1792288800000, 1790820000000, 1790820000000,
   '/demo/alumni/rangga-maulana.webp', '/demo/alumni/rangga-maulana.webp'),
  ('p-demo-000000000018', 'u-demo-0000000000018', 'dewi-kartika', 'Dewi Kartika', 2019, 'Psikologi', '19018', 'Yogyakarta', 'DI Yogyakarta', 'Indonesia',
   'Traveloka', 'People Operations', 'Teknologi',
   'People operations di Traveloka. Menangani pengembangan organisasi, employer branding, dan program wellbeing karyawan.',
   'https://www.instagram.com/haloalumni.dewikartika', 'https://www.linkedin.com/in/haloalumni-dewikartika', '+62 811-2345-6718', NULL, 0, 0, 1, 1,
   'published', 'ALM-2019-00002', 'DEWI19CARD000001', 1792465200000, 1790820000000, 1790820000000,
   '/demo/alumni/dewi-kartika.webp', '/demo/alumni/dewi-kartika.webp'),
  ('p-demo-000000000019', 'u-demo-0000000000019', 'hendra-gunawan', 'Hendra Gunawan', 2004, 'Teknik Informatika', '04007', 'Jakarta', 'DKI Jakarta', 'Indonesia',
   'Arta Fintech', 'Chief Technology Officer', 'Teknologi',
   'CTO di Arta Fintech. Memimpin tim engineering untuk platform pembayaran yang melayani UMKM di seluruh Indonesia.',
   NULL, 'https://www.linkedin.com/in/haloalumni-hendragunawan', '+62 811-2345-6719', NULL, 0, 0, 1, 1,
   'published', 'ALM-2004-00001', 'HENDRA04CARD0001', 1790820000000, 1790820000000, 1790820000000,
   '/demo/alumni/hendra-gunawan.webp', '/demo/alumni/hendra-gunawan.webp'),
  ('p-demo-000000000020', 'u-demo-0000000000020', 'sri-wahyuni', 'Sri Wahyuni', 2006, 'Akuntansi', '06019', 'Jakarta', 'DKI Jakarta', 'Indonesia',
   'Unilever Indonesia', 'Finance Director', 'FMCG',
   'Finance director di Unilever Indonesia. Bertanggung jawab atas perencanaan keuangan, pelaporan, dan efisiensi rantai pasok.',
   NULL, 'https://www.linkedin.com/in/haloalumni-sriwahyuni', '+62 811-2345-6720', NULL, 0, 0, 1, 1,
   'published', 'ALM-2006-00002', 'SRI06CARD0000001', 1790820000000, 1790820000000, 1790820000000,
   '/demo/alumni/sri-wahyuni.webp', '/demo/alumni/sri-wahyuni.webp');

UPDATE alumni_profiles SET
  photo_key = '/demo/alumni/rina-pratiwi.webp', thumb_key = '/demo/alumni/rina-pratiwi.webp',
  bio = 'Product designer dengan 9 tahun pengalaman di marketplace dan fintech. Fokus pada riset pengguna, design system, dan mentoring desainer junior.',
  phone = '+62 811-2345-6701', whatsapp = '+62 811-2345-6701',
  instagram_url = 'https://www.instagram.com/haloalumni.rinapratiwi', linkedin_url = 'https://www.linkedin.com/in/haloalumni-rinapratiwi',
  show_email = 0, show_phone = 0, show_workplace = 1, directory_visible = 1, verified_at = 1792465200000
WHERE slug = 'rina-pratiwi';

UPDATE alumni_profiles SET
  photo_key = '/demo/alumni/bagas-saputra.webp', thumb_key = '/demo/alumni/bagas-saputra.webp',
  bio = 'Engineering manager di Gojek. Membangun tim platform yang menangani jutaan transaksi harian dan aktif sebagai mentor komunitas backend Indonesia.',
  phone = '+62 811-2345-6702', whatsapp = '+62 811-2345-6702',
  linkedin_url = 'https://www.linkedin.com/in/haloalumni-bagassaputra',
  show_email = 1, show_phone = 0, show_workplace = 1, directory_visible = 1, verified_at = 1792465200000
WHERE slug = 'bagas-saputra';

UPDATE alumni_profiles SET
  photo_key = '/demo/alumni/dinda-maheswari.webp', thumb_key = '/demo/alumni/dinda-maheswari.webp',
  bio = 'Audit senior di Deloitte Indonesia. Menangani klien manufaktur dan teknologi, dengan minat pada pelaporan keberlanjutan dan tata kelola.',
  phone = '+62 811-2345-6703', whatsapp = '+62 811-2345-6703',
  linkedin_url = 'https://www.linkedin.com/in/haloalumni-dindamaheswari',
  show_email = 1, show_phone = 0, show_workplace = 1, directory_visible = 1, verified_at = 1792465200000
WHERE slug = 'dinda-maheswari';

UPDATE alumni_profiles SET
  photo_key = '/demo/alumni/fikri-ramadhan.webp', thumb_key = '/demo/alumni/fikri-ramadhan.webp',
  bio = 'Project engineer di Pertamina. Mengawal proyek efisiensi energi dan transisi energi di kilang, serta gemar berbagi pengalaman K3.',
  phone = '+62 811-2345-6704', whatsapp = '+62 811-2345-6704',
  linkedin_url = 'https://www.linkedin.com/in/haloalumni-fikriramadhan',
  show_email = 0, show_phone = 1, show_workplace = 1, directory_visible = 1, verified_at = 1792465200000
WHERE slug = 'fikri-ramadhan';

UPDATE alumni_profiles SET
  photo_key = '/demo/alumni/nadya-putri.webp', thumb_key = '/demo/alumni/nadya-putri.webp',
  bio = 'Produser di Kompas TV. Memproduksi dokumenter dan liputan feature, dengan fokus pada isu sosial dan lingkungan.',
  phone = '+62 811-2345-6705', whatsapp = '+62 811-2345-6705',
  instagram_url = 'https://www.instagram.com/haloalumni.nadyaputri', linkedin_url = 'https://www.linkedin.com/in/haloalumni-nadyaputri',
  show_email = 0, show_phone = 0, show_workplace = 1, directory_visible = 1, verified_at = 1792465200000
WHERE slug = 'nadya-putri';

UPDATE alumni_profiles SET
  photo_key = '/demo/alumni/arya-wijaya.webp', thumb_key = '/demo/alumni/arya-wijaya.webp',
  bio = 'Founder Arya & Partners. Berpraktik di bidang hukum bisnis dan teknologi, mendampingi startup dari pendirian hingga pendanaan.',
  phone = '+62 811-2345-6706', whatsapp = '+62 811-2345-6706',
  linkedin_url = 'https://www.linkedin.com/in/haloalumni-aryawijaya', website_url = NULL,
  show_email = 1, show_phone = 0, show_workplace = 1, directory_visible = 1, verified_at = 1792465200000
WHERE slug = 'arya-wijaya';

UPDATE alumni_profiles SET
  photo_key = '/demo/alumni/salsabila-hakim.webp', thumb_key = '/demo/alumni/salsabila-hakim.webp',
  bio = 'Dokter umum di RSCM. Aktif dalam program kesehatan komunitas dan edukasi gizi untuk keluarga prasejahtera.',
  phone = '+62 811-2345-6707', whatsapp = '+62 811-2345-6707',
  linkedin_url = 'https://www.linkedin.com/in/haloalumni-salsabilahakim',
  show_email = 0, show_phone = 0, show_workplace = 1, directory_visible = 1, verified_at = 1792465200000
WHERE slug = 'salsabila-hakim';

UPDATE alumni_profiles SET
  photo_key = '/demo/alumni/reza-fadillah.webp', thumb_key = '/demo/alumni/reza-fadillah.webp',
  bio = 'Solution architect di Schneider Electric. Merancang otomasi industri dan sistem energi untuk pabrik di Jawa dan Sumatra.',
  phone = '+62 811-2345-6708', whatsapp = '+62 811-2345-6708',
  linkedin_url = 'https://www.linkedin.com/in/haloalumni-rezafadillah',
  show_email = 1, show_phone = 1, show_workplace = 1, directory_visible = 1, verified_at = 1792000000000
WHERE slug = 'reza-fadillah';

UPDATE alumni_profiles SET
  photo_key = '/demo/alumni/intan-permata.webp', thumb_key = '/demo/alumni/intan-permata.webp',
  bio = 'Brand designer lepas. Membantu UMKM dan startup membangun identitas visual, dari logo hingga panduan merek.',
  phone = '+62 811-2345-6709', whatsapp = '+62 811-2345-6709',
  instagram_url = 'https://www.instagram.com/haloalumni.intanpermata', website_url = NULL,
  show_email = 1, show_phone = 0, show_workplace = 1, directory_visible = 1, verified_at = 1792000000000
WHERE slug = 'intan-permata';

UPDATE alumni_profiles SET
  photo_key = '/demo/alumni/yoga-santoso.webp', thumb_key = '/demo/alumni/yoga-santoso.webp',
  bio = 'Relationship manager di Bank Mandiri. Mendampingi UMKM di Malang Raya untuk pembiayaan dan literasi keuangan.',
  phone = '+62 811-2345-6710', whatsapp = '+62 811-2345-6710',
  linkedin_url = 'https://www.linkedin.com/in/haloalumni-yogasantoso',
  show_email = 0, show_phone = 1, show_workplace = 1, directory_visible = 1, verified_at = 1792000000000
WHERE slug = 'yoga-santoso';

UPDATE alumni_profiles SET
  photo_key = '/demo/alumni/melati-anggraini.webp', thumb_key = '/demo/alumni/melati-anggraini.webp',
  bio = 'Data analyst di BPS. Mengolah data survei sosial-ekonomi dan membangun dasbor untuk kebijakan berbasis bukti.',
  phone = '+62 811-2345-6711', whatsapp = '+62 811-2345-6711',
  linkedin_url = 'https://www.linkedin.com/in/haloalumni-melatianggraini',
  show_email = 1, show_phone = 0, show_workplace = 1, directory_visible = 1, verified_at = 1792000000000
WHERE slug = 'melati-anggraini';

UPDATE alumni_profiles SET
  photo_key = '/demo/alumni/daffa-nugraha.webp', thumb_key = '/demo/alumni/daffa-nugraha.webp',
  bio = 'Frontend engineer di startup fintech. Fokus pada performa web, aksesibilitas, dan design system berbasis React.',
  phone = '+62 811-2345-6712', whatsapp = '+62 811-2345-6712',
  linkedin_url = 'https://www.linkedin.com/in/haloalumni-daffanugraha',
  show_email = 0, show_phone = 0, show_workplace = 1, directory_visible = 1, verified_at = 1792288800000
WHERE slug = 'daffa-nugraha';

-- Loker tambahan
INSERT OR IGNORE INTO jobs
  (id, slug, title, company, location, work_mode, employment_type, category, description_md, description_html,
   salary_min, salary_max, apply_url, contact_email, status, featured, expires_at, published_at, created_at, updated_at)
VALUES
  ('j-demo-000000000007', 'financial-analyst-traveloka', 'Financial Analyst', 'Traveloka', 'Jakarta (Hybrid)', 'hybrid', 'full', 'Keuangan',
   'Tim finance kami mencari analis yang kuat dalam pemodelan dan analisis kinerja bisnis.\n\n**Tanggung jawab**\n- Menyusun forecast dan budget unit bisnis.\n- Menganalisis metrik akuisisi dan retensi.\n- Menyiapkan laporan bulanan untuk manajemen.\n\n**Kualifikasi**\n- 2–4 tahun pengalaman finance/FP&A.\n- Mahir Excel dan SQL; pengalaman Tableau menjadi nilai tambah.',
   '<p>Tim finance kami mencari analis yang kuat dalam pemodelan dan analisis kinerja bisnis.</p><p><strong>Tanggung jawab</strong></p><ul><li>Menyusun forecast dan budget unit bisnis.</li><li>Menganalisis metrik akuisisi dan retensi.</li><li>Menyiapkan laporan bulanan untuk manajemen.</li></ul><p><strong>Kualifikasi</strong></p><ul><li>2–4 tahun pengalaman finance/FP&amp;A.</li><li>Mahir Excel dan SQL; pengalaman Tableau menjadi nilai tambah.</li></ul>',
   12000000, 18000000, 'mailto:karier+traveloka@haloalumni.my.id', NULL, 'published', 0, 1805000000000, 1792465200000, 1792465200000, 1792465200000),
  ('j-demo-000000000008', 'brand-content-lead-kopi-kenangan', 'Brand & Content Lead', 'Kopi Kenangan', 'Jakarta', 'onsite', 'full', 'Marketing',
   'Kami mencari pemimpin konten yang memahami budaya pop dan storytelling merek.\n\n**Peran**\n- Memimpin strategi konten lintas kanal.\n- Mengelola tim kreatif dan agensi.\n- Mengukur performa kampanye.\n\n**Kualifikasi**\n- 5+ tahun di brand/content marketing.\n- Portofolio kampanye yang berdampak.',
   '<p>Kami mencari pemimpin konten yang memahami budaya pop dan storytelling merek.</p><p><strong>Peran</strong></p><ul><li>Memimpin strategi konten lintas kanal.</li><li>Mengelola tim kreatif dan agensi.</li><li>Mengukur performa kampanye.</li></ul><p><strong>Kualifikasi</strong></p><ul><li>5+ tahun di brand/content marketing.</li><li>Portofolio kampanye yang berdampak.</li></ul>',
   15000000, 22000000, 'mailto:karier+kopikenangan@haloalumni.my.id', NULL, 'published', 1, 1805000000000, 1792288800000, 1792288800000, 1792288800000);

-- Cover berita
UPDATE posts SET cover_key = '/demo/covers/post-reuni.webp' WHERE slug = 'reuni-akbar-2026';
UPDATE posts SET cover_key = '/demo/covers/post-beasiswa.webp' WHERE slug = 'program-beasiswa-alumni';
UPDATE posts SET cover_key = '/demo/covers/post-kreatif.webp' WHERE slug = 'karier-di-industri-kreatif';
UPDATE posts SET cover_key = '/demo/covers/post-kartu.webp' WHERE slug = 'pembaruan-fitur-kartu-alumni';

-- Cover agenda + agenda yang sudah berlangsung
UPDATE events SET cover_key = '/demo/covers/event-reuni.webp' WHERE slug = 'reuni-akbar-2026';
UPDATE events SET cover_key = '/demo/covers/event-webinar.webp' WHERE slug = 'webinar-karier-tech';
UPDATE events SET cover_key = '/demo/covers/event-bakti.webp' WHERE slug = 'bakti-sosial-alumni';

INSERT OR IGNORE INTO events
  (id, slug, title, description_md, description_html, cover_key, location, mode, starts_at, ends_at,
   registration_closes_at, capacity, status, created_at, updated_at)
VALUES
  ('event-demo-00000004', 'temu-alumni-2025', 'Temu Alumni 2025', 'Temu santai lintas angkatan di akhir tahun 2025.\n\nAcara diisi makan malam bersama, sharing session, dan penggalangan dana beasiswa.',
   '<p>Temu santai lintas angkatan di akhir tahun 2025.</p><p>Acara diisi makan malam bersama, sharing session, dan penggalangan dana beasiswa.</p>',
   '/demo/covers/event-lama.webp', 'Hotel Gran Melia, Jakarta', 'offline', 1763172000000, 1763182800000,
   1762900000000, 150, 'done', 1790820000000, 1790820000000);

INSERT OR IGNORE INTO event_registrations
  (id, event_id, user_id, name, email, phone, guests, note, status, created_at)
VALUES
  ('reg-demo-000000003', 'event-demo-00000004', 'u-demo-0000000000001', 'Rina Pratiwi', 'rina.pratiwi@haloalumni.my.id', '+62 811-2345-6701', 1, NULL, 'attended', 1762000000000),
  ('reg-demo-000000004', 'event-demo-00000004', 'u-demo-0000000000002', 'Bagas Saputra', 'bagas.saputra@haloalumni.my.id', '+62 811-2345-6702', 0, NULL, 'attended', 1762000000000),
  ('reg-demo-000000005', 'event-demo-00000004', 'u-demo-0000000000003', 'Dinda Maheswari', 'dinda.maheswari@haloalumni.my.id', '+62 811-2345-6703', 0, NULL, 'attended', 1762000000000);

-- Cover donasi
UPDATE donation_campaigns SET cover_key = '/demo/covers/campaign-beasiswa.webp' WHERE slug = 'beasiswa-alumni-2026';
UPDATE donation_campaigns SET cover_key = '/demo/covers/campaign-ruangbaca.webp' WHERE slug = 'renovasi-ruang-baca';

INSERT OR IGNORE INTO donations
  (id, campaign_id, donor_name, donor_user_id, amount, transfer_date, proof_key, message, is_anonymous, status, verified_by, verified_at, created_at)
VALUES
  ('don-demo-000000005', 'camp-demo-000000001', 'Hendra Gunawan', 'u-demo-0000000000019', 25000000, '2026-10-16', NULL, 'Untuk pendidikan adik-adik alumni.', 0, 'verified', 'u-admin-0000000000001', 1792465200000, 1792465200000),
  ('don-demo-000000006', 'camp-demo-000000001', 'Alumni Angkatan 2009', NULL, 10000000, '2026-10-17', NULL, 'Semoga terus berjalan.', 1, 'verified', 'u-admin-0000000000001', 1792465200000, 1792465200000),
  ('don-demo-000000007', 'camp-demo-000000001', 'Ayu Wulandari', 'u-demo-0000000000016', 1500000, '2026-10-19', NULL, 'Ikut menyisihkan rezeki.', 0, 'verified', 'u-admin-0000000000001', 1792465200000, 1792465200000),
  ('don-demo-000000008', 'camp-demo-000000002', 'Sri Wahyuni', 'u-demo-0000000000020', 10000000, '2026-10-18', NULL, 'Untuk ruang baca yang lebih nyaman.', 0, 'verified', 'u-admin-0000000000001', 1792465200000, 1792465200000);

UPDATE settings SET value = 'halo@haloalumni.my.id' WHERE key = 'site.email';
UPDATE settings SET value = '+62 21 5000 1234' WHERE key = 'site.phone';
UPDATE settings SET value = 'Jl. Pendidikan Raya No. 12, Kebayoran Baru, Jakarta Selatan 12110' WHERE key = 'site.address';
UPDATE settings SET value = 'https://www.instagram.com/haloalumni.id' WHERE key = 'site.instagram';
UPDATE settings SET value = 'https://www.linkedin.com/company/haloalumni' WHERE key = 'site.linkedin';

-- Media library demo (foto tersimpan lokal di public/demo, bukan hotlink).
INSERT OR IGNORE INTO media (id, key, bucket, filename, mime, size, width, height, alt, uploaded_by, created_at) VALUES
  ('media-demo-a01', '/demo/alumni/rina-pratiwi.webp', 'media', 'rina-pratiwi.webp', 'image/webp', 42000, 640, 640, 'Rina Pratiwi, Senior Product Designer di Tokopedia', 'u-admin-0000000000001', 1790820000000),
  ('media-demo-a02', '/demo/alumni/bagas-saputra.webp', 'media', 'bagas-saputra.webp', 'image/webp', 42000, 640, 640, 'Bagas Saputra, Engineering Manager di Gojek', 'u-admin-0000000000001', 1790820000000),
  ('media-demo-a03', '/demo/alumni/dinda-maheswari.webp', 'media', 'dinda-maheswari.webp', 'image/webp', 42000, 640, 640, 'Dinda Maheswari, Audit Senior di Deloitte Indonesia', 'u-admin-0000000000001', 1790820000000),
  ('media-demo-a04', '/demo/alumni/fikri-ramadhan.webp', 'media', 'fikri-ramadhan.webp', 'image/webp', 42000, 640, 640, 'Fikri Ramadhan, Project Engineer di Pertamina', 'u-admin-0000000000001', 1790820000000),
  ('media-demo-a05', '/demo/alumni/nadya-putri.webp', 'media', 'nadya-putri.webp', 'image/webp', 42000, 640, 640, 'Nadya Putri, Producer di Kompas TV', 'u-admin-0000000000001', 1790820000000),
  ('media-demo-a06', '/demo/alumni/arya-wijaya.webp', 'media', 'arya-wijaya.webp', 'image/webp', 42000, 640, 640, 'Arya Wijaya, konsultan strategi', 'u-admin-0000000000001', 1790820000000),
  ('media-demo-a07', '/demo/alumni/salsabila-hakim.webp', 'media', 'salsabila-hakim.webp', 'image/webp', 42000, 640, 640, 'Salsabila Hakim, peneliti kebijakan publik', 'u-admin-0000000000001', 1790820000000),
  ('media-demo-a08', '/demo/alumni/reza-fadillah.webp', 'media', 'reza-fadillah.webp', 'image/webp', 42000, 640, 640, 'Reza Fadillah, product manager', 'u-admin-0000000000001', 1790820000000),
  ('media-demo-a09', '/demo/alumni/intan-permata.webp', 'media', 'intan-permata.webp', 'image/webp', 42000, 640, 640, 'Intan Permata, dokter umum', 'u-admin-0000000000001', 1790820000000),
  ('media-demo-a10', '/demo/alumni/yoga-santoso.webp', 'media', 'yoga-santoso.webp', 'image/webp', 42000, 640, 640, 'Yoga Santoso, Relationship Manager di Bank Mandiri', 'u-admin-0000000000001', 1790820000000),
  ('media-demo-a11', '/demo/alumni/melati-anggraini.webp', 'media', 'melati-anggraini.webp', 'image/webp', 42000, 640, 640, 'Melati Anggraini, Data Analyst di BPS', 'u-admin-0000000000001', 1790820000000),
  ('media-demo-a12', '/demo/alumni/daffa-nugraha.webp', 'media', 'daffa-nugraha.webp', 'image/webp', 42000, 640, 640, 'Daffa Nugraha, Frontend Engineer', 'u-admin-0000000000001', 1790820000000),
  ('media-demo-a13', '/demo/alumni/aditya-pratama.webp', 'media', 'aditya-pratama.webp', 'image/webp', 42000, 640, 640, 'Aditya Pratama, Project Manager di Waskita Karya', 'u-admin-0000000000001', 1790820000000),
  ('media-demo-a14', '/demo/alumni/citra-lestari.webp', 'media', 'citra-lestari.webp', 'image/webp', 42000, 640, 640, 'Citra Lestari, Content Strategist di UNESCO Jakarta', 'u-admin-0000000000001', 1790820000000),
  ('media-demo-a15', '/demo/alumni/bimo-prasetyo.webp', 'media', 'bimo-prasetyo.webp', 'image/webp', 42000, 640, 640, 'Bimo Prasetyo, Policy Analyst di Kementerian Luar Negeri', 'u-admin-0000000000001', 1790820000000),
  ('media-demo-a16', '/demo/alumni/ayu-wulandari.webp', 'media', 'ayu-wulandari.webp', 'image/webp', 42000, 640, 640, 'Ayu Wulandari, Product Specialist di Kalbe Farma', 'u-admin-0000000000001', 1790820000000),
  ('media-demo-a17', '/demo/alumni/rangga-maulana.webp', 'media', 'rangga-maulana.webp', 'image/webp', 42000, 640, 640, 'Rangga Maulana, arsitek dan pendiri Studio Rangga', 'u-admin-0000000000001', 1790820000000),
  ('media-demo-a18', '/demo/alumni/dewi-kartika.webp', 'media', 'dewi-kartika.webp', 'image/webp', 42000, 640, 640, 'Dewi Kartika, People Operations di Traveloka', 'u-admin-0000000000001', 1790820000000),
  ('media-demo-a19', '/demo/alumni/hendra-gunawan.webp', 'media', 'hendra-gunawan.webp', 'image/webp', 42000, 640, 640, 'Hendra Gunawan, CTO Arta Fintech', 'u-admin-0000000000001', 1790820000000),
  ('media-demo-a20', '/demo/alumni/sri-wahyuni.webp', 'media', 'sri-wahyuni.webp', 'image/webp', 42000, 640, 640, 'Sri Wahyuni, guru dan penggerak literasi', 'u-admin-0000000000001', 1790820000000),
  ('media-demo-c01', '/demo/covers/campaign-beasiswa.webp', 'media', 'campaign-beasiswa.webp', 'image/webp', 96000, 1200, 675, 'Cover kampanye Beasiswa Alumni 2026', 'u-admin-0000000000001', 1790820000000),
  ('media-demo-c02', '/demo/covers/campaign-ruangbaca.webp', 'media', 'campaign-ruangbaca.webp', 'image/webp', 96000, 1200, 675, 'Cover kampanye Renovasi Ruang Baca', 'u-admin-0000000000001', 1790820000000),
  ('media-demo-c03', '/demo/covers/event-reuni.webp', 'media', 'event-reuni.webp', 'image/webp', 96000, 1200, 675, 'Cover Reuni Akbar 2026', 'u-admin-0000000000001', 1790820000000),
  ('media-demo-c04', '/demo/covers/event-webinar.webp', 'media', 'event-webinar.webp', 'image/webp', 96000, 1200, 675, 'Cover Webinar Karier di Tech', 'u-admin-0000000000001', 1790820000000),
  ('media-demo-c05', '/demo/covers/event-bakti.webp', 'media', 'event-bakti.webp', 'image/webp', 96000, 1200, 675, 'Cover Bakti Sosial Alumni', 'u-admin-0000000000001', 1790820000000),
  ('media-demo-c06', '/demo/covers/event-lama.webp', 'media', 'event-lama.webp', 'image/webp', 96000, 1200, 675, 'Cover Temu Alumni 2025', 'u-admin-0000000000001', 1790820000000),
  ('media-demo-c07', '/demo/covers/post-beasiswa.webp', 'media', 'post-beasiswa.webp', 'image/webp', 96000, 1200, 675, 'Ilustrasi program beasiswa alumni', 'u-admin-0000000000001', 1790820000000),
  ('media-demo-c08', '/demo/covers/post-kartu.webp', 'media', 'post-kartu.webp', 'image/webp', 96000, 1200, 675, 'Ilustrasi kartu alumni digital', 'u-admin-0000000000001', 1790820000000),
  ('media-demo-c09', '/demo/covers/post-kreatif.webp', 'media', 'post-kreatif.webp', 'image/webp', 96000, 1200, 675, 'Ilustrasi karier di industri kreatif', 'u-admin-0000000000001', 1790820000000),
  ('media-demo-c10', '/demo/covers/post-reuni.webp', 'media', 'post-reuni.webp', 'image/webp', 96000, 1200, 675, 'Ilustrasi reuni akbar alumni', 'u-admin-0000000000001', 1790820000000);

-- Halaman CMS 'kontak' dihapus karena route statis /kontak sudah ada.
DELETE FROM pages WHERE slug = 'kontak';

-- Akun pendaftar yang menunggu persetujuan admin.
INSERT OR IGNORE INTO users (id, email, role, status, email_verified_at, created_at, updated_at) VALUES
  ('u-demo-pending-00001', 'alya.rahmawati@haloalumni.my.id', 'alumni', 'pending', NULL, 1792000000000, 1792000000000),
  ('u-demo-pending-00002', 'taufik.hidayat@haloalumni.my.id', 'alumni', 'pending', NULL, 1792100000000, 1792100000000),
  ('u-demo-pending-00003', 'laras.sekarwangi@haloalumni.my.id', 'alumni', 'pending', NULL, 1792200000000, 1792200000000);

INSERT OR IGNORE INTO alumni_profiles
  (id, user_id, slug, full_name, angkatan, program, nim, city, province, country, company, job_title, industry,
   bio, instagram_url, linkedin_url, phone, whatsapp, show_email, show_phone, show_workplace, directory_visible,
   status, card_no, card_token, verified_at, created_at, updated_at, photo_key, thumb_key)
VALUES
  ('p-demo-pending-00001', 'u-demo-pending-00001', 'alya-rahmawati', 'Alya Rahmawati', 2018, 'Teknik Informatika', '18045', 'Bandung', 'Jawa Barat', 'Indonesia',
   'Halodoc', 'Software Engineer', 'Teknologi',
   'Software engineer di Halodoc. Bekerja pada layanan telemedicine dan integrasi rekam medis elektronik.',
   NULL, 'https://www.linkedin.com/in/haloalumni-alyarahmawati', '+62 813-2000-0001', NULL, 1, 0, 1, 1,
   'draft', NULL, NULL, NULL, 1792000000000, 1792000000000, NULL, NULL),
  ('p-demo-pending-00002', 'u-demo-pending-00002', 'taufik-hidayat', 'Taufik Hidayat', 2010, 'Akuntansi', '10031', 'Medan', 'Sumatera Utara', 'Indonesia',
   'PT Perkebunan Nusantara', 'Finance Analyst', 'Keuangan',
   'Analis keuangan di PT Perkebunan Nusantara. Menangani perencanaan anggaran dan pelaporan triwulanan.',
   NULL, NULL, '+62 813-2000-0002', NULL, 0, 0, 1, 1,
   'draft', NULL, NULL, NULL, 1792100000000, 1792100000000, NULL, NULL),
  ('p-demo-pending-00003', 'u-demo-pending-00003', 'laras-sekarwangi', 'Laras Sekarwangi', 2021, 'Desain Komunikasi Visual', '21018', 'Semarang', 'Jawa Tengah', 'Indonesia',
   'Studio Lokal', 'Junior Designer', 'Desain',
   'Desainer junior di Studio Lokal. Menggarap identitas visual UMKM dan kampanye sosial.',
   'https://www.instagram.com/haloalumni.larassekar', NULL, NULL, NULL, 1, 0, 1, 1,
   'draft', NULL, NULL, NULL, 1792200000000, 1792200000000, NULL, NULL);

-- Loker yang menunggu moderasi.
INSERT OR IGNORE INTO jobs
  (id, slug, title, company, location, work_mode, employment_type, category, description_md, description_html,
   salary_min, salary_max, apply_url, contact_email, submitted_by_user_id, submitter_name, submitter_email,
   status, featured, expires_at, published_at, created_at, updated_at)
VALUES
  ('j-demo-pending-00001', 'content-writer-remote-ruangguru', 'Content Writer (Remote)', 'Ruangguru', 'Remote', 'remote', 'full', 'Media',
   'Menyusun materi belajar dan artikel edukasi untuk siswa SMA.\n\nKualifikasi: pengalaman menulis, riset, dan editing.',
   '<p>Menyusun materi belajar dan artikel edukasi untuk siswa SMA.</p><p>Kualifikasi: pengalaman menulis, riset, dan editing.</p>',
   7000000, 10000000, 'mailto:karier+ruangguru@haloalumni.my.id', NULL, 'u-demo-0000000000014', 'Citra Lestari', 'citra.lestari@haloalumni.my.id',
   'pending', 0, 1900000000000, NULL, 1792300000000, 1792300000000),
  ('j-demo-pending-00002', 'finance-analyst-blibli', 'Finance Analyst', 'Blibli', 'Jakarta', 'hybrid', 'full', 'Keuangan',
   'Mendukung analisis keuangan bulanan dan penyusunan anggaran unit bisnis.\n\nKualifikasi: akuntansi, Excel, dan SQL dasar.',
   '<p>Mendukung analisis keuangan bulanan dan penyusunan anggaran unit bisnis.</p><p>Kualifikasi: akuntansi, Excel, dan SQL dasar.</p>',
   9000000, 13000000, NULL, 'rekrutmen@haloalumni.my.id', 'u-demo-0000000000010', 'Yoga Santoso', 'yoga.santoso@haloalumni.my.id',
   'pending', 0, 1900000000000, NULL, 1792310000000, 1792310000000);

-- Pesan kontak demo.
INSERT OR IGNORE INTO contact_messages (id, name, email, subject, message, to_user_id, ip_hash, status, created_at) VALUES
  ('msg-demo-0000000001', 'Arif Budiman', 'arif.budiman@haloalumni.my.id', 'Tanya program beasiswa',
   'Selamat pagi, saya orang tua siswa yang ingin bertanya tentang syarat program beasiswa alumni. Apakah pendaftaran dibuka untuk siswa kelas 11?',
   NULL, NULL, 'new', 1792400000000),
  ('msg-demo-0000000002', 'Nabila Putri', 'nabila.putri@haloalumni.my.id', 'Kolaborasi komunitas desain',
   'Halo Rina, saya dari komunitas desain kampus. Kami ingin mengundang alumni untuk mengisi sharing session bulan depan.',
   'u-demo-0000000000001', NULL, 'read', 1792410000000),
  ('msg-demo-0000000003', 'Sekretariat Alumni', 'sekretariat@haloalumni.my.id', 'Konfirmasi data kontak',
   'Mohon konfirmasi nomor telepon sekretariat yang tertera di halaman kontak. Terima kasih.',
   NULL, NULL, 'replied', 1792420000000);

-- Bookmark dan audit log demo.
INSERT OR IGNORE INTO job_bookmarks (user_id, job_id, created_at) VALUES
  ('u-demo-0000000000001', 'j-demo-000000000001', 1792430000000),
  ('u-demo-0000000000001', 'j-demo-000000000004', 1792431000000),
  ('u-demo-0000000000002', 'j-demo-000000000002', 1792432000000);

INSERT OR IGNORE INTO audit_logs (id, actor_id, action, entity_type, entity_id, meta, created_at) VALUES
  ('audit-demo-000000001', 'u-admin-0000000000001', 'alumni.approve', 'user', 'u-demo-0000000000016', '{"cardNo":"ALM-2017-00002"}', 1792465200000),
  ('audit-demo-000000002', 'u-admin-0000000000001', 'job.publish', 'job', 'j-demo-000000000001', NULL, 1792465300000),
  ('audit-demo-000000003', 'u-admin-0000000000001', 'settings.update', 'settings', NULL, '{"keys":["site.hero_title","site.footer_note"]}', 1792465400000);
