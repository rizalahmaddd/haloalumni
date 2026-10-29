-- Data demo. Jalankan setelah migrasi:
-- npm run db:migrate:local && npm run db:seed:local

INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES
  ('site.name', 'Halo Alumni', 1790820000000),
  ('site.tagline', 'Terhubung, tumbuh, dan berkontribusi bersama.', 1790820000000),
  ('site.institution_type', 'Sekolah', 1790820000000),
  ('site.year_label', 'Angkatan', 1790820000000),
  ('site.program_label', 'Jurusan', 1790820000000),
  ('site.nim_label', 'NIS', 1790820000000),
  ('site.accent', '#0071e3', 1790820000000),
  ('site.hero_title', 'Satu jaringan untuk seluruh alumni.', 1790820000000),
  ('site.hero_subtitle', 'Temukan teman seangkatan, akses peluang karier, ikuti agenda reuni, dan dukung program almamater.', 1790820000000),
  ('site.email', 'halo@haloalumni.my.id', 1790820000000),
  ('site.phone', '+62 21 5000 1234', 1790820000000),
  ('site.address', 'Jl. Pendidikan Raya No. 12, Kebayoran Baru, Jakarta Selatan 12110', 1790820000000),
  ('site.footer_note', 'Dikelola oleh sekretariat alumni.', 1790820000000),
  ('jobs.duration_days', '30', 1790820000000);

INSERT OR IGNORE INTO users (id, email, role, status, email_verified_at, created_at, updated_at) VALUES
  ('u-admin-0000000000001', 'admin@haloalumni.my.id', 'admin', 'active', 1790820000000, 1790820000000, 1790820000000),
  ('u-demo-0000000000001', 'rina.pratiwi@haloalumni.my.id', 'alumni', 'active', 1790820000000, 1790820000000, 1790820000000),
  ('u-demo-0000000000002', 'bagas.saputra@haloalumni.my.id', 'alumni', 'active', 1790820000000, 1790820000000, 1790820000000),
  ('u-demo-0000000000003', 'dinda.maheswari@haloalumni.my.id', 'alumni', 'active', 1790820000000, 1790820000000, 1790820000000),
  ('u-demo-0000000000004', 'fikri.ramadhan@haloalumni.my.id', 'alumni', 'active', 1790820000000, 1790820000000, 1790820000000),
  ('u-demo-0000000000005', 'nadya.putri@haloalumni.my.id', 'alumni', 'active', 1790820000000, 1790820000000, 1790820000000),
  ('u-demo-0000000000006', 'arya.wijaya@haloalumni.my.id', 'alumni', 'active', 1790820000000, 1790820000000, 1790820000000),
  ('u-demo-0000000000007', 'salsabila.hakim@haloalumni.my.id', 'alumni', 'active', 1790820000000, 1790820000000, 1790820000000),
  ('u-demo-0000000000008', 'reza.fadillah@haloalumni.my.id', 'alumni', 'active', 1790820000000, 1790820000000, 1790820000000),
  ('u-demo-0000000000009', 'intan.permata@haloalumni.my.id', 'alumni', 'active', 1790820000000, 1790820000000, 1790820000000),
  ('u-demo-0000000000010', 'yoga.santoso@haloalumni.my.id', 'alumni', 'active', 1790820000000, 1790820000000, 1790820000000),
  ('u-demo-0000000000011', 'melati.anggraini@haloalumni.my.id', 'alumni', 'active', 1790820000000, 1790820000000, 1790820000000),
  ('u-demo-0000000000012', 'daffa.nugraha@haloalumni.my.id', 'alumni', 'active', 1790820000000, 1790820000000, 1790820000000);

INSERT OR IGNORE INTO alumni_profiles
  (id, user_id, slug, full_name, angkatan, program, nim, city, province, country, company, job_title, industry,
   bio, instagram_url, linkedin_url, show_email, show_phone, show_workplace, directory_visible, status,
   card_no, card_token, verified_at, created_at, updated_at)
