import { Team, User, Document, DocumentVersion, FeedbackItem, AuditLog, JDIHSyncLog } from '../types';

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-sdm',
    name: 'Kepegawaian & Pengembangan SDM',
    code: 'SDM',
    description: 'Unit pengelola manajemen talenta, presensi, cuti, kinerja, dan disiplin pegawai ASN.',
    adminUserIds: ['user-siti'],
    memberUserIds: ['user-siti', 'user-budi'],
    createdAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'team-keu',
    name: 'Keuangan & Perencanaan Anggaran',
    code: 'KEU',
    description: 'Pengelolaan anggaran DIPA, perbendaharaan, uang muka kerja, pertanggungjawaban honorarium, dan SPJ.',
    adminUserIds: ['user-ahmad'],
    memberUserIds: ['user-ahmad'],
    createdAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'team-hukum',
    name: 'Hukum, Regulasi & Kerjasama',
    code: 'HKM',
    description: 'Harmonisasi regulasi, telaah hukum, sinkronisasi JDIH, dan perancangan SOP instansi.',
    adminUserIds: ['user-endang'],
    memberUserIds: ['user-endang'],
    createdAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'team-ti',
    name: 'Teknologi Informasi & Keamanan Siber',
    code: 'TI',
    description: 'Infrastruktur server, jaringan VPN kantor, keamanan informasi ISO 27001, dan portal internal.',
    adminUserIds: ['user-rizky'],
    memberUserIds: ['user-rizky'],
    createdAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'team-umum',
    name: 'Umum & Pengadaan Barang/Jasa',
    code: 'PBJ',
    description: 'Pengadaan langsung, pengelolaan aset BMN, persuratan, dan sarana prasarana perkantoran.',
    adminUserIds: ['user-dian'],
    memberUserIds: ['user-dian'],
    createdAt: '2024-01-10T08:00:00Z',
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-guest',
    name: 'Tamu Publik (Guest)',
    email: 'tamu@instansi.go.id',
    role: 'Guest',
    teamIds: [],
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-10-15T08:00:00Z',
  },
  {
    id: 'user-budi',
    name: 'Budi Santoso, S.Kom',
    nip: '198904122015031002',
    email: 'budi.santoso@instansi.go.id',
    role: 'User',
    teamIds: ['team-sdm'],
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-01-15T09:00:00Z',
    lastLoginAt: '2024-10-15T09:30:00Z',
  },
  {
    id: 'user-siti',
    name: 'Siti Rahmawati, S.E.',
    nip: '198402152008122001',
    email: 'siti.rahmawati@instansi.go.id',
    role: 'Admin Tim',
    teamIds: ['team-sdm'],
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-01-10T08:00:00Z',
    lastLoginAt: '2024-10-15T10:15:00Z',
  },
  {
    id: 'user-ahmad',
    name: 'Ahmad Hidayat, M.Ak',
    nip: '198207102006041003',
    email: 'ahmad.hidayat@instansi.go.id',
    role: 'Admin Tim',
    teamIds: ['team-keu'],
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-01-10T08:00:00Z',
    lastLoginAt: '2024-10-15T11:00:00Z',
  },
  {
    id: 'user-rizky',
    name: 'Rizky Pratama, M.T.',
    nip: '199105232018011001',
    email: 'rizky.pratama@instansi.go.id',
    role: 'Admin Tim',
    teamIds: ['team-ti'],
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-01-12T08:00:00Z',
    lastLoginAt: '2024-10-15T07:45:00Z',
  },
  {
    id: 'user-endang',
    name: 'Dra. Endang Wulandari, M.Si',
    nip: '197508241999032001',
    email: 'endang.wulandari@instansi.go.id',
    role: 'Super Admin',
    teamIds: ['team-hukum', 'team-sdm', 'team-keu', 'team-ti', 'team-umum'],
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-01-01T08:00:00Z',
    lastLoginAt: '2024-10-15T11:45:00Z',
  },
];

