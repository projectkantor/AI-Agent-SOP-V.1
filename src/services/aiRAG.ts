import { User, Document, SourceReference, AIConversation } from '../types';
import { store } from './store';

export interface AnswerResult {
  answer: string;
  sourceReferences: SourceReference[];
  hasInactiveWarning: boolean;
  inactiveWarningMessage?: string;
  hasUnverifiedWarning: boolean;
  unverifiedWarningMessage?: string;
  emptyState: boolean;
  canCheckJDIH: boolean;
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
      answer: `⚠️ **Pemberitahuan Keamanan**: Instruksi tidak dapat diproses. Sebagai AI Agent Resmi SOP dan Regulasi Instansi, saya hanya beroperasi dalam koridor peraturan kedinasan yang berlaku dan hak akses yang telah ditetapkan oleh Administrator. Silakan ajukan pertanyaan terkait SOP atau regulasi resmi.`,
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

  if (candidateDocs.length === 0) {
    return {
      answer: `Tidak ditemukan sumber yang dapat Anda akses.\n\nDokumen yang Anda tanyakan mungkin tidak tersedia, belum terindeks, atau berada di luar batas hak akses akun Anda. Silakan hubungi **Admin Tim** atau lakukan penelusuran mandiri pada portal JDIH.`,
      sourceReferences: [],
      hasInactiveWarning: false,
      hasUnverifiedWarning: false,
      emptyState: true,
      canCheckJDIH: true,
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

    // Bonus for matching specific keywords
    if (/perjadin|perjalanan dinas|sppd|luar kota/i.test(trimmed) && doc.id.includes('perjadin')) score += 20;
    if (/cuti|alasan penting|cuti tahunan|cuti sakit/i.test(trimmed) && doc.id.includes('cuti')) score += 20;
    if (/honor|narasumber|pembayaran|uang muka|spj/i.test(trimmed) && doc.id.includes('honor')) score += 20;
    if (/vpn|server|kredensial|jaringan/i.test(trimmed) && doc.id.includes('vpn')) score += 20;
    if (/sbm|uang harian|penginapan hotel|tarif/i.test(trimmed) && doc.id.includes('pmk-49')) score += 20;
    if (/keamanan siber|tata kelola ti|csirt/i.test(trimmed) && (doc.id.includes('permen-03') || doc.id.includes('permen-12'))) score += 15;
    if (/jam kerja|fleksibel|presensi|masuk kerja/i.test(trimmed) && doc.id.includes('se-05')) score += 20;
    if (/pengadaan|pbj|50 juta|langsung|spk/i.test(trimmed) && doc.id.includes('pbj')) score += 20;

    return { doc, score };
  });

  scoredDocs.sort((a, b) => b.score - a.score);
  const bestMatches = scoredDocs.filter((item) => item.score > 2);