VALUES
  ('p-admin-000000000001', 'u-admin-0000000000001', 'admin-alumni', 'Admin Alumni', 2006, 'Manajemen', 'A-0001', 'Jakarta', 'DKI Jakarta', 'Indonesia', 'Halo Alumni', 'Sekretariat', 'Pendidikan',
   'Mengelola direktori dan program alumni.', NULL, NULL, 0, 0, 1, 0, 'published', 'ALM-2006-00001', 'ADMINCARD0000001', 1790820000000, 1790820000000, 1790820000000),
  ('p-demo-000000000001', 'u-demo-0000000000001', 'rina-pratiwi', 'Rina Pratiwi', 2012, 'Teknik Informatika', '12001', 'Jakarta', 'DKI Jakarta', 'Indonesia', 'Tokopedia', 'Senior Product Designer', 'Teknologi',
   'Desainer produk yang fokus pada pengalaman pengguna dan riset kualitatif. Senang berbagi ilmu lewat komunitas desain alumni.', 'https://instagram.com/rina', 'https://linkedin.com/in/rina', 0, 0, 1, 1, 'published', 'ALM-2012-00001', 'RINA2012CARD0001', 1790820000000, 1790820000000, 1790820000000),
  ('p-demo-000000000002', 'u-demo-0000000000002', 'bagas-saputra', 'Bagas Saputra', 2011, 'Sistem Informasi', '11084', 'Bandung', 'Jawa Barat', 'Indonesia', 'Gojek', 'Engineering Manager', 'Teknologi',
   'Membangun tim engineering yang sehat dan produk yang berdampak.', NULL, 'https://linkedin.com/in/bagas', 0, 0, 1, 1, 'published', 'ALM-2011-00001', 'BAGAS2011CARD001', 1790820000000, 1790820000000, 1790820000000),
  ('p-demo-000000000003', 'u-demo-0000000000003', 'dinda-maheswari', 'Dinda Maheswari', 2015, 'Akuntansi', '15022', 'Surabaya', 'Jawa Timur', 'Indonesia', 'Deloitte Indonesia', 'Audit Senior', 'Keuangan',
   'Auditor dengan minat pada tata kelola dan keberlanjutan.', NULL, NULL, 0, 0, 1, 1, 'published', 'ALM-2015-00001', 'DINDA2015CARD001', 1790820000000, 1790820000000, 1790820000000),
  ('p-demo-000000000004', 'u-demo-0000000000004', 'fikri-ramadhan', 'Fikri Ramadhan', 2013, 'Teknik Mesin', '13017', 'Bekasi', 'Jawa Barat', 'Indonesia', 'Pertamina', 'Project Engineer', 'Energi',
   'Bekerja di proyek energi terbarukan dan efisiensi industri.', NULL, NULL, 0, 0, 1, 1, 'published', 'ALM-2013-00001', 'FIKRI2013CARD001', 1790820000000, 1790820000000, 1790820000000),
  ('p-demo-000000000005', 'u-demo-0000000000005', 'nadya-putri', 'Nadya Putri', 2016, 'Ilmu Komunikasi', '16009', 'Yogyakarta', 'DI Yogyakarta', 'Indonesia', 'Kompas TV', 'Producer', 'Media',
   'Produser konten dokumenter dan berita feature.', 'https://instagram.com/nadya', NULL, 0, 0, 1, 1, 'published', 'ALM-2016-00001', 'NADYA2016CARD001', 1790820000000, 1790820000000, 1790820000000),
  ('p-demo-000000000006', 'u-demo-0000000000006', 'arya-wijaya', 'Arya Wijaya', 2010, 'Hukum', '10031', 'Semarang', 'Jawa Tengah', 'Indonesia', 'Arya & Partners', 'Founder', 'Hukum',
   'Praktisi hukum bisnis dan teknologi.', NULL, 'https://linkedin.com/in/arya', 0, 0, 1, 1, 'published', 'ALM-2010-00001', 'ARYA2010CARD0001', 1790820000000, 1790820000000, 1790820000000),
  ('p-demo-000000000007', 'u-demo-0000000000007', 'salsabila-hakim', 'Salsabila Hakim', 2017, 'Kedokteran', '17002', 'Jakarta', 'DKI Jakarta', 'Indonesia', 'RSCM', 'Dokter Umum', 'Kesehatan',
   'Dokter umum yang tertarik pada kesehatan komunitas.', NULL, NULL, 0, 0, 1, 1, 'published', 'ALM-2017-00001', 'SALSA2017CARD001', 1790820000000, 1790820000000, 1790820000000),
  ('p-demo-000000000008', 'u-demo-0000000000008', 'reza-fadillah', 'Reza Fadillah', 2014, 'Teknik Elektro', '14055', 'Tangerang', 'Banten', 'Indonesia', 'Schneider Electric', 'Solution Architect', 'Energi',
   'Merancang solusi otomasi industri dan energi.', NULL, NULL, 0, 0, 1, 1, 'published', 'ALM-2014-00001', 'REZA2014CARD0001', 1790820000000, 1790820000000, 1790820000000),
  ('p-demo-000000000009', 'u-demo-0000000000009', 'intan-permata', 'Intan Permata', 2018, 'Desain Komunikasi Visual', '18012', 'Denpasar', 'Bali', 'Indonesia', 'Freelance', 'Brand Designer', 'Kreatif',
   'Membantu UMKM membangun identitas visual yang kuat.', 'https://instagram.com/intan', NULL, 0, 0, 1, 1, 'published', 'ALM-2018-00001', 'INTAN2018CARD001', 1790820000000, 1790820000000, 1790820000000),
  ('p-demo-000000000010', 'u-demo-0000000000010', 'yoga-santoso', 'Yoga Santoso', 2009, 'Manajemen', '09041', 'Malang', 'Jawa Timur', 'Indonesia', 'Bank Mandiri', 'Relationship Manager', 'Keuangan',
   'Mendampingi UMKM untuk tumbuh lewat pembiayaan yang tepat.', NULL, NULL, 0, 0, 1, 1, 'published', 'ALM-2009-00001', 'YOGA2009CARD0001', 1790820000000, 1790820000000, 1790820000000),
  ('p-demo-000000000011', 'u-demo-0000000000011', 'melati-anggraini', 'Melati Anggraini', 2019, 'Statistika', '19007', 'Bogor', 'Jawa Barat', 'Indonesia', 'BPS', 'Data Analyst', 'Data',
   'Analis data untuk kebijakan publik berbasis bukti.', NULL, NULL, 0, 0, 1, 1, 'published', 'ALM-2019-00001', 'MELATI2019CARD01', 1790820000000, 1790820000000, 1790820000000),
  ('p-demo-000000000012', 'u-demo-0000000000012', 'daffa-nugraha', 'Daffa Nugraha', 2020, 'Teknik Informatika', '20033', 'Depok', 'Jawa Barat', 'Indonesia', 'Startup Stealth', 'Frontend Engineer', 'Teknologi',
   'Frontend engineer yang suka membangun antarmuka cepat dan aksesibel.', NULL, NULL, 0, 0, 1, 1, 'published', 'ALM-2020-00001', 'DAFFA2020CARD001', 1790820000000, 1790820000000, 1790820000000);

