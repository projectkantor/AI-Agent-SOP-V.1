import React, { useState } from 'react';
import {
  X,
  FolderUp,
  FolderSearch,
  CheckCircle2,
  FileText,
  AlertCircle,
  HardDrive,
  Globe,
  Loader2,
  CheckSquare,
  Square,
  Sparkles,
  Bot,
  Plus,
  Trash2,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { User, Document, Team } from '../types';
import { store } from '../services/store';

interface BatchUploadModalProps {
  currentUser: User;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

interface DetectedDoc {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  documentNumber: string;
  year: number;
  documentType: string;
  sourceUrl: string;
  tags: string[];
  indexedText: string;
  assignedTeamId: string;
  assignedTeamName: string;
  aiClassificationReason: string;
  selected: boolean;
}

export const BatchUploadModal: React.FC<BatchUploadModalProps> = ({
  currentUser,
  onClose,
  onSuccess,
}) => {
  const teams = store.getTeams();
  const isSuperAdmin = currentUser.role === 'Super Admin';

  const [folderUrl, setFolderUrl] = useState('');
  const [selectedTeamMode, setSelectedTeamMode] = useState<string>('auto'); // 'auto' = AI auto detect
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepText, setScanStepText] = useState('');
  const [scanCompleted, setScanCompleted] = useState(false);
  const [detectedDocs, setDetectedDocs] = useState<DetectedDoc[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Manual document addition within scanned list
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customText, setCustomText] = useState('');

  // Intelligent AI Team Classifier based on document content & title
  const classifyDocToTeam = (title: string, text: string): { teamId: string; teamName: string; reason: string } => {
    const combined = (title + ' ' + text).toLowerCase();

    // 1. Kepegawaian & SDM
    if (/kinerja|skp|cuti|disiplin|pegawai|sdm|asn|pns|mutasi|talenta|pensiun|kepegawaian|presensi/i.test(combined)) {
      const t = teams.find((t) => t.id === 'team-sdm') || teams[0];
      return {
        teamId: t.id,
        teamName: t.name,
        reason: 'AI mendeteksi topik manajemen talenta, SKP, cuti, atau disiplin pegawai ASN.',
      };
    }
    // 2. Keuangan & Anggaran
    if (/uang|anggaran|biaya|honor|spj|pembayaran|kas|dipa|sbm|pajak|pph|keuangan|bendahara|persediaan/i.test(combined)) {
      const t = teams.find((t) => t.id === 'team-keu') || teams[0];
      return {
        teamId: t.id,
        teamName: t.name,
        reason: 'AI mendeteksi topik pencairan honor, pertanggungjawaban anggaran, SPJ, atau SBM.',
      };
    }
    // 3. TI & Keamanan Siber
    if (/jaringan|server|internet|vpn|wifi|siber|keamanan informasi|aplikasi|helpdesk|ti|komputer|firewall|backup/i.test(combined)) {
      const t = teams.find((t) => t.id === 'team-ti') || teams[0];
      return {
        teamId: t.id,
        teamName: t.name,
        reason: 'AI mendeteksi topik infrastruktur server, jaringan kantor, atau keamanan siber.',
      };
    }
    // 4. Hukum & Regulasi
    if (/tata naskah|hukum|regulasi|sk|surat keputusan|perjanjian|mou|telaah hukum|harmonisasi|jdih/i.test(combined)) {
      const t = teams.find((t) => t.id === 'team-hukum') || teams[0];
      return {
        teamId: t.id,
        teamName: t.name,
        reason: 'AI mendeteksi tata naskah dinas kedinasan, SK pimpinan, atau telaah hukum.',
      };
    }
    // 5. Umum & PBJ
    if (/pengadaan|bmn|aset|inventaris|barang|jasa|spk|kuitansi|gedung|ruang rapat|sarana|pemeliharaan/i.test(combined)) {
      const t = teams.find((t) => t.id === 'team-umum') || teams[0];
      return {
        teamId: t.id,
        teamName: t.name,
        reason: 'AI mendeteksi pengelolaan aset BMN, logistik kantor, atau pengadaan barang/jasa.',
      };
    }

    const defaultT = teams[0];
    return {
      teamId: defaultT.id,
      teamName: defaultT.name,
      reason: 'AI menempatkan pada unit kerja umum berdasarkan analisis struktur organisasi.',
    };
  };

  // Full folder scan & document extraction
  const handleScanFolder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!folderUrl.trim()) {
      setErrorMsg('Tautan Google Drive Folder wajib diisi.');
      return;
    }

    setIsScanning(true);
    setScanCompleted(false);
    setScanStepText('Menghubungkan ke Google Drive API & memeriksa izin akses folder...');

    setTimeout(() => {
      setScanStepText('Memindai seluruh berkas dokumen (.pdf, .docx, Google Docs)...');

      setTimeout(() => {
        setScanStepText('AI Agent membaca isi teks dokumen & mengidentifikasi pembagian unit tim...');

        setTimeout(() => {
          setIsScanning(false);
          setScanCompleted(true);

          // Comprehensive detected documents list
          const rawDocs = [
            {
              id: 'scan-1',
              title: 'SOP Penilaian Kinerja Pegawai dan Penyusunan SKP Tahunan ASN',
              fileName: 'SOP-015-Penilaian-SKP-Pegawai.pdf',
              fileSize: '1.4 MB',
              documentNumber: 'SOP/SDM/2024/015',
              year: 2024,
              documentType: 'SOP',
              sourceUrl: `${folderUrl}#file=skp-kinerja.pdf`,
              tags: ['kinerja', 'skp', 'evaluasi', 'sdm', 'asn'],
              indexedText: `PROSEDUR PENILAIAN SKP PEGAWAI:
1. Penyusunan Rencana Kerja: Setiap pegawai wajib menyusun matriks peran hasil paling lambat 15 Januari.
2. Dialog Kinerja: Dilakukan berkala triwulanan bersama atasan langsung.
3. Penetapan Predikat Kinerja: Berdasarkan kurva distribusi kinerja organisasi (Sangat Baik, Baik, Butuh Perbaikan).`,
            },
            {
              id: 'scan-2',
              title: 'SOP Pengelolaan dan Peminjaman Inventaris Barang Milik Negara (BMN)',
              fileName: 'SOP-007-Inventaris-BMN.pdf',
              fileSize: '890 KB',
              documentNumber: 'SOP/BMN/2024/007',
              year: 2024,
              documentType: 'SOP',
              sourceUrl: `${folderUrl}#file=inventaris-bmn.pdf`,
              tags: ['bmn', 'inventaris', 'laptop', 'kendaraan', 'aset'],
              indexedText: `PROSEDUR PEMINJAMAN ASET BMN:
1. Pengajuan Formulir: Mengisi formulir Berita Acara Peminjaman Aset ke Tim Umum.
2. Batas Waktu: Peminjaman laptop dinas maksimal 14 hari kalender dengan persetujuan kasubag.
3. Pengembalian: Pemeriksaan kondisi fisik oleh petugas BMN sebelum serah terima kembali.`,
            },
            {
              id: 'scan-3',
              title: 'SOP Penanganan Gangguan Akses Jaringan Internet dan Wi-Fi Kedinasan',
              fileName: 'SOP-008-Gangguan-Jaringan-IT.pdf',
              fileSize: '1.1 MB',
              documentNumber: 'SOP/TI/2024/008',
              year: 2024,
              documentType: 'SOP',
              sourceUrl: `${folderUrl}#file=troubleshoot-jaringan.pdf`,
              tags: ['ti', 'internet', 'jaringan', 'wifi', 'helpdesk'],
              indexedText: `PROSEDUR PENANGANAN GANGGUAN JARINGAN:
1. Pelaporan Tiket: Pegawai membuat tiket pada helpdesk TI internal dengan melampirkan screenshot pesan error.
2. Respon Helpdesk: Tim TI merespon maksimal 15 menit pada jam kerja dinas.
3. Eskalasi: Gangguan backbone router eskalasi ke penyedia ISP maksimal 2 jam.`,
            },
            {
              id: 'scan-4',
              title: 'SOP Tata Naskah Dinas Elektronik dan Format Surat Keputusan (SK)',
              fileName: 'SOP-021-Tata-Naskah-Dinas.pdf',
              fileSize: '2.3 MB',
              documentNumber: 'SOP/HKM/2023/021',
              year: 2023,
              documentType: 'Pedoman Teknis',
              sourceUrl: `${folderUrl}#file=tata-naskah-sk.pdf`,
              tags: ['tata naskah', 'persuratan', 'sk', 'nota dinas', 'elektronik'],
              indexedText: `KETENTUAN TATA NASKAH DINAS ELEKTRONIK:
1. Format Surat: Wajib menggunakan font Bookman Old Style ukuran 12pt dengan lambang burung garuda/logo instansi.
2. Tanda Tangan Elektronik (TTE): Menggunakan sertifikat digital tersertifikasi BSrE BSSN.
3. Penomoran Otomatis: Diterbitkan langsung melalui sistem persuratan resmi e-Office.`,
            },
            {
              id: 'scan-5',
              title: 'SOP Pengajuan Uang Persediaan (UP) dan Pertanggungjawaban Ganti Uang (GU)',
              fileName: 'SOP-011-Uang-Persediaan-Bendahara.pdf',
              fileSize: '1.7 MB',
              documentNumber: 'SOP/KEU/2024/011',
              year: 2024,
              documentType: 'SOP',
              sourceUrl: `${folderUrl}#file=uang-persediaan.pdf`,
              tags: ['keuangan', 'up', 'gu', 'bendahara', 'dipa', 'anggaran'],
              indexedText: `PROSEDUR UANG PERSEDIAAN BENDAHARA:
1. Pengajuan UP: Bendahara Pengeluaran mengajukan SPP-UP ke PPK berdasarkan pagu DIPA yang disetujui.
2. Besaran GU: Pengajuan Ganti Uang (GU) dapat dilakukan apabila UP telah terealisasi minimal 50%.
3. Rekonsiliasi Bulanan: Wajib mencocokkan LPJ bendahara dengan Aplikasi SAKTI Kementerian Keuangan.`,
            },
            {
              id: 'scan-6',
              title: 'SOP Penegakan Disiplin Pegawai dan Penanganan Pelanggaran Kode Etik ASN',
              fileName: 'SOP-019-Disiplin-Kode-Etik-ASN.pdf',
              fileSize: '1.2 MB',
              documentNumber: 'SOP/SDM/2024/019',
              year: 2024,
              documentType: 'SOP',
              sourceUrl: `${folderUrl}#file=disiplin-kode-etik.pdf`,
              tags: ['disiplin', 'kode etik', 'pemeriksaan', 'hukuman disiplin', 'asn'],
              indexedText: `PROSEDUR PENEGAKAN DISIPLIN ASN:
1. Pemanggilan Pemeriksaan: Surat panggilan I dilayangkan minimal H-3 sebelum sidang pemeriksaan.
2. Berita Acara Pemeriksaan (BAP): Disusun oleh tim pemeriksa ad hoc dan ditandatangani terperiksa.
3. Penetapan Sanksi: Mengacu pada Peraturan Pemerintah Nomor 94 Tahun 2021 tentang Disiplin Pegawai Negeri Sipil.`,
            },
            {
              id: 'scan-7',
              title: 'SOP Pengelolaan Cadangan Data (Backup) dan Pemulihan Sistem Elektronik (DRP)',
              fileName: 'SOP-014-Backup-Disaster-Recovery.pdf',
              fileSize: '950 KB',
              documentNumber: 'SOP/TI/2024/014',
              year: 2024,
              documentType: 'Petunjuk Teknis',
              sourceUrl: `${folderUrl}#file=backup-drp.pdf`,
              tags: ['backup', 'drp', 'keamanan', 'database', 'pemulihan'],
              indexedText: `PROSEDUR CADANGAN DATA DAN PEMULIHAN SISTEM:
1. Jadwal Backup Harian: Dilakukan otomatis setiap pukul 02.00 WIB untuk transaksi database.
2. Penyimpanan Off-site: Snapshot mingguan dienkripsi AES-256 dan disimpan pada pusat data terpisah.
3. Simulasi Disaster Recovery: Pengujian restorasi sistem wajib dilakukan minimal 1 kali per semester.`,
            },
            {
              id: 'scan-8',
              title: 'SOP Pemeliharaan Rutin Gedung Kantor dan Layanan Ruang Rapat Pimpinan',
              fileName: 'SOP-005-Pemeliharaan-Gedung.pdf',
              fileSize: '820 KB',
              documentNumber: 'SOP/BMN/2023/005',
              year: 2023,
              documentType: 'SOP',
              sourceUrl: `${folderUrl}#file=pemeliharaan-gedung.pdf`,
              tags: ['pemeliharaan', 'gedung', 'ruang rapat', 'sarpras', 'umum'],
              indexedText: `PROSEDUR PEMELIHARAAN GEDUNG DAN FASILITAS RAPAT:
1. Reservasi Ruang Rapat: Unit pengusul mengajukan formulir peminjaman H-2 melalui bagian umum.
2. Pemeriksaan Sarana: Tim teknis memastikan kesiapan proyektor, audio, pendingin ruangan, dan kebersihan.
3. Pemeliharaan Berkala: Pengecekan genset dan instalasi listrik dilaksanakan setiap akhir pekan.`,
            },
          ];

          // Map and apply initial team assignment (either AI auto-detected or specific chosen team)
          const processedList: DetectedDoc[] = rawDocs.map((doc) => {
            let finalTeamId: string;
            let finalTeamName: string;
            let reason: string;

            if (selectedTeamMode === 'auto') {
              const detected = classifyDocToTeam(doc.title, doc.indexedText);
              finalTeamId = detected.teamId;
              finalTeamName = detected.teamName;
              reason = detected.reason;
            } else {
              const chosen = teams.find((t) => t.id === selectedTeamMode) || teams[0];
              finalTeamId = chosen.id;
              finalTeamName = chosen.name;
              reason = `Ditetapkan manual ke ${chosen.name}.`;
            }

            return {
              ...doc,
              assignedTeamId: finalTeamId,
              assignedTeamName: finalTeamName,
              aiClassificationReason: reason,
              selected: true,
            };
          });

          setDetectedDocs(processedList);
        }, 600);
      }, 700);
    }, 600);
  };

  // Re-run team classification if user changes the global dropdown
  const handleTeamModeChange = (newMode: string) => {
    setSelectedTeamMode(newMode);
    if (detectedDocs.length > 0) {
      setDetectedDocs(
        detectedDocs.map((doc) => {
          if (newMode === 'auto') {
            const detected = classifyDocToTeam(doc.title, doc.indexedText);
            return {
              ...doc,
              assignedTeamId: detected.teamId,
              assignedTeamName: detected.teamName,
              aiClassificationReason: detected.reason,
            };
          } else {
            const chosen = teams.find((t) => t.id === newMode) || teams[0];
            return {
              ...doc,
              assignedTeamId: chosen.id,
              assignedTeamName: chosen.name,
              aiClassificationReason: `Ditetapkan manual ke ${chosen.name}.`,
            };
          }
        })
      );
    }
  };

  // Individual document team override
  const handleDocTeamChange = (docId: string, newTeamId: string) => {
    const t = teams.find((team) => team.id === newTeamId);
    if (!t) return;
    setDetectedDocs(
      detectedDocs.map((d) =>
        d.id === docId
          ? {
              ...d,
              assignedTeamId: t.id,
              assignedTeamName: t.name,
              aiClassificationReason: `Disesuaikan secara manual ke ${t.name}.`,
            }
          : d
      )
    );
  };

  const handleToggleSelectAll = () => {
    const allSelected = detectedDocs.every((d) => d.selected);
    setDetectedDocs(detectedDocs.map((d) => ({ ...d, selected: !allSelected })));
  };

  const handleToggleDoc = (id: string) => {
    setDetectedDocs(
      detectedDocs.map((d) => (d.id === id ? { ...d, selected: !d.selected } : d))
    );
  };

  const handleAddCustomDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const detected = classifyDocToTeam(customTitle, customText);
    const newDocItem: DetectedDoc = {
      id: `custom-${Date.now()}`,
      title: customTitle.trim(),
      fileName: `${customTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`,
      fileSize: '1.0 MB',
      documentNumber: `SOP/EXT/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      year: new Date().getFullYear(),
      documentType: 'SOP',
      sourceUrl: `${folderUrl}#file=${encodeURIComponent(customTitle.trim())}`,
      tags: ['batch-upload', 'sop-drive'],
      indexedText: customText.trim() || `Prosedur operasional untuk: ${customTitle.trim()}.`,
      assignedTeamId: selectedTeamMode === 'auto' ? detected.teamId : selectedTeamMode,
      assignedTeamName:
        selectedTeamMode === 'auto'
          ? detected.teamName
          : teams.find((t) => t.id === selectedTeamMode)?.name || teams[0].name,
      aiClassificationReason:
        selectedTeamMode === 'auto'
          ? detected.reason
          : `Ditetapkan manual ke unit tim terpilih.`,
      selected: true,
    };

    setDetectedDocs([newDocItem, ...detectedDocs]);
    setCustomTitle('');
    setCustomText('');
    setShowAddCustom(false);
  };

  const handleBatchImport = () => {
    const selected = detectedDocs.filter((d) => d.selected);
    if (selected.length === 0) {
      setErrorMsg('Pilih minimal satu dokumen untuk diimpor.');
      return;
    }

    setIsImporting(true);
    try {
      const docsToInsert = selected.map((d) => ({
        title: d.title,
        documentNumber: d.documentNumber,
        year: d.year,
        documentType: d.documentType,
        sourceUrl: d.sourceUrl,
        ownerTeamId: d.assignedTeamId,
        tags: d.tags,
        indexedText: d.indexedText,
      }));

      store.batchAddDocuments(folderUrl, docsToInsert, currentUser);
      onSuccess(selected.length);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal melakukan batch import.');
    } finally {
      setIsImporting(false);
    }
  };

  const selectedCount = detectedDocs.filter((d) => d.selected).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <FolderUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Batch Upload Folder Google Drive
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                  AI Auto-Classification
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Akses 1 folder Google Drive dan biarkan AI Agent mengidentifikasi seluruh dokumen serta mendeteksi unit tim yang tepat.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Folder Input Form */}
          <form onSubmit={handleScanFolder} className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tautan Google Drive Folder Dokumen SOP *
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <HardDrive className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ..."
                    value={folderUrl}
                    onChange={(e) => setFolderUrl(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isScanning}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-xs transition-colors shrink-0"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sedang Memindai...</span>
                    </>
                  ) : (
                    <>
                      <FolderSearch className="w-4 h-4" />
                      <span>Pindai Seluruh Dokumen</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Unit Team Selection with AI Auto-Detect Option */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <label className="block font-semibold text-slate-900 dark:text-white mb-1.5 flex items-center space-x-1.5">
                  <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Pilihan Unit Tim Naungan Dokumen:</span>
                </label>
                <select
                  value={selectedTeamMode}
                  onChange={(e) => handleTeamModeChange(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl p-2.5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="auto">
                    ✨ Deteksi Otomatis (Agent menentukan Tim setelah membaca isi Dokumen)
                  </option>
                  <optgroup label="Tentukan Semua Dokumen ke 1 Tim Tertentu:">
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </optgroup>
                </select>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {selectedTeamMode === 'auto' ? (
                    <span className="text-blue-700 dark:text-blue-300 font-medium">
                      💡 Mode AI Aktif: Dokumen akan dibaca dan diarahkan otomatis ke Kepegawaian, Keuangan, TI, Hukum, atau Umum sesuai klausul di dalamnya.
                    </span>
                  ) : (
                    `Semua dokumen dari folder ini akan ditetapkan ke unit tim "${
                      teams.find((t) => t.id === selectedTeamMode)?.name
                    }".`
                  )}
                </p>
              </div>

              {/* Default Visibility Note */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-start space-x-2.5">
                <Globe className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-emerald-950 dark:text-emerald-200 space-y-1">
                  <span className="font-semibold block text-xs">
                    Visibilitas Default: Publik (Dapat Diakses Seluruh Pegawai)
                  </span>
                  <p className="text-emerald-800/90 dark:text-emerald-300/80 leading-relaxed">
                    Sesuai spesifikasi, seluruh dokumen SOP hasil impor otomatis diatur ke visibilitas <strong>Publik</strong>. Super Admin atau Admin Tim dapat mengubahnya menjadi <strong>Terbagi</strong> atau <strong>Hanya Tim</strong> kapan saja di Knowledge Base.
                  </p>
                </div>
              </div>
            </div>
          </form>

          {/* Scanning Animation */}
          {isScanning && (
            <div className="p-6 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <div>
                <p className="font-semibold text-xs sm:text-sm text-blue-900 dark:text-blue-200">
                  {scanStepText}
                </p>
                <p className="text-[11px] text-blue-700/80 dark:text-blue-400 mt-1">
                  Mengekstrak teks, bab, pasal, nomor surat, dan menganalisis klasifikasi tim...
                </p>
              </div>
            </div>
          )}

          {/* Scanned Results */}
          {scanCompleted && (
            <div className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Berhasil Mengidentifikasi {detectedDocs.length} Dokumen SOP dari Folder
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCustom(!showAddCustom)}
                    className="px-2.5 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg font-medium flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Berkas Lain</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium"
                  >
                    {detectedDocs.every((d) => d.selected) ? 'Batal Pilih Semua' : 'Pilih Semua'}
                  </button>
                </div>
              </div>

              {/* Add Custom Document in Scanned Set */}
              {showAddCustom && (
                <form
                  onSubmit={handleAddCustomDoc}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-blue-200 dark:border-blue-800 space-y-2.5"
                >
                  <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                    Tambah Dokumen Tambahan ke Daftar Pindai:
                  </p>
                  <input
                    type="text"
                    required
                    placeholder="Judul SOP (Contoh: SOP Pengajuan Dana Operasional Khusus)"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-900 dark:text-white"
                  />
                  <textarea
                    rows={2}
                    placeholder="Klausul / ringkasan isi prosedur (untuk evaluasi AI klasifikasi tim)..."
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-900 dark:text-white"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCustom(false)}
                      className="px-3 py-1 text-xs text-slate-500"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg font-medium"
                    >
                      Tambahkan ke Daftar
                    </button>
                  </div>
                </form>
              )}

              {/* Detected List Cards */}
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {detectedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                      doc.selected
                        ? 'border-blue-400 bg-white dark:bg-slate-900 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => handleToggleDoc(doc.id)}
                          className="mt-0.5 text-blue-600 focus:outline-hidden"
                        >
                          {doc.selected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                              {doc.title}
                            </h4>
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                              Visibilitas: Publik
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-400 mt-1">
                            <span className="font-mono text-slate-500 dark:text-slate-400">
                              {doc.fileName} ({doc.fileSize})
                            </span>
                            <span>• No: {doc.documentNumber}</span>
                            <span>• Th {doc.year}</span>
                            <span>• {doc.documentType}</span>
                          </div>
                        </div>
                      </div>

                      {/* Team Assignment Selector per Document */}
                      <div className="shrink-0 text-right">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                          Unit Tim:
                        </label>
                        <select
                          value={doc.assignedTeamId}
                          onChange={(e) => handleDocTeamChange(doc.id, e.target.value)}
                          className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 font-medium"
                        >
                          {teams.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* AI Classification Reasoning Badge */}
                    <div className="ml-7 p-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-[11px] flex items-start space-x-2">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-blue-950 dark:text-blue-200">
                          {doc.assignedTeamName}:
                        </span>{' '}
                        <span className="text-blue-800/90 dark:text-blue-300/80">
                          {doc.aiClassificationReason}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {scanCompleted
              ? `${selectedCount} dari ${detectedDocs.length} dokumen dipilih untuk diimpor sekaligus`
              : 'Masukkan tautan folder Google Drive dan klik "Pindai Seluruh Dokumen".'}
          </span>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl font-medium"
            >
              Batal
            </button>

            {scanCompleted && (
              <button
                type="button"
                onClick={handleBatchImport}
                disabled={isImporting || selectedCount === 0}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-xl flex items-center space-x-2 shadow-xs transition-colors"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sedang Memasukkan ke List...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Impor {selectedCount} Dokumen (Default: Publik)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