  // If no match found
  if (bestMatches.length === 0) {
    return {
      answer: `Tidak ditemukan sumber yang dapat Anda akses yang relevan dengan pertanyaan: *"${trimmed}"*.\n\n**Saran Tindakan:**\n1. Gunakan kata kunci yang lebih spesifik (misal: "prosedur perjalanan dinas", "syarat cuti tahunan", atau "pembayaran honor narasumber").\n2. Hubungi **Admin Tim** terkait jika dokumen termasuk arsip internal yang memerlukan izin khusus.\n3. Anda juga dapat memeriksa regulasi terbaru langsung di portal resmi JDIH.`,
      sourceReferences: [],
      hasInactiveWarning: false,
      hasUnverifiedWarning: false,
      emptyState: true,
      canCheckJDIH: true,
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
    inactiveWarningMessage = `⚠️ **Pemberitahuan Status Dokumen:** Regulasi *"${inactiveDoc.title}"* telah dinyatakan **TIDAK BERLAKU / DICABUT**.`;
    if (inactiveDoc.replacementDocumentId) {
      const replacement = permittedDocs.find((d) => d.id === inactiveDoc.replacementDocumentId);
      inactiveWarningMessage += ` Dokumen ini telah digantikan oleh: **${
        replacement ? replacement.title : inactiveDoc.replacementDocumentTitle || 'Regulasi Pembaruan Terkini'
      }**. Jangan gunakan dokumen lama sebagai acuan aktif!`;
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
    unverifiedWarningMessage = `ℹ️ **Status Verifikasi JDIH**: Dokumen *"${unverifiedDoc.title}"* saat ini berstatus **Belum Terverifikasi** atau pembaruan terakhir melebihi 24 jam. Disarankan memeriksa portal resmi JDIH untuk memastikan keabsahan pasal terkini.`;
  }

  // Synthesize Indonesian Answer based on Mode
  const generatedAnswer = buildIndonesianResponse(
    trimmed,
    primaryMatch,
    secondaryMatches,
    mode,
    hasInactiveWarning,
    inactiveDoc
  );

  return {
    answer: generatedAnswer,
    sourceReferences,
    hasInactiveWarning,
    inactiveWarningMessage,
    hasUnverifiedWarning,
    unverifiedWarningMessage,
    emptyState: false,
    canCheckJDIH: true,
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

function buildIndonesianResponse(
  question: string,
  primary: Document,
  secondary: Document[],
  mode: 'Ringkas' | 'Rinci',
  hasInactive: boolean,
  inactiveDoc?: Document
): string {
  // If the only primary document is revoked
  if (hasInactive && primary.legalStatus === 'Tidak Berlaku') {
    return `Berdasarkan verifikasi sistem data regulasi resmi, dokumen **${primary.title}** (${primary.documentNumber || '-'}) saat ini telah berstatus **TIDAK BERLAKU**.

🚫 **Ketentuan:**
Aturan ini telah dicabut secara resmi dan tidak lagi mengikat secara hukum bagi seluruh unit kerja.
${
  primary.replacementDocumentTitle
    ? `\n👉 **Regulasi Pengganti:** Silakan merujuk pada regulasi aktif terbaru: **${primary.replacementDocumentTitle}**.`
    : ''
}

Silakan berkonsultasi dengan unit Hukum & Regulasi atau Admin Tim untuk ketentuan operasional terkini.`;
  }

  if (mode === 'Ringkas') {
    return `Berdasarkan **${primary.title}** (${primary.documentNumber || 'Nomor tercatat'}), berikut ringkasan ketentuan yang berlaku:

${extractSummaryPoints(primary)}

📌 **Rujukan Resmi:**
- Dokumen: **${primary.title}** (${primary.documentNumber || '-'}, Tahun ${primary.year || '-'})
- Unit Pengampu: ${primary.ownerTeamName || 'Pemerintah Pusat'}
- Status: **${primary.legalStatus}** (${primary.sourceType})`;
  } else {
    // Mode Rinci
    return `Berdasarkan penelusuran pada dokumen resmi **${primary.title}** (${primary.documentNumber || 'Regulasi Terindeks'}), berikut prosedur dan rincian administratif yang berlaku:

### 📋 Alur & Prosedur Pelaksanaan:
${extractDetailedSteps(primary)}

### 📑 Persyaratan Dokumen & Formulir:
${extractRequirements(primary)}

### ⚖️ Dasar Hukum & Keterkaitan Regulasi:
- **Dokumen Acuan:** ${primary.title} (No. ${primary.documentNumber || '-'})
- **Status Keberlakuan:** Terdaftar **${primary.legalStatus}** pada pangkalan data internal.
${
  secondary.length > 0
    ? `- **Regulasi Terkait:** ${secondary.map((s) => `${s.title} (${s.documentNumber || '-'})`).join('; ')}`
    : ''
}

*(Catatan: Pastikan seluruh bukti fisik dan administratif telah diverifikasi atasan langsung sebelum batas waktu penyerahan).*`;
  }
}

function extractSummaryPoints(doc: Document): string {
  if (doc.clauses && doc.clauses.length > 0) {
    return doc.clauses.map((c) => `• **${c.title}**: ${c.content}`).join('\n\n');
  }
  const lines = doc.indexedText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 10 && !l.startsWith('STANDAR') && !l.startsWith('PROSEDUR'));
  return lines.slice(0, 4).map((l) => `• ${l}`).join('\n\n');
}

function extractDetailedSteps(doc: Document): string {
  const lines = doc.indexedText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 5);

  const stepLines = lines.filter((l) => /^\d+\.|^[a-d]\./.test(l));
  if (stepLines.length > 0) {
    return stepLines.join('\n');
  }

  if (doc.clauses && doc.clauses.length > 0) {
    return doc.clauses.map((c, i) => `**Langkah ${i + 1} (${c.title}):**\n${c.content}`).join('\n\n');
  }

  return `1. Menyiapkan berkas pengajuan resmi sesuai standar instansi.\n2. Melakukan pengunggahan dan verifikasi data melalui sistem persuratan/kepegawaian.\n3. Mendapatkan disposisi dan tanda tangan pejabat yang berwenang.\n4. Menyampaikan laporan pertanggungjawaban dalam batas waktu yang ditentukan.`;
}

function extractRequirements(doc: Document): string {
  if (doc.id.includes('perjadin')) {
    return `- Surat Undangan / KAK Kegiatan Resmi.\n- Surat Tugas (ST) ditandatangani Eselon II/Kepala Satker.\n- Boarding pass asli, invoice hotel ber-NPWP, dan tiket resmi.\n- Laporan Pelaksanaan Perjalanan Dinas diserahkan paling lambat H+5 hari kerja.`;
  }
  if (doc.id.includes('cuti')) {
    return `- Pengisian form e-Cuti pada portal SIMPEG.\n- Persetujuan atasan langsung.\n- Surat Keterangan Dokter Pemerintah (khusus cuti sakit > 1 hari).\n- Dokumen pendukung relevan (khusus cuti alasan penting).`;
  }
  if (doc.id.includes('honor')) {
    return `- SK Penunjukan Panitia/Narasumber dari PPK.\n- Notula rapat atau materi paparan presentasi.\n- Daftar hadir fisik bertandatangan atau digital tervalidasi.\n- Salinan NPWP dan nomor rekening aktif (potongan PPh 21 Gol III: 5%, Gol IV: 15%).`;
  }
  if (doc.id.includes('pbj')) {
    return `- Nota Dinas Kebutuhan dan HPS dari unit kerja.\n- Kuitansi pembelian bermaterai (di atas Rp 10 Juta s.d. 50 Juta).\n- Berita Acara Serah Terima (BAST) fisik barang/jasa.`;
  }
  return `- Bukti verifikasi pejabat berwenang.\n- Kelengkapan lampiran administratif unit kerja.\n- Kepatuhan terhadap batas waktu pelaporan.`;
}