INSERT OR IGNORE INTO jobs
  (id, slug, title, company, location, work_mode, employment_type, category, description_md, description_html,
   salary_min, salary_max, apply_url, contact_email, status, featured, expires_at, published_at, created_at, updated_at)
VALUES
  ('j-demo-000000000001', 'senior-frontend-engineer-tokopedia', 'Senior Frontend Engineer', 'Tokopedia', 'Jakarta (Hybrid)', 'hybrid', 'full', 'Teknologi',
   'Kami mencari frontend engineer yang berpengalaman membangun antarmuka produk berskala besar.\n\n**Tanggung jawab**\n- Membangun dan merawat design system internal.\n- Berkolaborasi dengan desain dan backend.\n\n**Kualifikasi**\n- 4+ tahun pengalaman React dan TypeScript.\n- Paham performa web dan aksesibilitas.',
   '<p>Kami mencari frontend engineer yang berpengalaman membangun antarmuka produk berskala besar.</p><p><strong>Tanggung jawab</strong></p><ul><li>Membangun dan merawat design system internal.</li><li>Berkolaborasi dengan desain dan backend.</li></ul><p><strong>Kualifikasi</strong></p><ul><li>4+ tahun pengalaman React dan TypeScript.</li><li>Paham performa web dan aksesibilitas.</li></ul>',
   18000000, 28000000, 'mailto:karier+tokopedia@haloalumni.my.id', NULL, 'published', 1, 1900000000000, 1790820000000, 1790820000000, 1790820000000),
  ('j-demo-000000000002', 'product-designer-gojek', 'Product Designer', 'Gojek', 'Jakarta (Hybrid)', 'hybrid', 'full', 'Desain',
   'Bergabunglah dengan tim produk untuk merancang pengalaman transportasi dan pembayaran.\n\nKami mencari desainer yang kuat dalam riset dan prototyping.',
   '<p>Bergabunglah dengan tim produk untuk merancang pengalaman transportasi dan pembayaran.</p><p>Kami mencari desainer yang kuat dalam riset dan prototyping.</p>',
   15000000, 24000000, 'mailto:karier+gojek@haloalumni.my.id', NULL, 'published', 0, 1900000000000, 1790820000000, 1790820000000, 1790820000000),
  ('j-demo-000000000003', 'data-analyst-bps', 'Data Analyst', 'BPS', 'Jakarta', 'onsite', 'contract', 'Data',
   'Mendukung analisis data statistik untuk publikasi rutin.\n\nKualifikasi: SQL, Python, dan kemampuan komunikasi data.',
   '<p>Mendukung analisis data statistik untuk publikasi rutin.</p><p>Kualifikasi: SQL, Python, dan kemampuan komunikasi data.</p>',
   8000000, 11000000, 'mailto:karier+bps@haloalumni.my.id', NULL, 'published', 0, 1900000000000, 1790820000000, 1790820000000, 1790820000000),
  ('j-demo-000000000004', 'remote-backend-engineer', 'Backend Engineer (Remote)', 'Cloudworks', 'Remote', 'remote', 'full', 'Teknologi',
   'Bangun layanan backend untuk platform logistik.\n\nStack: Go, PostgreSQL, Kubernetes.',
   '<p>Bangun layanan backend untuk platform logistik.</p><p>Stack: Go, PostgreSQL, Kubernetes.</p>',
   20000000, 32000000, 'mailto:karier+cloudworks@haloalumni.my.id', NULL, 'published', 1, 1900000000000, 1790820000000, 1790820000000, 1790820000000),
  ('j-demo-000000000005', 'marketing-internship', 'Marketing Intern', 'Kopi Kenangan', 'Jakarta', 'onsite', 'internship', 'Marketing',
   'Program magang 6 bulan untuk mahasiswa tingkat akhir atau fresh graduate.\n\nKamu akan membantu kampanye digital dan riset pasar.',
   '<p>Program magang 6 bulan untuk mahasiswa tingkat akhir atau fresh graduate.</p><p>Kamu akan membantu kampanye digital dan riset pasar.</p>',
   4000000, 5000000, 'mailto:karier+kopikenangan@haloalumni.my.id', NULL, 'published', 0, 1900000000000, 1790820000000, 1790820000000, 1790820000000),
  ('j-demo-000000000006', 'legal-counsel', 'Legal Counsel', 'Arya & Partners', 'Semarang', 'onsite', 'full', 'Hukum',
   'Menangani perjanjian komersial dan kepatuhan perusahaan teknologi.',
   '<p>Menangani perjanjian komersial dan kepatuhan perusahaan teknologi.</p>',
   12000000, 18000000, 'mailto:karier+aryapartners@haloalumni.my.id', NULL, 'published', 0, 1900000000000, 1790820000000, 1790820000000, 1790820000000);