export const INITIAL_DOCUMENTS: Document[] = [
  {
    id: 'doc-sop-perjadin',
    title: 'SOP Pelaksanaan dan Pertanggungjawaban Perjalanan Dinas Luar Kota',
    documentNumber: 'SOP/SDM/2024/001',
    year: 2024,
    documentType: 'SOP',
    sourceType: 'Google Drive',
    sourceUrl: 'https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9-perjadin/view',
    ownerTeamId: 'team-sdm',
    ownerTeamName: 'Kepegawaian & Pengembangan SDM',
    visibility: 'Publik',
    sharedTeamIds: [],
    sharedUserIds: [],
    downloadAllowed: true,
    indexStatus: 'Terindeks',
    legalStatus: 'Berlaku',
    legalStatusNote: 'Mengacu pada PMK No. 49/PMK.02/2023 tentang Standar Biaya Masukan Tahun 2024.',
    baseRegulationIds: ['doc-jdih-pmk-49-2023'],
    replacementDocumentId: null,
    version: 2,
    tags: ['perjadin', 'sppd', 'transportasi', 'uang harian', 'tiket'],
    lastSyncedAt: '2024-10-14T02:00:00Z',
    createdBy: 'user-siti',
    createdByName: 'Siti Rahmawati, S.E.',
    updatedAt: '2024-06-15T09:30:00Z',
    indexedText: `
PROSEDUR PERJALANAN DINAS LUAR KOTA:
1. Tahap Pengajuan: Pegawai wajib mengajukan Nota Dinas Permohonan Tugas paling lambat H-5 hari kerja sebelum tanggal keberangkatan melalui e-Office.
2. Lampiran Pengajuan: Menyertakan Kerangka Acuan Kerja (KAK), undangan resmi dari penyelenggara, dan estimasi rincian biaya riil.
3. Penerbitan Surat Tugas: Ditandatangani oleh Pejabat Pimpinan Tinggi Pratama (Eselon II) atau Kepala Satuan Kerja.
4. Tiket dan Penginapan: Pembelian tiket transportasi resmi (ekonomi) dan pemesanan penginapan sesuai batas plafon SBM 2024.
5. Pertanggungjawaban (SPJ): Pegawai wajib menyerahkan laporan pelaksanaan tugas, boarding pass asli, invoice hotel, dan formulir kuitansi riil paling lambat 5 (lima) hari kerja setelah kembali.
6. Konsekuensi Keterlambatan: Keterlambatan SPJ lebih dari 10 hari mengakibatkan penundaan pencairan perjadin berikutnya.
    `,
    clauses: [
      { title: 'Pasal 3: Ketentuan Pengajuan H-5', content: 'Permohonan perjalanan dinas harus diajukan minimal 5 hari sebelum tugas dimulai dengan disposisi atasan langsung.' },
      { title: 'Pasal 7: Dokumen Pertanggungjawaban SPJ', content: 'Bukti fisik boarding pass, invoice hotel resmi ber-NPWP, serta kuitansi pengeluaran riil wajib diserahkan dalam 5 hari kerja.' },
      { title: 'Pasal 9: Besaran Uang Harian', content: 'Uang harian diberikan sesuai Standar Biaya Masukan PMK 49/2023 berdasarkan provinsi tujuan.' }
    ]
  },
  {
    id: 'doc-sop-cuti',
    title: 'SOP Pengajuan dan Verifikasi Cuti ASN (Tahunan, Sakit, Alasan Penting)',
    documentNumber: 'SOP/SDM/2023/004',
    year: 2023,
    documentType: 'SOP',
    sourceType: 'Google Drive',
    sourceUrl: 'https://drive.google.com/file/d/2B3C4D5E6F7G8H9I0-cuti/view',
    ownerTeamId: 'team-sdm',
    ownerTeamName: 'Kepegawaian & Pengembangan SDM',
    visibility: 'Publik',
    sharedTeamIds: [],
    sharedUserIds: [],
    downloadAllowed: true,
    indexStatus: 'Terindeks',
    legalStatus: 'Berlaku',
    legalStatusNote: 'Sesuai dengan Peraturan BKN No. 24 Tahun 2017 tentang Tata Cara Pemberian Cuti PNS.',
    baseRegulationIds: [],
    replacementDocumentId: null,
    version: 1,
    tags: ['cuti', 'cuti tahunan', 'cuti sakit', 'cuti alasan penting', 'asn', 'pns'],
    lastSyncedAt: '2024-10-14T02:00:00Z',
    createdBy: 'user-siti',
    createdByName: 'Siti Rahmawati, S.E.',
    updatedAt: '2023-08-20T14:10:00Z',
    indexedText: `
PROSEDUR PENGAJUAN CUTI ASN:
1. Hak Cuti Tahunan: Pegawai ASN berhak atas 12 hari kerja cuti tahunan setelah bekerja terus menerus selama 1 (satu) tahun.
2. Alur Pengajuan:
   a. Mengisi form e-Cuti pada portal SIMPEG instansi.
   b. Meminta persetujuan atasan langsung (Pejabat Pengawas/Administrator).
   c. Verifikasi administrasi oleh Tim Kepegawaian & SDM (maksimal 2x24 jam).
   d. Penerbitan Surat Keputusan Cuti oleh Pejabat Pembina Kepegawaian / Kepala Biro SDM.
3. Cuti Sakit: Wajib melampirkan surat keterangan dokter pemerintah untuk sakit lebih dari 1 (satu) hari.
4. Cuti Alasan Penting: Diberikan untuk anggota keluarga inti sakit keras/meninggal atau melangsungkan perkawinan (maksimal 1 bulan).
    `,
    clauses: [
      { title: 'Ketentuan Hak Cuti Tahunan', content: 'Cuti tahunan yang tidak diambil dalam tahun bersangkutan dapat diambil dalam tahun berikutnya maksimal 6 hari kerja.' },
      { title: 'Persyaratan Cuti Sakit', content: 'Cuti sakit lebih dari 14 hari wajib dilengkapi surat keterangan tim penguji kesehatan yang ditunjuk Menkes.' }
    ]
  },
  {
    id: 'doc-sop-honor',
    title: 'SOP Pencairan Uang Muka Kerja dan Pertanggungjawaban Honorarium Kegiatan',
    documentNumber: 'SOP/KEU/2024/009',
    year: 2024,
    documentType: 'SOP',
    sourceType: 'Google Drive',
    sourceUrl: 'https://drive.google.com/file/d/3C4D5E6F7G8H9I0J1-honor/view',
    ownerTeamId: 'team-keu',
    ownerTeamName: 'Keuangan & Perencanaan Anggaran',
    visibility: 'Terbagi',
    sharedTeamIds: ['team-sdm', 'team-hukum'],
    sharedUserIds: [],
    downloadAllowed: true,
    indexStatus: 'Terindeks',
    legalStatus: 'Berlaku',
    legalStatusNote: 'Dokumen berstatus Terbagi untuk unit pengusul kegiatan.',
    baseRegulationIds: ['doc-jdih-pmk-49-2023'],
    replacementDocumentId: null,
    version: 3,
    tags: ['keuangan', 'honor', 'honorarium', 'narasumber', 'uang persediaan', 'pajak pph21'],
    lastSyncedAt: '2024-10-14T02:00:00Z',
    createdBy: 'user-ahmad',
    createdByName: 'Ahmad Hidayat, M.Ak',
    updatedAt: '2024-05-10T11:20:00Z',
    indexedText: `
STANDAR OPERASIONAL PROSEDUR PENCAIRAN HONORARIUM NARASUMBER & MODERATOR:
1. Persyaratan Pengajuan Honor:
   a. Surat Keputusan (SK) atau Surat Penugasan Panitia dan Narasumber dari Pejabat Pembuat Komitmen (PPK).
   b. Daftar hadir fisik/digital peserta dan narasumber.
   c. Notula hasil kegiatan atau laporan materi presentasi.
   d. Dokumentasi foto/rekaman jalannya acara.
   e. Salinan NPWP dan nomor rekening bank aktif atas nama narasumber.
2. Pemotongan Pajak PPh Pasal 21:
   - Golongan III: 5% (memiliki NPWP)
   - Golongan IV: 15% (memiliki NPWP)
   - Non-ASN: Mengacu tarif PPh 21 Pasal 17 UU HPP.
3. Jangka Waktu Pencairan: Bendahara Pengeluaran memproses transfer paling lambat 3 (tiga) hari kerja setelah berkas diverifikasi lengkap dan sah oleh PPK.
    `,
    clauses: [
      { title: 'Persyaratan Administrasi', content: 'SK PPK, notula, daftar hadir resmi, dan NPWP wajib diverifikasi sebelum pengajuan SPP-LS.' },
      { title: 'Besaran Honor Narasumber', content: 'Besaran tarif honor mengacu pada PMK No. 49 Tahun 2023 dengan batasan maksimal per jam pelajaran.' }
    ]
  },
  {
    id: 'doc-sop-vpn',
    title: 'SOP Manajemen Akses Jaringan VPN Internal dan Kredensial Server Data Center',
    documentNumber: 'SOP/TI/2024/002',
    year: 2024,
    documentType: 'SOP',
    sourceType: 'Google Drive',
    sourceUrl: 'https://drive.google.com/file/d/4D5E6F7G8H9I0J1K2-vpn-datacenter/view',
    ownerTeamId: 'team-ti',
    ownerTeamName: 'Teknologi Informasi & Keamanan Siber',
    visibility: 'Hanya Tim',
    sharedTeamIds: [],
    sharedUserIds: [],
    downloadAllowed: false, // Strict download disabled!
    indexStatus: 'Terindeks',
    legalStatus: 'Berlaku',
    legalStatusNote: 'Dokumen rahasia internal tim TI. Izin unduh dinonaktifkan.',
    baseRegulationIds: ['doc-jdih-permen-03-2024'],
    replacementDocumentId: null,
    version: 1,
    tags: ['vpn', 'keamanan', 'server', 'kredensial', 'firewall', 'hanya tim'],
    lastSyncedAt: '2024-10-14T02:00:00Z',
    createdBy: 'user-rizky',
    createdByName: 'Rizky Pratama, M.T.',
    updatedAt: '2024-03-01T16:00:00Z',
    indexedText: `
SOP AKSES VPN & SERVER INTERNAL INSTANSI (HANYA TIM TI):
1. Klasifikasi Rahasia: Dokumen ini berstatus Hanya Tim TI dan dilarang disebarluaskan.
2. Pemberian Akun VPN:
   - Wajib menggunakan autentikasi 2 faktor (MFA/TOTP).
   - Kredensial di-rotate setiap 90 hari kalender.
3. Larangan Penggunaan: Dilarang menggunakan VPN kantor pada jaringan Wi-Fi publik terbuka tanpa enkripsi TLS.
4. Akses Root/Bastion Server: Wajib dicatat di SIEM log dan diawasi oleh Admin Keamanan Siber.
    `,
    clauses: [
      { title: 'Pasal 2: Kerahasiaan Kredensial', content: 'Kunci privat dan token MFA tidak boleh disimpan di cloud non-resmi.' }
    ]
  },
  {
    id: 'doc-jdih-pmk-49-2023',
    title: 'Peraturan Menteri Keuangan Nomor 49/PMK.02/2023 tentang Standar Biaya Masukan Tahun Anggaran 2024',
    documentNumber: '49/PMK.02/2023',
    year: 2023,
    documentType: 'Peraturan Menteri',
    sourceType: 'JDIH',
    sourceUrl: 'https://jdih.kemenkeu.go.id/dokumen/detail/49-pmk-02-2023',
    ownerTeamId: null,
    ownerTeamName: 'Kementerian Keuangan (JDIH)',
    visibility: 'Publik',
    sharedTeamIds: [],
    sharedUserIds: [],
    downloadAllowed: true,
    indexStatus: 'Terindeks',
    legalStatus: 'Berlaku',
    legalStatusNote: 'Sinkronisasi JDIH terverifikasi resmi pada 2024-10-15 04:00:00 WIB.',
    baseRegulationIds: [],
    replacementDocumentId: null,
    version: 1,
    tags: ['sbm', 'pmk', 'keuangan', 'uang harian', 'transport', 'hotel', 'honor'],
    lastSyncedAt: '2024-10-15T04:00:00Z',
    createdBy: 'system-jdih',
    createdByName: 'Sinkronisasi Otomatis JDIH',
    updatedAt: '2024-10-15T04:00:00Z',
    indexedText: `
STANDAR BIAYA MASUKAN (SBM) TAHUN 2024 (PMK NO. 49/PMK.02/2023):
- Satuan Biaya Uang Harian Perjalanan Dinas Dalam Negeri:
  * DKI Jakarta: Rp 530.000 / hari
  * Jawa Barat: Rp 430.000 / hari
  * Jawa Timur: Rp 410.000 / hari
  * Bali: Rp 480.000 / hari
- Satuan Biaya Penginapan Hotel (Pejabat Eselon III/Golongan IV):
  * DKI Jakarta: Maksimal Rp 1.490.000 / malam
  * Luar DKI: Menyesuaikan tabel lampiran II PMK 49/2023.
- Honorarium Narasumber/Pakar (Eselon II ke atas / Pakar): Maksimal Rp 1.400.000 per Orang/Jam Pelajaran (OJ).
    `,
    clauses: [
      { title: 'Tabel Uang Harian Perjadin', content: 'Daftar nominal uang saku dan uang makan perjadin per provinsi sesuai lampiran I PMK 49/2023.' },
      { title: 'Standar Honorarium Narasumber', content: 'Pembayaran honor narasumber dibatasi maksimal 3 jam per sesi atau ketentuan pagu DIPA.' }
    ]
  },
  {
    id: 'doc-jdih-permen-12-2021',
    title: 'Peraturan Menteri Kominfo Nomor 12 Tahun 2021 tentang Pedoman Tata Kelola Keamanan TI Instansi',
    documentNumber: '12 Tahun 2021',
    year: 2021,
    documentType: 'Peraturan Menteri',
    sourceType: 'JDIH',
    sourceUrl: 'https://jdih.komdigi.go.id/dokumen/detail/permen-12-2021',
    ownerTeamId: null,
    ownerTeamName: 'Kementerian Komunikasi dan Digital (JDIH)',
    visibility: 'Publik',
    sharedTeamIds: [],
    sharedUserIds: [],
    downloadAllowed: true,
    indexStatus: 'Terindeks',
    legalStatus: 'Tidak Berlaku',
    legalStatusNote: 'PERINGATAN: Regulasi ini telah DICABUT dan DIGANTIKAN oleh Peraturan Menteri Komdigi Nomor 3 Tahun 2024 tentang Tata Kelola Keamanan Siber.',
    baseRegulationIds: [],
    replacementDocumentId: 'doc-jdih-permen-03-2024',
    replacementDocumentTitle: 'Peraturan Menteri Komunikasi dan Digital Nomor 3 Tahun 2024',
    version: 1,
    tags: ['keamanan siber', 'tata kelola ti', 'komdigi', 'permen', 'tidak berlaku', 'dicabut'],
    lastSyncedAt: '2024-10-15T04:00:00Z',
    createdBy: 'system-jdih',
    createdByName: 'Sinkronisasi Otomatis JDIH',
    updatedAt: '2024-10-15T04:00:00Z',
    indexedText: `
[PERATURAN SUDAH TIDAK BERLAKU / DICABUT]
Peraturan Menteri ini mengatur tata kelola sistem informasi instansi pemerintah tahun 2021.
PEMBERITAHUAN HUKUM: Seluruh ketentuan teknis enkripsi dan sertifikasi sistem dalam peraturan ini sudah tidak mengikat sejak diundangkannya Permenkomdigi No. 3 Tahun 2024.
    `,
    clauses: [
      { title: 'Ketentuan Pencabutan', content: 'Dicabut dan dinyatakan tidak berlaku oleh Permenkomdigi No. 3 Tahun 2024.' }
    ]
  },
  {
    id: 'doc-jdih-permen-03-2024',
    title: 'Peraturan Menteri Komunikasi dan Digital Nomor 3 Tahun 2024 tentang Tata Kelola Keamanan Siber dan Sistem Elektronik Pemerintahan',
    documentNumber: '3 Tahun 2024',
    year: 2024,
    documentType: 'Peraturan Menteri',
    sourceType: 'JDIH',
    sourceUrl: 'https://jdih.komdigi.go.id/dokumen/detail/permen-03-2024',
    ownerTeamId: null,
    ownerTeamName: 'Kementerian Komunikasi dan Digital (JDIH)',
    visibility: 'Publik',
    sharedTeamIds: [],
    sharedUserIds: [],
    downloadAllowed: true,
    indexStatus: 'Terindeks',
    legalStatus: 'Berlaku',
    legalStatusNote: 'Regulasi aktif pengganti Permen No. 12 Tahun 2021. Terverifikasi resmi JDIH.',
    baseRegulationIds: [],
    replacementDocumentId: null,
    version: 1,
    tags: ['keamanan siber', 'komdigi', 'spbe', 'iso 27001', 'perlindungan data', 'csirt'],
    lastSyncedAt: '2024-10-15T04:00:00Z',
    createdBy: 'system-jdih',
    createdByName: 'Sinkronisasi Otomatis JDIH',
    updatedAt: '2024-10-15T04:00:00Z',
    indexedText: `
PERATURAN MENTERI KOMUNIKASI DAN DIGITAL NO. 3 TAHUN 2024:
1. Ruang Lingkup: Wajib diterapkan oleh seluruh instansi pusat dan pemerintah daerah dalam penyelenggaraan Sistem Pemerintahan Berbasis Elektronik (SPBE).
2. Kewajiban CSIRT: Setiap instansi wajib membentuk Tim Tanggap Insiden Keamanan Siber (CSIRT) yang terdaftar di BSSN.
3. Kriptografi dan Enkripsi: Seluruh data transaksi kepegawaian dan keuangan wajib dienkripsi minimal AES-256 pada media penyimpanan dan TLS 1.3 pada transit.
4. Pencabutan Regulasi Lama: Mencabut dan menyatakan tidak berlaku Peraturan Menteri Kominfo Nomor 12 Tahun 2021.
    `,
    clauses: [
      { title: 'Pasal 4: Pembentukan CSIRT Instansi', content: 'Instansi wajib memiliki tim tanggap insiden siber bersertifikasi dalam 6 bulan sejak permen diundangkan.' },
      { title: 'Pasal 18: Standar Enkripsi dan Proteksi Data', content: 'Wajib menerapkan AES-256 untuk data at-rest dan TLS 1.3 untuk komunikasi jaringan publik.' }
    ]
  },
  {
    id: 'doc-jdih-se-05-2023',
    title: 'Surat Edaran Sekretaris Jenderal Nomor 5 Tahun 2023 tentang Penyesuaian Jam Kerja Fleksibel Pegawai ASN',
    documentNumber: 'SE.05/SJ/2023',
    year: 2023,
    documentType: 'Surat Edaran',
    sourceType: 'JDIH',
    sourceUrl: 'https://jdih.komdigi.go.id/dokumen/detail/se-05-2023',
    ownerTeamId: null,
    ownerTeamName: 'Kementerian Komunikasi dan Digital (JDIH)',
    visibility: 'Publik',
    sharedTeamIds: [],
    sharedUserIds: [],
    downloadAllowed: true,
    indexStatus: 'Terindeks',
    legalStatus: 'Belum Terverifikasi',
    legalStatusNote: 'PERINGATAN: Sinkronisasi JDIH tertunda lebih dari 24 jam. Status hukum belum terverifikasi dari portal pusat.',
    baseRegulationIds: [],
    replacementDocumentId: null,
    version: 1,
    tags: ['jam kerja', 'fleksibel', 'presensi', 'asn', 'wfo', 'wfh'],
    lastSyncedAt: '2024-10-10T11:00:00Z', // More than 24h ago!
    createdBy: 'system-jdih',
    createdByName: 'Sinkronisasi Otomatis JDIH',
    updatedAt: '2024-10-10T11:00:00Z',
    indexedText: `
SURAT EDARAN PENYESUAIAN JAM KERJA ASN:
1. Total Jam Kerja Efektif: 37,5 jam per minggu (tidak termasuk waktu istirahat).
2. Jam Masuk Kerja Fleksibel: Pukul 07.30 s.d. 08.30 WIB dengan kewajiban memenuhi durasi kerja harian.
3. Presensi Elektronik: Wajib melakukan presensi geofencing berbasis aplikasi presensi instansi.
CATATAN: Sinkronisasi data ke JDIH pusat sedang dalam proses pembaruan berkala.
    `,
    clauses: [
      { title: 'Butir 2: Fleksibilitas Jam Kedatangan', content: 'Pegawai yang hadir pukul 08.00 WIB wajib bekerja hingga 16.30 WIB untuk memenuhi kuota harian.' }
    ]
  },
  {
    id: 'doc-sop-pbj',
    title: 'SOP Pengadaan Barang dan Jasa Pengadaan Langsung Non-Tender (Nilai < 50 Juta)',
    documentNumber: 'SOP/PBJ/2023/012',
    year: 2023,
    documentType: 'SOP',
    sourceType: 'Google Drive',
    sourceUrl: 'https://drive.google.com/file/d/5E6F7G8H9I0J1K2L3-pbj-50jt/view',
    ownerTeamId: 'team-umum',
    ownerTeamName: 'Umum & Pengadaan Barang/Jasa',
    visibility: 'Publik',
    sharedTeamIds: [],
    sharedUserIds: [],
    downloadAllowed: true,
    indexStatus: 'Terindeks',
    legalStatus: 'Berlaku',
    legalStatusNote: 'Mengacu pada Perpres Nomor 12 Tahun 2021 tentang Perubahan atas Perpres 16/2018.',
    baseRegulationIds: [],
    replacementDocumentId: null,
    version: 1,
    tags: ['pengadaan', 'pbj', 'spk', 'kuitansi', 'pembelian langsung', 'bmn'],
    lastSyncedAt: '2024-10-14T02:00:00Z',
    createdBy: 'user-dian',
    createdByName: 'Dian Permana, S.T.',
    updatedAt: '2023-11-15T10:00:00Z',
    indexedText: `
SOP PENGADAAN LANGSUNG NILAI S.D. RP 50.000.000:
1. Tahap Kebutuhan: Unit kerja mengajukan Nota Dinas Kebutuhan Barang/Jasa ke PPK dilengkapi spesifikasi teknis dan HPS.
2. Pelaksanaan Transaksi:
   - Nilai s.d. Rp 10.000.000: Cukup bukti kuitansi / nota pembelian bertandatangan penjual berstempel.
   - Nilai Rp 10.000.001 s.d. Rp 50.000.000: Menggunakan Kuitansi bermaterai cukup dan Surat Pesanan sederhana.
3. Serah Terima: Pejabat Pengadaan atau PPHP melakukan pemeriksaan fisik kesesuaian spesifikasi barang dan menandatangani Berita Acara Serah Terima (BAST).
    `,
    clauses: [
      { title: 'Ketentuan Nilai Transaksi', content: 'Pembelian di bawah Rp 10 juta tidak mewajibkan SPK formil, cukup kuitansi sah dari penyedia.' }
    ]
  }
];

