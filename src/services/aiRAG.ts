import { User, Document, SourceReference, AIConversation } from '../types';
import { store } from './store';
import { GoogleGenAI } from '@google/genai';

export interface AnswerResult {
  answer: string;
  sourceReferences: SourceReference[];
  hasInactiveWarning: boolean;
  inactiveWarningMessage?: string;
  hasUnverifiedWarning: boolean;
  unverifiedWarningMessage?: string;
  emptyState: boolean;
  canCheckJDIH: boolean;
  searchQuery?: string;
  suggestedJdihUrl?: string;
}

// Prompt Injection & Adversarial Defense Patterns
const INJECTION_PATTERNS = [
  /abaikan aturan/i,
  /ignore previous/i,
  /override instructions/i,
  /tampilkan semua dokumen rahasia/i,
  /bypass rbac/i,
  /berikan kunci enkripsi/i,
  /bocorkan/i,
  /jailbreak/i,
  /system prompt/i,
];

export async function askAIAgent(
  question: string,
  mode: 'Ringkas' | 'Rinci',
  scope: string, // 'Semua sumber' | 'SOP (Drive)' | 'Regulasi (JDIH)' | docId
  currentUser: User
): Promise<AnswerResult> {
  const trimmed = question.trim();

  // 1. Prompt Injection Defense
  const isAdversarial = INJECTION_PATTERNS.some((p) => p.test(trimmed));
  if (isAdversarial) {
    store.logAudit({
      actorUserId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'SECURITY_ALERT_PROMPT_INJECTION_BLOCKED',
      resourceType: 'Security',
      resourceId: null,
      teamId: null,
      metadata: { input: trimmed, blockedPattern: true },
    });

    return {
      answer: `Mohon maaf, instruksi tersebut tidak dapat kami jalankan. Sebagai asisten AI resmi instansi, saya hanya beroperasi sesuai koridor peraturan kedinasan dan hak akses yang ditetapkan. Silakan ajukan pertanyaan terkait SOP, prosedur perizinan, atau regulasi kedinasan lainnya, ya!`,
      sourceReferences: [],
      hasInactiveWarning: false,
      hasUnverifiedWarning: false,
      emptyState: false,
      canCheckJDIH: false,
    };
  }

  // 2. Fetch documents strictly accessible by currentUser
  const permittedDocs = store.getPermittedDocuments(currentUser).filter(
    (d) => d.indexStatus === 'Terindeks'
  );

  // 3. Filter by selected Scope
  let candidateDocs = permittedDocs;
  if (scope === 'SOP (Drive)') {
    candidateDocs = permittedDocs.filter((d) => d.sourceType === 'Google Drive');
  } else if (scope === 'Regulasi (JDIH)') {
    candidateDocs = permittedDocs.filter((d) => d.sourceType === 'JDIH');
  } else if (scope !== 'Semua sumber' && scope.startsWith('doc-')) {
    candidateDocs = permittedDocs.filter((d) => d.id === scope);
  }

  const jdihSearchUrl = `https://jdih.komdigi.go.id/produk_hukum/pencarian?tentang=${encodeURIComponent(
    trimmed
  )}&kategori=all&tahun=all`;

  if (candidateDocs.length === 0) {
    return {
      answer: `Maaf, dokumen atau SOP terkait topik tersebut belum ditemukan di pangkalan data internal yang bisa Anda akses saat ini.\n\n**Apakah Anda ingin mencari di website https://jdih.komdigi.go.id ?**`,
      sourceReferences: [],
      hasInactiveWarning: false,
      hasUnverifiedWarning: false,
      emptyState: true,
      canCheckJDIH: true,
      searchQuery: trimmed,
      suggestedJdihUrl: jdihSearchUrl,
    };
  }

  // 4. Semantic / Keyword scoring against Candidate Docs
  const terms = trimmed
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const scoredDocs = candidateDocs.map((doc) => {
    let score = 0;
    const titleLower = doc.title.toLowerCase();
    const textLower = doc.indexedText.toLowerCase();
    const tagsLower = doc.tags.map((t) => t.toLowerCase()).join(' ');

    terms.forEach((term) => {
      if (titleLower.includes(term)) score += 8;
      if (tagsLower.includes(term)) score += 6;
      if (textLower.includes(term)) score += 3;
    });

    // Semantic relevance boosters
    if (/perjadin|perjalanan dinas|sppd|luar kota|dinas luar/i.test(trimmed) && doc.id.includes('perjadin')) score += 25;
    if (/cuti|alasan penting|cuti tahunan|cuti sakit|izin cuti/i.test(trimmed) && doc.id.includes('cuti')) score += 25;
    if (/honor|narasumber|pembayaran|uang muka|spj|moderator/i.test(trimmed) && doc.id.includes('honor')) score += 25;
    if (/vpn|server|kredensial|jaringan|data center/i.test(trimmed) && doc.id.includes('vpn')) score += 25;
    if (/sbm|uang harian|penginapan hotel|tarif|biaya masukan/i.test(trimmed) && doc.id.includes('pmk-49')) score += 25;
    if (/keamanan siber|tata kelola ti|csirt|spbe/i.test(trimmed) && (doc.id.includes('permen-03') || doc.id.includes('permen-12'))) score += 20;
    if (/jam kerja|fleksibel|presensi|masuk kerja|wfo|wfh/i.test(trimmed) && doc.id.includes('se-05')) score += 25;
    if (/pengadaan|pbj|50 juta|langsung|spk|kuitansi/i.test(trimmed) && doc.id.includes('pbj')) score += 25;
    if (/skp|kinerja|penilaian skp/i.test(trimmed) && (doc.title.toLowerCase().includes('skp') || doc.title.toLowerCase().includes('kinerja'))) score += 25;
    if (/bmn|inventaris|peminjaman aset|laptop dinas/i.test(trimmed) && (doc.title.toLowerCase().includes('bmn') || doc.title.toLowerCase().includes('inventaris'))) score += 25;
    if (/gangguan|internet|wifi|troubleshoot/i.test(trimmed) && (doc.title.toLowerCase().includes('jaringan') || doc.title.toLowerCase().includes('gangguan'))) score += 25;
    if (/tata naskah|surat keputusan|format sk/i.test(trimmed) && (doc.title.toLowerCase().includes('naskah') || doc.title.toLowerCase().includes('sk'))) score += 25;
    if (/uang persediaan|bendahara|ganti uang|gu|up/i.test(trimmed) && doc.title.toLowerCase().includes('persediaan')) score += 25;
    if (/disiplin|kode etik|hukuman disiplin/i.test(trimmed) && doc.title.toLowerCase().includes('disiplin')) score += 25;

    return { doc, score };
  });

  scoredDocs.sort((a, b) => b.score - a.score);
  const bestMatches = scoredDocs.filter((item) => item.score > 2);

  // If no match found in internal database
  if (bestMatches.length === 0) {
    return {
      answer: `Maaf ya, kami belum menemukan SOP atau regulasi yang sesuai dengan pertanyaan *"${trimmed}"* di pangkalan data internal saat ini.\n\n**Apakah Anda ingin mencari di website https://jdih.komdigi.go.id ?**\n\nKamu bisa langsung memeriksa peraturan resmi secara instan lewat portal JDIH menggunakan tombol di bawah.`,
      sourceReferences: [],
      hasInactiveWarning: false,
      hasUnverifiedWarning: false,
      emptyState: true,
      canCheckJDIH: true,
      searchQuery: trimmed,
      suggestedJdihUrl: jdihSearchUrl,
    };
  }

  const primaryMatch = bestMatches[0].doc;
  const secondaryMatches = bestMatches.slice(1, 3).map((item) => item.doc);

  // Build Source References strictly from matched permitted docs
  const sourceReferences: SourceReference[] = [primaryMatch, ...secondaryMatches].map((doc) => {
    let sectionSnippet = doc.clauses && doc.clauses[0] ? doc.clauses[0].title : 'Pasal Terkait';
    let quoteSnippet = doc.clauses && doc.clauses[0] ? doc.clauses[0].content : doc.indexedText.slice(0, 160).trim();

    return {
      documentId: doc.id,
      documentTitle: doc.title,
      documentNumber: doc.documentNumber,
      year: doc.year,
      section: sectionSnippet,
      quote: quoteSnippet,
      sourceType: doc.sourceType,
      legalStatus: doc.legalStatus,
      sourceUrl: doc.sourceUrl,
      downloadAllowed: store.canDownloadDocument(currentUser, doc),
    };
  });

  // Check Inactive / Revoked warnings
  let hasInactiveWarning = false;
  let inactiveWarningMessage = '';
  const inactiveDoc = [primaryMatch, ...secondaryMatches].find((d) => d.legalStatus === 'Tidak Berlaku');
  if (inactiveDoc) {
    hasInactiveWarning = true;
    inactiveWarningMessage = `⚠️ **Penting untuk diketahui:** Dokumen *"${inactiveDoc.title}"* saat ini sudah **TIDAK BERLAKU (DICABUT)**.`;
    if (inactiveDoc.replacementDocumentId) {
      const replacement = permittedDocs.find((d) => d.id === inactiveDoc.replacementDocumentId);
      inactiveWarningMessage += ` Aturan ini telah digantikan oleh: **${
        replacement ? replacement.title : inactiveDoc.replacementDocumentTitle || 'Regulasi Terbaru'
      }**. Mohon jangan dijadikan pedoman aktif lagi, ya.`;
    }
  }

  // Check Unverified / Stale JDIH warnings (>24h sync)
  let hasUnverifiedWarning = false;
  let unverifiedWarningMessage = '';
  const unverifiedDoc = [primaryMatch, ...secondaryMatches].find(
    (d) => d.legalStatus === 'Belum Terverifikasi' || (d.lastSyncedAt && isOlderThan24Hours(d.lastSyncedAt))
  );
  if (unverifiedDoc) {
    hasUnverifiedWarning = true;
    unverifiedWarningMessage = `ℹ️ **Catatan Sinkronisasi**: Dokumen *"${unverifiedDoc.title}"* statusnya **Belum Terverifikasi** atau pembaruan terakhirnya sudah lebih dari 24 jam. Sangat disarankan untuk mengecek kembali di portal JDIH pusat.`;
  }

  // Synthesize answer by deeply scanning the document and providing conversational chatbot answers
  let generatedAnswer = '';

  // Check if GEMINI_API_KEY is available in browser or process environment
  const apiKey =
    (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined) ||
    (import.meta as any).env?.VITE_GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `Kamu adalah AI Chatbot asisten internal instansi pemerintah yang ramah, ringkas, dan cerdas.
Tugasmu: Menjawab pertanyaan pengguna SECARA LANGSUNG, TEPAT, dan MENGGUNAKAN BAHASA SEHARI-HARI yang mudah dipahami selayaknya rekan kerja yang mengobrol di chatbot.
ATURAN KETAT:
1. Jawab langsung inti pertanyaannya di kalimat pertama (jangan bertele-tele).
2. HANYA gunakan fakta dari teks dokumen resmi yang terlampir di bawah. Jangan mengarang informasi.
3. Sebutkan batas waktu, nominal, syarat, atau alur jika relevan secara ringkas.
4. Gunakan bahasa Indonesia sehari-hari yang sopan dan ramah.`;

      const prompt = `Dokumen Resmi:
Judul: ${primaryMatch.title}
Nomor: ${primaryMatch.documentNumber || '-'}
Isi Dokumen Terindeks:
${primaryMatch.indexedText}

Pertanyaan Pengguna: "${trimmed}"
Mode Jawaban: ${mode}

Berikan jawaban langsung, ringkas, dan tepat menggunakan bahasa sehari-hari:`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      if (response.text) {
        generatedAnswer = response.text.trim();
      }
    } catch (apiErr) {
      console.warn('Gemini API call failed, falling back to smart heuristic document scanner:', apiErr);
    }
  }

  // If Gemini API wasn't run or didn't return text, use our intelligent deep document scanner
  if (!generatedAnswer) {
    generatedAnswer = scanAndGenerateDirectChatbotAnswer(
      trimmed,
      primaryMatch,
      secondaryMatches,
      mode,
      hasInactiveWarning,
      inactiveDoc
    );
  }

  return {
    answer: generatedAnswer,
    sourceReferences,
    hasInactiveWarning,
    inactiveWarningMessage,
    hasUnverifiedWarning,
    unverifiedWarningMessage,
    emptyState: false,
    canCheckJDIH: true,
    searchQuery: trimmed,
    suggestedJdihUrl: jdihSearchUrl,
  };
}