INSERT OR IGNORE INTO posts
  (id, slug, title, excerpt, category, content_md, content_html, status, author_id, published_at, created_at, updated_at)
VALUES
  ('post-demo-0000000001', 'reuni-akbar-2026', 'Reuni Akbar 2026: Mendekatkan yang Pernah Berjauhan', 'Reuni akbar tahunan kembali digelar dengan format baru: talkshow karier, bazar UMKM alumni, dan sesi mentoring lintas angkatan.',
   'Agenda', 'Reuni akbar tahun ini mengusung tema **"Pulang, Bertumbuh, Berbagi"**.\n\nAcara akan diisi talkshow karier, bazar UMKM alumni, dan sesi mentoring lintas angkatan.\n\nPendaftaran dibuka melalui halaman agenda. Kuota terbatas untuk menjaga kenyamanan acara.',
   '<p>Reuni akbar tahun ini mengusung tema <strong>&quot;Pulang, Bertumbuh, Berbagi&quot;</strong>.</p><p>Acara akan diisi talkshow karier, bazar UMKM alumni, dan sesi mentoring lintas angkatan.</p><p>Pendaftaran dibuka melalui halaman agenda. Kuota terbatas untuk menjaga kenyamanan acara.</p>',
   'published', 'u-admin-0000000000001', 1790820000000, 1790820000000, 1790820000000),
  ('post-demo-0000000002', 'program-beasiswa-alumni', 'Program Beasiswa Alumni Dibuka', 'Dukungan biaya pendidikan untuk siswa berprestasi dari keluarga prasejahtera. Pendanaan berasal dari donasi alumni.',
   'Program', 'Program beasiswa alumni kembali dibuka untuk tahun ajaran ini.\n\n**Cakupan**\n- Biaya sekolah\n- Perlengkapan belajar\n- Pendampingan mentor\n\nDonasi dapat disalurkan melalui halaman donasi.',
   '<p>Program beasiswa alumni kembali dibuka untuk tahun ajaran ini.</p><p><strong>Cakupan</strong></p><ul><li>Biaya sekolah</li><li>Perlengkapan belajar</li><li>Pendampingan mentor</li></ul><p>Donasi dapat disalurkan melalui halaman donasi.</p>',
   'published', 'u-admin-0000000000001', 1790000000000, 1790000000000, 1790000000000),
  ('post-demo-0000000003', 'karier-di-industri-kreatif', 'Karier di Industri Kreatif: Catatan Alumni', 'Tiga alumni berbagi pengalaman membangun karier di desain, media, dan periklanan.',
   'Karier', 'Industri kreatif menawarkan banyak jalur karier.\n\nTiga alumni berbagi pengalaman tentang portofolio, klien, dan membangun reputasi.\n\n> Konsistensi karya lebih penting daripada menunggu proyek besar.',
   '<p>Industri kreatif menawarkan banyak jalur karier.</p><p>Tiga alumni berbagi pengalaman tentang portofolio, klien, dan membangun reputasi.</p><blockquote><p>Konsistensi karya lebih penting daripada menunggu proyek besar.</p></blockquote>',
   'published', 'u-admin-0000000000001', 1789500000000, 1789500000000, 1789500000000),
  ('post-demo-0000000004', 'pembaruan-fitur-kartu-alumni', 'Kartu Alumni Digital Kini Dilengkapi Verifikasi QR', 'Kartu alumni dapat diverifikasi keasliannya lewat halaman publik tanpa membuka data pribadi pemilik kartu.',
   'Pengumuman', 'Kartu alumni digital kini memiliki QR yang mengarah ke halaman verifikasi publik.\n\nHalaman tersebut hanya menampilkan nama, angkatan, program, dan status keanggotaan.',
   '<p>Kartu alumni digital kini memiliki QR yang mengarah ke halaman verifikasi publik.</p><p>Halaman tersebut hanya menampilkan nama, angkatan, program, dan status keanggotaan.</p>',
   'published', 'u-admin-0000000000001', 1789000000000, 1789000000000, 1789000000000);

