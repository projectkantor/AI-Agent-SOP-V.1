import React, { useState } from 'react';
import {
  X,
  HardDrive,
  Link as LinkIcon,
  Plus,
  CheckCircle2,
  Lock,
  Layers,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { User, Visibility } from '../types';
import { store } from '../services/store';

interface AddDocumentModalProps {
  currentUser: User;
  onClose: () => void;
  onSuccess: (newDocTitle: string) => void;
}

export const AddDocumentModal: React.FC<AddDocumentModalProps> = ({
  currentUser,
  onClose,
  onSuccess,
}) => {
  const teams = store.getTeams();
  const allDocs = store.getPermittedDocuments(currentUser);
  const jdihRegulations = allDocs.filter((d) => d.sourceType === 'JDIH');

  const isSuperAdmin = currentUser.role === 'Super Admin';
  const defaultTeamId = currentUser.teamIds[0] || (teams[0] ? teams[0].id : '');

  const [sourceUrl, setSourceUrl] = useState('');
  const [title, setTitle] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [documentType, setDocumentType] = useState('SOP');
  const [ownerTeamId, setOwnerTeamId] = useState<string>(defaultTeamId);
  const [visibility, setVisibility] = useState<Visibility>('Publik');
  const [sharedTeamIds, setSharedTeamIds] = useState<string[]>([]);
  const [downloadAllowed, setDownloadAllowed] = useState(true);
  const [selectedBaseRegIds, setSelectedBaseRegIds] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState('');
  const [indexedText, setIndexedText] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!sourceUrl.trim()) {
      setErrorMsg('Tautan Google Drive wajib diisi.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Judul dokumen SOP wajib diisi.');
      return;
    }
    if (!indexedText.trim()) {
      setErrorMsg('Ekstrak teks / klausul prosedur SOP wajib diisi agar dapat diindeks AI.');
      return;
    }

    setIsSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);

      store.addDocument(
        {
          title: title.trim(),
          documentNumber: documentNumber.trim() || null,
          year: year || null,
          documentType,
          sourceUrl: sourceUrl.trim(),
          ownerTeamId,
          visibility,
          sharedTeamIds: visibility === 'Terbagi' ? sharedTeamIds : [],
          downloadAllowed,
          baseRegulationIds: selectedBaseRegIds,
          tags,
          indexedText: indexedText.trim(),
        },
        currentUser
      );

      onSuccess(title);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan dokumen SOP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Tambah Tautan SOP (Google Drive)
              </h2>
              <p className="text-[11px] text-slate-500">
                Otorisasi: {currentUser.name} ({currentUser.role})
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tautan Google Drive */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tautan Google Drive Dokumen SOP *
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                required
                placeholder="https://drive.google.com/file/d/..."
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Service account akan memvalidasi izin baca dan melakukan sinkronisasi isi berkas secara otomatis.
            </p>
          </div>

          {/* Judul & Nomor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Judul Lengkap SOP *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: SOP Pelaksanaan Perjalanan Dinas Luar Daerah"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Dokumen
              </label>
              <input
                type="text"
                placeholder="SOP/01/SDM/2024"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Tahun, Jenis, Tim Pemilik */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tahun
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jenis Dokumen
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-900 dark:text-white"
              >
                <option value="SOP">SOP (Standar Operasional Prosedur)</option>
                <option value="Pedoman Teknis">Pedoman Teknis</option>
                <option value="Petunjuk Kerja">Petunjuk Kerja</option>
                <option value="Juknis">Petunjuk Teknis (Juknis)</option>
                <option value="Panduan Mutu">Panduan Mutu</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tim Pemilik SOP
              </label>
              {isSuperAdmin ? (
                <select
                  value={ownerTeamId}
                  onChange={(e) => setOwnerTeamId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-900 dark:text-white"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  readOnly
                  value={
                    teams.find((t) => currentUser.teamIds.includes(t.id))?.name || 'Tim Pengampu'
                  }
                  className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-500 cursor-not-allowed"
                />
              )}
            </div>
          </div>

          {/* Visibilitas & Izin Unduh */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tingkat Visibilitas Dokumen:
              </label>
              <div className="space-y-1.5">
                {(['Publik', 'Terbagi', 'Hanya Tim'] as Visibility[]).map((v) => (
                  <label key={v} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value={v}
                      checked={visibility === v}
                      onChange={() => setVisibility(v)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium text-slate-800 dark:text-slate-200">{v}</span>
                    <span className="text-[11px] text-slate-400">
                      {v === 'Publik' && '(Semua pegawai & tamu)'}
                      {v === 'Terbagi' && '(Tim tertentu yang dipilih)'}
                      {v === 'Hanya Tim' && '(Hanya anggota tim pemilik)'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Izin Pengunduhan Dokumen:
              </label>
              <label className="flex items-center space-x-2.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={downloadAllowed}
                  onChange={(e) => setDownloadAllowed(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <div>
                  <span className="font-medium text-slate-800 dark:text-slate-200 block">
                    Izinkan Unduh Berkas
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Jika tidak dicentang, pengguna hanya dapat membaca via AI Agent / pratinjau.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Shared teams if Terbagi */}
          {visibility === 'Terbagi' && (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pilih Tim Tambahan yang Berhak Mengakses:
              </label>
              <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                {teams
                  .filter((t) => t.id !== ownerTeamId)
                  .map((t) => (
                    <label key={t.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sharedTeamIds.includes(t.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSharedTeamIds([...sharedTeamIds, t.id]);
                          } else {
                            setSharedTeamIds(sharedTeamIds.filter((id) => id !== t.id));
                          }
                        }}
                        className="rounded text-blue-600"
                      />
                      <span className="text-xs truncate">{t.name}</span>
                    </label>
                  ))}
              </div>
            </div>
          )}

          {/* Base Regulation (Payung Hukum JDIH) */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Payung Hukum Regulasi Terkait (JDIH):
            </label>
            <div className="space-y-1.5 max-h-28 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {jdihRegulations.map((reg) => (
                <label key={reg.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedBaseRegIds.includes(reg.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBaseRegIds([...selectedBaseRegIds, reg.id]);
                      } else {
                        setSelectedBaseRegIds(selectedBaseRegIds.filter((id) => id !== reg.id));
                      }
                    }}
                    className="rounded text-blue-600"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300 truncate">
                    {reg.title} ({reg.documentNumber || '-'})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tag / Kata Kunci (Dipisahkan koma)
            </label>
            <input
              type="text"
              placeholder="perjadin, spj, perjalanan dinas, transport"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-900 dark:text-white"
            />
          </div>

          {/* Indexed Text / Clauses */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ringkasan Prosedur & Klausul Ekstrak Teks SOP *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Tuliskan butir langkah kerja, syarat pengajuan, atau pasal penting dalam SOP ini..."
              value={indexedText}
              onChange={(e) => setIndexedText(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono text-xs leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-xl shadow-xs transition-colors"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan & Indeks SOP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
