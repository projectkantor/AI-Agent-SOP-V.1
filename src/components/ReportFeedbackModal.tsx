import React, { useState } from 'react';
import { X, Flag, AlertTriangle, Send } from 'lucide-react';
import { store } from '../services/store';

interface ReportFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  documentId: string | null;
  questionSnippet: string;
  answerSnippet: string;
}

export const ReportFeedbackModal: React.FC<ReportFeedbackModalProps> = ({
  isOpen,
  onClose,
  conversationId,
  documentId,
  questionSnippet,
  answerSnippet,
}) => {
  const [reportNote, setReportNote] = useState('');
  const [reportReason, setReportReason] = useState('Pasal/Ketentuan Tidak Sesuai');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportNote.trim()) return;

    store.submitFeedback({
      conversationId,
      documentId,
      type: 'Laporan kekeliruan',
      note: `[Kategori: ${reportReason}] ${reportNote.trim()}`,
      questionSnippet,
      answerSnippet: answerSnippet.slice(0, 180) + '...',
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setReportNote('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Laporkan Kekeliruan Jawaban AI
              </h3>
              <p className="text-[11px] text-slate-500">
                Bantu Admin Tim memverifikasi dan menyelaraskan rujukan regulasi resmi.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              ✓
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">
              Laporan Berhasil Dikirimkan!
            </p>
            <p className="text-[11px] text-slate-500">
              Admin Tim akan meninjau dan memperbarui pangkalan rujukan SOP.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Snippet Context */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Pertanyaan yang Dilaporkan:
              </span>
              <p className="text-slate-800 dark:text-slate-200 font-medium">"{questionSnippet}"</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kategori Kekeliruan
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-800 dark:text-slate-200"
              >
                <option value="Pasal/Ketentuan Tidak Sesuai">Pasal / Butir Langkah Tidak Sesuai</option>
                <option value="Regulasi Sudah Dicabut">Regulasi Terkait Telah Dicabut / Diganti</option>
                <option value="Nomor/Tahun Dokumen Keliru">Nomor atau Tahun Dokumen Keliru</option>
                <option value="Kutipan Terpotong">Kutipan Rujukan Terpotong / Membingungkan</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Catatan / Koreksi yang Tepat *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Jelaskan bagian mana yang keliru dan nomor/pasal SOP yang sebenarnya berlaku..."
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!reportNote.trim()}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-semibold rounded-xl flex items-center space-x-1.5 shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Laporan</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