INSERT OR IGNORE INTO pages (id, slug, title, content_md, content_html, status, show_in_footer, sort_order, updated_at) VALUES
  ('page-demo-000000001', 'tentang', 'Tentang Halo Alumni', 'Halo Alumni didirikan untuk menjaga hubungan antaralumni dan mendukung almamater.\n\n**Visi** menjadi jaringan alumni yang saling menguatkan.\n\n**Misi**\n- Menghubungkan alumni lintas angkatan.\n- Memfasilitasi pengembangan karier.\n- Mendukung program pendidikan.',
   '<p>Halo Alumni didirikan untuk menjaga hubungan antaralumni dan mendukung almamater.</p><p><strong>Visi</strong> menjadi jaringan alumni yang saling menguatkan.</p><p><strong>Misi</strong></p><ul><li>Menghubungkan alumni lintas angkatan.</li><li>Memfasilitasi pengembangan karier.</li><li>Mendukung program pendidikan.</li></ul>',
   'published', 1, 1, 1790820000000),
  ('page-demo-000000002', 'privasi', 'Kebijakan Privasi', 'Kami menghormati privasi alumni.\n\nData yang dikumpulkan hanya digunakan untuk keperluan direktori, komunikasi resmi, dan layanan alumni.\n\nAlumni dapat mengatur visibilitas data melalui halaman profil. Permintaan penghapusan data dapat disampaikan ke sekretariat.',
   '<p>Kami menghormati privasi alumni.</p><p>Data yang dikumpulkan hanya digunakan untuk keperluan direktori, komunikasi resmi, dan layanan alumni.</p><p>Alumni dapat mengatur visibilitas data melalui halaman profil. Permintaan penghapusan data dapat disampaikan ke sekretariat.</p>',
   'published', 1, 2, 1790820000000),
  ('page-demo-000000003', 'kontak', 'Kontak Sekretariat', 'Sekretariat alumni dapat dihubungi pada hari kerja, 09.00–16.00 WIB.\n\nEmail: halo@haloalumni.my.id\nTelepon: +62 21 5000 1234\n\nUntuk pertanyaan tentang profil, sertakan nama dan angkatan.',
   '<p>Sekretariat alumni dapat dihubungi pada hari kerja, 09.00–16.00 WIB.</p><p>Email: halo@haloalumni.my.id<br />Telepon: +62 21 5000 1234</p><p>Untuk pertanyaan tentang profil, sertakan nama dan angkatan.</p>',
   'published', 1, 3, 1790820000000);