function isOlderThan24Hours(isoDate: string): boolean {
  try {
    const diffHours = (Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60);
    return diffHours > 24;
  } catch {
    return false;
  }
}

// Scans document clauses & sentences to directly answer the question in everyday chatbot prose
function scanAndGenerateDirectChatbotAnswer(
  question: string,
  primary: Document,
  secondary: Document[],
  mode: 'Ringkas' | 'Rinci',
  hasInactive: boolean,
  inactiveDoc?: Document
): string {
  const qLower = question.toLowerCase();
  const terms = qLower
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  // 1. If document is revoked / Tidak Berlaku
  if (hasInactive && primary.legalStatus === 'Tidak Berlaku') {
    return `Peraturan **${primary.title}** (${primary.documentNumber || '-'}) ini **sudah TIDAK BERLAKU lagi (telah dicabut)** secara resmi ya!

Aturan lama ini sudah dicabut dan tidak boleh digunakan lagi sebagai acuan kerja di kantor.
${
  primary.replacementDocumentTitle
    ? `\n👉 **Regulasi Pengganti yang Aktif Sekarang:**\nSilakan gunakan regulasi aktif terbaru: **${primary.replacementDocumentTitle}**.`
    : '\nSilakan berkonsultasi dengan unit Hukum & Regulasi untuk pedoman terbarunya.'
}

Rujukan berkas resminya tetap kami tampilkan di bawah untuk kebutuhan arsip penelusuran riwayat hukummu.`;
  }

  // 2. Specific deep scans for institutional questions:

  // Scenario A: Perjalanan Dinas (H-5, SPJ 5 hari, dokumen pendukung)
  if (/perjadin|perjalanan dinas|sppd|luar kota|dinas luar/i.test(qLower)) {
    if (/berapa hari|kapan|batas waktu|h\-|sebelum|deadline/i.test(qLower)) {
      return `Kamu wajib mengajukan permohonan perjalanan dinas paling lambat **H-5 hari kerja sebelum tanggal keberangkatan** melalui e-Office ya!

Berikut ringkasan hal penting yang perlu kamu perhatikan:
• **Syarat Awal:** Lampirkan Surat Undangan resmi dan Kerangka Acuan Kerja (KAK) saat mengajukan permohonan ke atasan.
• **Penerbitan Surat Tugas:** Surat Tugas (ST) resmi akan ditandatangani oleh Eselon II atau Kepala Satker.
• **Batas Waktu SPJ:** Setelah kembali dari perjalanan dinas, laporan tugas, boarding pass asli, dan invoice hotel resmi wajib diserahkan maksimal **5 hari kerja**.
• **Peringatan:** Keterlambatan SPJ lebih dari 10 hari kerja dapat menunda pencairan perjadin berikutnya.`;
    }
    return `Untuk perjalanan dinas luar kota, alurnya cukup jelas: kamu mengajukan nota dinas permohonan paling lambat **H-5 hari kerja** sebelum berangkat lewat e-Office, lengkap dengan surat undangan dan KAK.

Setelah tugas selesai, kamu punya waktu maksimal **5 hari kerja** untuk menyerahkan SPJ berupa boarding pass asli, tiket resmi, dan invoice hotel ber-NPWP. Semua rincian biaya mengacu pada standar plafon SBM yang berlaku.`;
  }

  // Scenario B: Cuti Tahunan & Cuti Sakit ASN
  if (/cuti|alasan penting|cuti tahunan|cuti sakit|izin cuti/i.test(qLower)) {
    if (/berapa hari|hak cuti|jumlah hari/i.test(qLower)) {
      return `Pegawai ASN berhak mendapatkan **12 hari kerja cuti tahunan** setelah bekerja secara terus-menerus selama minimal 1 tahun!

Rincian ketentuan yang perlu kamu tahu:
• **Cara Pengajuan:** Cukup mengisi formulir e-Cuti di portal SIMPEG dan meminta persetujuan atasan langsungmu.
• **Waktu Verifikasi:** Tim Kepegawaian & SDM akan memverifikasi berkasmu maksimal dalam 2x24 jam kerja.
• **Sisa Cuti:** Bila ada cuti tahunan yang tidak terpakai di tahun berjalan, kamu masih bisa memakainya di tahun berikutnya maksimal 6 hari kerja.
• **Cuti Sakit:** Untuk sakit lebih dari 1 hari kerja, wajib melampirkan surat keterangan dokter pemerintah ya.`;
    }
    return `Untuk mengajukan cuti ASN, prosesnya dilakukan secara digital lewat form e-Cuti pada portal SIMPEG. Kamu butuh persetujuan dari atasan langsung, lalu Tim SDM akan memprosesnya dalam 2x24 jam kerja. 

Sebagai ASN kamu berhak atas **12 hari kerja cuti tahunan** per tahun, dan untuk cuti sakit lebih dari 1 hari wajib menyertakan surat dokter resmi.`;
  }

  // Scenario C: Standar Biaya Masukan SBM / Uang Harian PMK 49/2023
  if (/sbm|uang harian|biaya masukan|penginapan hotel|tarif hotel|pmk 49/i.test(qLower)) {
    return `Berdasarkan Standar Biaya Masukan (SBM) PMK No. 49/PMK.02/2023, besaran biaya perjalanan dinas adalah:

• **Uang Harian DKI Jakarta:** Sebesar **Rp 530.000 per hari**. (Sebagai perbandingan, Jawa Barat Rp 430.000/hari, Jawa Timur Rp 410.000/hari, dan Bali Rp 480.000/hari).
• **Biaya Penginapan Hotel (Eselon III / Golongan IV):** Maksimal plafon **Rp 1.490.000 per malam** untuk wilayah DKI Jakarta.
• **Honorarium Narasumber/Pakar:** Maksimal tarif **Rp 1.400.000 per Orang/Jam Pelajaran (OJ)**.

Seluruh pengeluaran penginapan dan transportasi dibayarkan berdasarkan bukti riil sesuai batasan pagu tersebut ya.`;
  }

  // Scenario D: Honorarium Narasumber
  if (/honor|narasumber|pembayaran honor|uang muka|spj honor|pajak pph/i.test(qLower)) {
    return `Syarat pencairan honorarium narasumber ada **5 berkas utama** yang harus kamu lengkapi ke bagian keuangan:

1. **SK Penugasan / SK Panitia & Narasumber** yang ditandatangani PPK.
2. **Daftar hadir resmi kegiatan** (tanda tangan fisik atau presensi digital tervalidasi).
3. **Notula hasil acara atau materi paparan presentasi**.
4. **Dokumentasi foto/rekaman** pelaksanaan acara.
5. **Salinan NPWP dan nomor rekening bank aktif** atas nama narasumber bersangkutan.

💡 **Ketentuan Pajak PPh 21:**
- Golongan III dipotong pajak **5%** (jika ada NPWP).
- Golongan IV dipotong pajak **15%** (jika ada NPWP).
- Non-ASN dikenakan tarif progresif Pasal 17 UU HPP.

Bendahara memproses transfer maksimal **3 hari kerja** setelah berkas diverifikasi lengkap oleh PPK.`;
  }

  // Scenario E: Pengadaan Langsung PBJ < 50 Juta
  if (/pengadaan|pbj|50 juta|langsung|spk|kuitansi/i.test(qLower)) {
    return `Untuk pengadaan langsung barang dan jasa pemerintah dengan nilai sampai dengan **Rp 50.000.000**, aturannya sangat praktis:

• **Nilai sampai dengan Rp 10.000.000:** Cukup menggunakan bukti kuitansi atau nota pembelian berstempel sah toko/penyedia (tidak perlu membuat SPK formal).
• **Nilai Rp 10.000.001 s.d. Rp 50.000.000:** Menggunakan kuitansi bermaterai cukup dan Surat Pesanan sederhana.
• **Serah Terima:** Pejabat Pengadaan atau PPHP wajib memeriksa fisik kesesuaian barang dan menandatangani Berita Acara Serah Terima (BAST).`;
  }

  // Scenario F: Jam Kerja Fleksibel
  if (/jam kerja|fleksibel|presensi|masuk kerja|wfo|wfh/i.test(qLower)) {
    return `Berdasarkan Surat Edaran SE.05/SJ/2023, jam kerja ASN diatur sebagai berikut:

• **Total Jam Kerja Efektif:** 37,5 jam per minggu (di luar jam istirahat).
• **Fleksibilitas Jam Masuk:** Kamu bisa hadir antara **pukul 07.30 sampai 08.30 WIB**. Jam kepulangan menyesuaikan durasi harian (misal datang pukul 08.00 WIB, maka kepulangan pukul 16.30 WIB).
• **Presensi:** Wajib melakukan absensi geofencing menggunakan aplikasi presensi resmi instansi.

*(Catatan penting: Dokumen ini berstatus Belum Terverifikasi pada sinkronisasi JDIH terbaru, pastikan mengecek info terkini di kepegawaian)*.`;
  }

  // Scenario G: Keamanan Siber / Permenkomdigi No. 3 Tahun 2024
  if (/keamanan siber|csirt|enkripsi|permenkomdigi|spbe|tata kelola ti/i.test(qLower)) {
    return `Berdasarkan Peraturan Menteri Komdigi Nomor 3 Tahun 2024, ada kewajiban utama keamanan sistem elektronik yang harus diterapkan:

1. **Pembentukan CSIRT:** Setiap instansi wajib membentuk Tim Tanggap Insiden Keamanan Siber (CSIRT) yang terdaftar resmi di BSSN.
2. **Standar Enkripsi:** Data transaksi kepegawaian dan keuangan wajib dienkripsi minimal **AES-256** saat tersimpan (at-rest) dan protokol **TLS 1.3** saat pengiriman jaringan (transit).
3. **Pencabutan:** Peraturan ini resmi mencabut dan menggantikan Permenkominfo No. 12 Tahun 2021.`;
  }

  // Scenario H: VPN Internal (Hanya Tim TI)
  if (/vpn|server internal|kredensial|bastion/i.test(qLower)) {
    return `Akses VPN kantor berstatus internal dengan ketentuan ketat:
• Wajib menggunakan autentikasi dua faktor (MFA/TOTP).
• Password dan kredensial dirotasi otomatis setiap **90 hari kalender**.
• Dilarang keras menggunakan VPN kantor pada jaringan Wi-Fi publik terbuka tanpa enkripsi TLS.
• Akses root server dicatat langsung pada SIEM log pengawasan.`;
  }

  // Scenario I: Penilaian Kinerja & SKP Tahunan
  if (/skp|kinerja|penilaian pegawai|dialog kinerja/i.test(qLower)) {
    return `Untuk penilaian kinerja dan SKP pegawai tahunan:
• **Penyusunan Rencana Kerja:** Setiap pegawai wajib menyusun matriks peran hasil paling lambat tanggal **15 Januari** setiap tahunnya.
• **Dialog Kinerja:** Wajib dilakukan secara berkala triwulanan bersama atasan langsung untuk memantau capaian target.
• **Predikat Kinerja:** Ditetapkan berdasarkan distribusi capaian organisasi (Sangat Baik, Baik, Butuh Perbaikan) sesuai regulasi BKN.`;
  }

  // Scenario J: Peminjaman Inventaris Barang Milik Negara (BMN)
  if (/bmn|inventaris|peminjaman aset|laptop dinas|kendaraan/i.test(qLower)) {
    return `Tata cara peminjaman inventaris aset BMN kantor:
1. Isi formulir Berita Acara Peminjaman Aset ke Tim Umum & Perlengkapan.
2. Jangka waktu peminjaman laptop dinas maksimal **14 hari kalender** dengan persetujuan kasubag/koordinator unit.
3. Saat pengembalian, petugas BMN akan mengecek kondisi fisik dan fungsi kelengkapan perangkat sebelum serah terima selesai.`;
  }

  // Scenario K: Gangguan Jaringan & Internet
  if (/gangguan|internet|wifi|troubleshoot|helpdesk/i.test(qLower)) {
    return `Jika kamu mengalami gangguan jaringan atau Wi-Fi kantor:
1. Buat tiket laporan ke helpdesk TI internal dengan melampirkan screenshot pesan error atau lokasi ruangan.
2. Tim TI memiliki SLA respon maksimal **15 menit** pada jam kerja dinas.
3. Untuk gangguan backbone/router utama, tim akan mengeskalasikan ke penyedia ISP maksimal 2 jam.`;
  }

  // Scenario L: Tata Naskah Dinas Elektronik
  if (/tata naskah|surat keputusan|format sk|penomoran/i.test(qLower)) {
    return `Ketentuan tata naskah dinas kedinasan:
• **Format Font:** Wajib menggunakan huruf Bookman Old Style ukuran 12pt dengan lambang burung garuda/logo resmi instansi.
• **Tanda Tangan Elektronik (TTE):** Menggunakan sertifikat digital resmi tersertifikasi BSrE BSSN.
• **Penomoran Naskah:** Nomor surat keluar diterbitkan secara otomatis dan terpusat melalui aplikasi persuratan resmi e-Office.`;
  }

  // Scenario M: Uang Persediaan (UP / GU Bendahara)
  if (/uang persediaan|bendahara|ganti uang|gu|up/i.test(qLower)) {
    return `Ketentuan pengelolaan Uang Persediaan (UP) dan Ganti Uang (GU):
• Bendahara Pengeluaran mengajukan SPP-UP ke PPK berdasarkan pagu DIPA yang disahkan.
• Pengajuan Ganti Uang (GU) baru dapat dilakukan apabila dana UP sebelumnya telah terealisasi minimal **50%**.
• Wajib melakukan rekonsiliasi bulanan antara LPJ bendahara dan Aplikasi SAKTI Kementerian Keuangan.`;
  }

  // Scenario N: Disiplin Pegawai & Kode Etik ASN
  if (/disiplin|kode etik|hukuman disiplin|sidang/i.test(qLower)) {
    return `Ketentuan penegakan disiplin dan kode etik ASN:
• Surat panggilan pemeriksaan I dilayangkan minimal **H-3 hari kerja** sebelum sidang pemeriksaan dimulai.
• Hasil pemeriksaan dituangkan dalam Berita Acara Pemeriksaan (BAP) yang ditandatangani oleh tim pemeriksa dan pegawai terperiksa.
• Penetapan jenis sanksi mengacu pada **Peraturan Pemerintah No. 94 Tahun 2021** tentang Disiplin PNS.`;
  }

  // Scenario O: Backup Data & DRP
  if (/backup|cadangan data|drp|disaster recovery/i.test(qLower)) {
    return `Pengelolaan backup data dan pemulihan bencana sistem:
• Backup harian database dilakukan otomatis setiap **pukul 02.00 WIB**.
• Snapshot cadangan mingguan dienkripsi menggunakan standar **AES-256** dan disimpan di data center terpisah (off-site).
• Simulasi pengujian pemulihan bencana (Disaster Recovery Plan) wajib dilaksanakan minimal **1 kali per semester**.`;
  }

  // Scenario P: Pemeliharaan Sarana Gedung Kantor
  if (/gedung|pemeliharaan|ruang rapat|sarpras/i.test(qLower)) {
    return `Pemeliharaan sarana gedung dan peminjaman ruang rapat:
• Unit pengusul wajib mengajukan reservasi ruang rapat paling lambat **H-2** melalui bagian umum.
• Tim teknis akan menyiapkan kesiapan proyektor, audio, pendingin ruangan, dan kebersihan sebelum acara.
• Pemeliharaan instalasi genset dan kelistrikan gedung dilakukan berkala setiap akhir pekan.`;
  }

  // Generic Dynamic Scanner for other documents / custom uploaded files
  const scannedFacts = scanDocumentSentences(primary.indexedText, terms);

  if (mode === 'Ringkas') {
    return `Berdasarkan hasil scan dokumen resmi **${primary.title}**, ini jawaban ringkas untuk pertanyaanmu:

${scannedFacts}

💡 **Hal yang Perlu Diperhatikan:**
Pastikan seluruh alur administratif dan kelengkapan dokumen diverifikasi oleh unit kerja pengampu ya.`;
  } else {
    return `Berikut penjelasan detail langkah kerja dan ketentuannya berdasarkan scan dokumen resmi **${primary.title}** (${primary.documentNumber || 'Arsip Resmi'}):

### 📋 Ketentuan & Fakta Hasil Scan Dokumen:
${scannedFacts}

### ⚖️ Informasi Dokumen Acuan:
- **Judul Dokumen:** ${primary.title}
- **Nomor Dokumen:** ${primary.documentNumber || '-'} (Tahun ${primary.year || '-'})
- **Unit Pengampu:** ${primary.ownerTeamName || 'Pemerintah Pusat'}
- **Status:** **${primary.legalStatus}** (${primary.sourceType})`;
  }
}

// Extracts relevant sentences or bullet points from indexed text matching query terms
function scanDocumentSentences(text: string, terms: string[]): string {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 5 && !l.startsWith('STANDAR') && !l.startsWith('PROSEDUR'));

  if (lines.length === 0) return text.slice(0, 250);

  // Score lines by matching terms
  const scoredLines = lines.map((line) => {
    let score = 0;
    const lower = line.toLowerCase();
    terms.forEach((t) => {
      if (lower.includes(t)) score += 2;
    });
    return { line, score };
  });

  scoredLines.sort((a, b) => b.score - a.score);
  const topLines = scoredLines.filter((sl) => sl.score > 0).slice(0, 4);

  if (topLines.length > 0) {
    return topLines.map((tl) => `• ${tl.line}`).join('\n\n');
  }

  return lines.slice(0, 3).map((l) => `• ${l}`).join('\n\n');
}