export const INITIAL_VERSIONS: DocumentVersion[] = [
  {
    id: 'ver-perjadin-1',
    documentId: 'doc-sop-perjadin',
    version: 1,
    sourceUrl: 'https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9-perjadin/v1',
    changeSummary: 'Versi perdana penyusunan SOP perjalanan dinas.',
    createdBy: 'user-siti',
    createdByName: 'Siti Rahmawati, S.E.',
    createdAt: '2023-02-10T08:00:00Z',
  },
  {
    id: 'ver-perjadin-2',
    documentId: 'doc-sop-perjadin',
    version: 2,
    sourceUrl: 'https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9-perjadin/view',
    changeSummary: 'Pembaruan plafon uang saku dan hotel menyesuaikan PMK No. 49 Tahun 2023 (SBM 2024).',
    createdBy: 'user-siti',
    createdByName: 'Siti Rahmawati, S.E.',
    createdAt: '2024-06-15T09:30:00Z',
  },
];

export const INITIAL_FEEDBACKS: FeedbackItem[] = [
  {
    id: 'fb-01',
    conversationId: 'conv-sample-1',
    documentId: 'doc-sop-perjadin',
    documentTitle: 'SOP Pelaksanaan dan Pertanggungjawaban Perjalanan Dinas Luar Kota',
    userId: 'user-budi',
    userName: 'Budi Santoso, S.Kom',
    type: 'Membantu',
    note: 'Sangat jelas! Rincian H-5 dan SPJ 5 hari kerja sangat membantu kami saat menyusun usulan dinas ke Surabaya.',
    questionSnippet: 'Berapa hari sebelum keberangkatan saya harus mengajukan surat tugas perjalanan dinas?',
    answerSnippet: 'Berdasarkan SOP/SDM/2024/001 Pasal 3, pengajuan wajib dilakukan paling lambat H-5 hari kerja sebelum tanggal keberangkatan...',
    reviewStatus: 'Ditinjau',
    adminNotes: 'Terima kasih atas masukannya. SOP ini akan terus dipertahankan.',
    createdAt: '2024-10-14T11:20:00Z',
  },
  {
    id: 'fb-02',
    conversationId: 'conv-sample-2',
    documentId: 'doc-jdih-se-05-2023',
    documentTitle: 'Surat Edaran Sekretaris Jenderal Nomor 5 Tahun 2023 tentang Penyesuaian Jam Kerja Fleksibel',
    userId: 'user-budi',
    userName: 'Budi Santoso, S.Kom',
    type: 'Laporan kekeliruan',
    note: 'Mohon dicek apakah aturan jam kerja fleksibel ini masih berlaku, karena muncul peringatan Belum Terverifikasi pada sinkronisasi JDIH.',
    questionSnippet: 'Apakah jam kerja fleksibel ASN instansi kita masih berlaku?',
    answerSnippet: 'Status dokumen Surat Edaran SE.05/SJ/2023 berstatus Belum Terverifikasi karena sinkronisasi JDIH terakhir melebihi 24 jam...',
    reviewStatus: 'Baru',
    adminNotes: null,
    createdAt: '2024-10-15T08:15:00Z',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-01',
    actorUserId: 'user-endang',
    actorName: 'Dra. Endang Wulandari, M.Si',
    actorRole: 'Super Admin',
    action: 'JDIH_SYNC_SUCCESS',
    resourceType: 'JDIHSync',
    resourceId: 'sync-log-01',
    resourceTitle: 'Sinkronisasi Otomatis Portal JDIH Komdigi',
    teamId: null,
    metadata: { records: 4, updated: 1, revoked: 1 },
    createdAt: '2024-10-15T04:00:00Z',
  },
  {
    id: 'audit-02',
    actorUserId: 'user-siti',
    actorName: 'Siti Rahmawati, S.E.',
    actorRole: 'Admin Tim',
    action: 'UPDATE_DOCUMENT_METADATA',
    resourceType: 'Document',
    resourceId: 'doc-sop-perjadin',
    resourceTitle: 'SOP Pelaksanaan dan Pertanggungjawaban Perjalanan Dinas Luar Kota',
    teamId: 'team-sdm',
    metadata: { version: 2, legalStatus: 'Berlaku' },
    createdAt: '2024-06-15T09:30:00Z',
  },
  {
    id: 'audit-03',
    actorUserId: 'user-rizky',
    actorName: 'Rizky Pratama, M.T.',
    actorRole: 'Admin Tim',
    action: 'SET_VISIBILITY_RESTRICTED',
    resourceType: 'Document',
    resourceId: 'doc-sop-vpn',
    resourceTitle: 'SOP Manajemen Akses Jaringan VPN Internal dan Kredensial Server Data Center',
    teamId: 'team-ti',
    metadata: { visibility: 'Hanya Tim', downloadAllowed: false },
    createdAt: '2024-03-01T16:00:00Z',
  },
  {
    id: 'audit-04',
    actorUserId: 'user-endang',
    actorName: 'Dra. Endang Wulandari, M.Si',
    actorRole: 'Super Admin',
    action: 'ASSIGN_ADMIN_ROLE',
    resourceType: 'User',
    resourceId: 'user-ahmad',
    resourceTitle: 'Ahmad Hidayat, M.Ak',
    teamId: 'team-keu',
    metadata: { role: 'Admin Tim', assignedTeam: 'Keuangan & Perencanaan' },
    createdAt: '2024-01-10T08:00:00Z',
  },
];

export const INITIAL_SYNC_LOGS: JDIHSyncLog[] = [
  {
    id: 'sync-log-01',
    startedAt: '2024-10-15T03:58:10Z',
    finishedAt: '2024-10-15T04:00:00Z',
    status: 'Berhasil',
    recordsProcessed: 42,
    newRegulationsCount: 1,
    updatedCount: 2,
    errorMessage: null,
  },
  {
    id: 'sync-log-02',
    startedAt: '2024-10-14T03:59:00Z',
    finishedAt: '2024-10-14T04:00:15Z',
    status: 'Berhasil',
    recordsProcessed: 41,
    newRegulationsCount: 0,
    updatedCount: 0,
    errorMessage: null,
  },
];