INSERT OR IGNORE INTO events
  (id, slug, title, description_md, description_html, location, mode, starts_at, ends_at, registration_closes_at, capacity, status, created_at, updated_at)
VALUES
  ('event-demo-00000001', 'reuni-akbar-2026', 'Reuni Akbar 2026', 'Reuni lintas angkatan dengan talkshow karier, bazar UMKM, dan sesi mentoring.\n\nTiket termasuk makan siang dan merchandise.',
   '<p>Reuni lintas angkatan dengan talkshow karier, bazar UMKM, dan sesi mentoring.</p><p>Tiket termasuk makan siang dan merchandise.</p>',
   'Aula Utama', 'offline', 1797040800000, 1797055200000, 1796700000000, 120, 'published', 1790820000000, 1790820000000),
  ('event-demo-00000002', 'webinar-karier-tech', 'Webinar: Membangun Karier di Tech', 'Sesi daring bersama alumni yang bekerja di perusahaan teknologi.\n\nTopik: portofolio, wawancara teknis, dan negosiasi gaji.',
   '<p>Sesi daring bersama alumni yang bekerja di perusahaan teknologi.</p><p>Topik: portofolio, wawancara teknis, dan negosiasi gaji.</p>',
   'Zoom', 'online', 1800410400000, 1800417600000, 1800200000000, 300, 'published', 1790820000000, 1790820000000),
  ('event-demo-00000003', 'bakti-sosial-alumni', 'Bakti Sosial Alumni', 'Kerja bakti dan penggalangan bantuan untuk sekolah di daerah.\n\nRelawan diperlukan untuk logistik dan dokumentasi.',
   '<p>Kerja bakti dan penggalangan bantuan untuk sekolah di daerah.</p><p>Relawan diperlukan untuk logistik dan dokumentasi.</p>',
   'Kabupaten Bogor', 'offline', 1794794400000, 1794808800000, 1794500000000, 60, 'published', 1790820000000, 1790820000000);

