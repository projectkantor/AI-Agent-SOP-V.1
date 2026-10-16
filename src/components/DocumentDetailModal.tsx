import React from 'react';
import {
  X,
  FileText,
  ExternalLink,
  Download,
  Lock,
  MessageSquare,
  Building,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  History,
  Tag,
  Shield,
  Layers,
} from 'lucide-react';
import { Document, User, DocumentVersion } from '../types';
import { store } from '../services/store';

interface DocumentDetailModalProps {
  document: Document | null;
  currentUser: User;
  onClose: () => void;
  onAskDoc: (docId: string) => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  document,
  currentUser,
  onClose,
  onAskDoc,
}) => {
  if (!document) return null;

  const canDownload = store.canDownloadDocument(currentUser, document);
  const versions: DocumentVersion[] = store.getDocumentVersions(document.id);
  const replacementDoc = document.replacementDocumentId
    ? store.getDocumentById(document.replacementDocumentId, currentUser)
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="space-y-1 pr-6">
            <div className="flex items-center space-x-2">
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                  document.sourceType === 'Google Drive'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                    : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300'
                }`}
              >
                {document.sourceType}
              </span>
              <span className="text-xs text-slate-400">
                {document.documentType} • Versi {document.version}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {document.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Nomor: {document.documentNumber || '-'} {document.year ? `• Tahun ${document.year}` : ''}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300">
          {/* Legal Status Alert Banner */}
          {document.legalStatus === 'Tidak Berlaku' && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-900 dark:text-red-200 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-sm">
                <XCircle className="w-4 h-4 text-red-600" />
                <span>Dokumen Berstatus Tidak Berlaku / Telah Dicabut</span>
              </div>
              <p className="text-xs leading-relaxed">{document.legalStatusNote}</p>
              {(replacementDoc || document.replacementDocumentTitle) && (
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 text-xs">
                  <span className="font-semibold text-emerald-600">Dokumen Pengganti Resmi:</span>{' '}
                  <span className="font-bold">
                    {replacementDoc ? replacementDoc.title : document.replacementDocumentTitle}
                  </span>
                </div>
              )}
            </div>
          )}

          {document.legalStatus === 'Belum Terverifikasi' && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 space-y-1.5">
              <div className="flex items-center space-x-2 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Status Belum Terverifikasi JDIH</span>
              </div>
              <p className="text-xs leading-relaxed">{document.legalStatusNote}</p>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Tim Pemilik
              </span>
              <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
                {document.ownerTeamName || 'Pemerintah Pusat (JDIH)'}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Visibilitas Akses
              </span>
              <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
                {document.visibility}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Izin Unduh
              </span>
              <span
                className={`font-semibold mt-0.5 inline-flex items-center space-x-1 ${
                  document.downloadAllowed ? 'text-emerald-600' : 'text-red-500'
                }`}
              >
                {document.downloadAllowed ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Diizinkan</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Hanya Baca</span>
                  </>
                )}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Status Indeks AI
              </span>
              <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
                {document.indexStatus}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Sinkron Terakhir
              </span>
              <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
                {document.lastSyncedAt
                  ? new Date(document.lastSyncedAt).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '-'}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Pengunggah / Sumber
              </span>
              <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
                {document.createdByName || 'Sinkronisasi Otomatis'}
              </span>
            </div>
          </div>

          {/* Tags */}
          {document.tags.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Kata Kunci & Tag:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {document.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Document Content / Clauses Preview */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Pratinjau Teks & Klausul Terindeks:
            </span>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
              {document.indexedText}
            </div>
          </div>

          {/* Version History */}
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              <History className="w-3.5 h-3.5 text-blue-500" />
              <span>Riwayat Versi Dokumen:</span>
            </div>
            {versions.length > 0 ? (
              <div className="space-y-2">
                {versions.map((ver) => (
                  <div
                    key={ver.id}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-blue-600">v{ver.version}</span>
                        <span className="text-slate-400 text-[11px]">
                          {new Date(ver.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          oleh {ver.createdByName || 'Admin'}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mt-1">
                        {ver.changeSummary || 'Penyusunan awal SOP.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-400 italic text-xs">Versi perdana (v1.0).</div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onAskDoc(document.id);
              }}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Tanya Dokumen Ini</span>
            </button>

            <a
              href={document.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-colors"
            >
              <span>Buka Dokumen Asli</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div>
            {canDownload ? (
              <a
                href={document.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Berkas</span>
              </a>
            ) : (
              <div
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl text-xs font-medium flex items-center space-x-1.5 cursor-not-allowed"
                title="Izin unduh dinonaktifkan oleh Admin Tim atau terbatas pada peran akun Anda"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Unduh Dinonaktifkan</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