INSERT OR IGNORE INTO event_registrations
  (id, event_id, user_id, name, email, phone, guests, note, status, created_at)
VALUES
  ('reg-demo-000000001', 'event-demo-00000001', 'u-demo-0000000000001', 'Rina Pratiwi', 'rina.pratiwi@haloalumni.my.id', '+62 811-2345-6701', 1, 'Ingin ikut sesi mentoring.', 'registered', 1790820000000),
  ('reg-demo-000000002', 'event-demo-00000001', 'u-demo-0000000000002', 'Bagas Saputra', 'bagas.saputra@haloalumni.my.id', '+62 811-2345-6702', 0, NULL, 'registered', 1790820000000);

INSERT OR IGNORE INTO donation_campaigns
  (id, slug, title, description_md, description_html, target_amount, bank_info, deadline, status, created_at, updated_at)
VALUES
  ('camp-demo-000000001', 'beasiswa-alumni-2026', 'Beasiswa Alumni 2026', 'Dukung biaya pendidikan siswa berprestasi dari keluarga prasejahtera.\n\nDana digunakan untuk biaya sekolah, perlengkapan, dan pendampingan mentor selama satu tahun.',
   '<p>Dukung biaya pendidikan siswa berprestasi dari keluarga prasejahtera.</p><p>Dana digunakan untuk biaya sekolah, perlengkapan, dan pendampingan mentor selama satu tahun.</p>',
   150000000, 'Bank Mandiri · 123-00-4567890-1 · a.n. Halo Alumni', 1803780000000, 'active', 1790820000000, 1790820000000),
  ('camp-demo-000000002', 'renovasi-ruang-baca', 'Renovasi Ruang Baca', 'Memperbarui ruang baca dan koleksi buku untuk siswa aktif.\n\nTarget mencakup rak baru, pendingin ruangan, dan 500 buku.',
   '<p>Memperbarui ruang baca dan koleksi buku untuk siswa aktif.</p><p>Target mencakup rak baru, pendingin ruangan, dan 500 buku.</p>',
   75000000, 'Bank Mandiri · 123-00-4567890-1 · a.n. Halo Alumni', 1805076000000, 'active', 1790820000000, 1790820000000);

INSERT OR IGNORE INTO donations
  (id, campaign_id, donor_name, donor_user_id, amount, transfer_date, proof_key, message, is_anonymous, status, verified_by, verified_at, created_at)
VALUES
  ('don-demo-000000001', 'camp-demo-000000001', 'Rina Pratiwi', 'u-demo-0000000000001', 2500000, '2026-10-05', NULL, 'Semoga bermanfaat.', 0, 'verified', 'u-admin-0000000000001', 1790820000000, 1790820000000),
  ('don-demo-000000002', 'camp-demo-000000001', 'Bagas Saputra', 'u-demo-0000000000002', 5000000, '2026-10-08', NULL, NULL, 0, 'verified', 'u-admin-0000000000001', 1790820000000, 1790820000000),
  ('don-demo-000000003', 'camp-demo-000000001', 'Alumni 2011', NULL, 1000000, '2026-10-12', NULL, 'Untuk adik-adik.', 1, 'verified', 'u-admin-0000000000001', 1790820000000, 1790820000000),
  ('don-demo-000000004', 'camp-demo-000000002', 'Dinda Maheswari', 'u-demo-0000000000003', 3000000, '2026-10-15', NULL, 'Semoga ruang bacanya nyaman.', 0, 'pending', NULL, NULL, 1790820000000);
