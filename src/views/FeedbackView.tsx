import React, { useState } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileText,
  User as UserIcon,
  Filter,
} from 'lucide-react';
import { User, FeedbackItem } from '../types';
import { store } from '../services/store';

interface FeedbackViewProps {
  currentUser: User;
}

export const FeedbackView: React.FC<FeedbackViewProps> = ({ currentUser }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');

  const feedbacks = store.getFeedbacks(currentUser);

  const filteredFeedbacks = feedbacks.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (filterStatus !== 'all' && item.reviewStatus !== filterStatus) return false;
    return true;
  });

  const helpfulCount = feedbacks.filter((f) => f.type === 'Membantu').length;
  const unhelpfulCount = feedbacks.filter((f) => f.type === 'Tidak membantu').length;
  const reportsCount = feedbacks.filter((f) => f.type === 'Laporan kekeliruan').length;
  const total = feedbacks.length;
  const satisfactionRate = total > 0 ? Math.round((helpfulCount / total) * 100) : 100;

  const handleUpdateStatus = (
    id: string,
    status: 'Baru' | 'Ditinjau' | 'Ditindaklanjuti',
    notes?: string
  ) => {
    store.updateFeedbackReview(id, status, notes);
    setActiveEditingId(null);
    setAdminNoteInput('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Umpan Balik & Evaluasi Jawaban AI
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Tinjau penilaian akurasi jawaban dari pegawai ASN dan tindak lanjuti laporan kekeliruan kutipan rujukan.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Tingkat Kepuasan Jawaban</div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{satisfactionRate}%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Berdasarkan umpan balik pengguna</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Menilai Membantu</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {helpfulCount}
          </div>
          <div className="text-[11px] text-emerald-500 mt-0.5 flex items-center">
            <ThumbsUp className="w-3 h-3 mr-1" /> Terbantu secara akurat
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Menilai Kurang Membantu</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {unhelpfulCount}
          </div>
          <div className="text-[11px] text-amber-500 mt-0.5 flex items-center">
            <ThumbsDown className="w-3 h-3 mr-1" /> Perlu pengayaan rujukan
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Laporan Kekeliruan</div>
          <div className="text-2xl font-bold text-red-600 mt-2">{reportsCount}</div>
          <div className="text-[11px] text-red-500 mt-0.5 flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" /> Perlu verifikasi regulasi
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-slate-500">Tipe Umpan Balik:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-slate-800 dark:text-slate-200"
            >
              <option value="all">Semua Tipe</option>
              <option value="Membantu">Membantu</option>
              <option value="Tidak membantu">Tidak membantu</option>
              <option value="Laporan kekeliruan">Laporan kekeliruan</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-slate-500">Status Tindak Lanjut:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-slate-800 dark:text-slate-200"
            >
              <option value="all">Semua Status</option>
              <option value="Baru">Baru</option>
              <option value="Ditinjau">Ditinjau</option>
              <option value="Ditindaklanjuti">Ditindaklanjuti</option>
            </select>
          </div>
        </div>

        <span className="text-slate-400">
          Menampilkan {filteredFeedbacks.length} umpan balik
        </span>
      </div>

      {/* Feedbacks List */}
      <div className="space-y-3">
        {filteredFeedbacks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
            Belum ada umpan balik yang cocok dengan filter saat ini.
          </div>
        ) : (
          filteredFeedbacks.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-2">
                  {item.type === 'Membantu' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <ThumbsUp className="w-3 h-3 mr-1" /> Membantu
                    </span>
                  )}
                  {item.type === 'Tidak membantu' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                      <ThumbsDown className="w-3 h-3 mr-1" /> Kurang Membantu
                    </span>
                  )}
                  {item.type === 'Laporan kekeliruan' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
                      <AlertTriangle className="w-3 h-3 mr-1" /> Laporan Kekeliruan
                    </span>
                  )}

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      item.reviewStatus === 'Ditindaklanjuti'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
                        : item.reviewStatus === 'Ditinjau'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    Status: {item.reviewStatus}
                  </span>
                </div>

                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(item.createdAt).toLocaleString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Question & Answer Snippets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Pertanyaan Pengguna ({item.userName}):
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">
                    "{item.questionSnippet}"
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Cuplikan Jawaban AI:
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 italic">
                    "{item.answerSnippet}"
                  </p>
                </div>
              </div>

              {/* User Note */}
              {item.note && (
                <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs">
                  <span className="font-semibold text-amber-900 dark:text-amber-200">
                    Catatan Pengguna:
                  </span>{' '}
                  <span className="text-slate-700 dark:text-slate-300">{item.note}</span>
                </div>
              )}

              {/* Admin Note if present */}
              {item.adminNotes && (
                <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs">
                  <span className="font-semibold text-blue-900 dark:text-blue-200">
                    Catatan Tindak Lanjut Admin:
                  </span>{' '}
                  <span className="text-slate-700 dark:text-slate-300">{item.adminNotes}</span>
                </div>
              )}

              {/* Action Toolbar for Admins */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  Rujukan Dokumen: {item.documentTitle || 'Regulasi Umum'}
                </span>

                {activeEditingId === item.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Tulis catatan tindak lanjut..."
                      value={adminNoteInput}
                      onChange={(e) => setAdminNoteInput(e.target.value)}
                      className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                    />
                    <button
                      onClick={() =>
                        handleUpdateStatus(item.id, 'Ditindaklanjuti', adminNoteInput)
                      }
                      className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
                    >
                      Selesai Ditindaklanjuti
                    </button>
                    <button
                      onClick={() => setActiveEditingId(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    {item.reviewStatus !== 'Ditinjau' && item.reviewStatus !== 'Ditindaklanjuti' && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'Ditinjau')}
                        className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                      >
                        Tandai Ditinjau
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setActiveEditingId(item.id);
                        setAdminNoteInput(item.adminNotes || '');
                      }}
                      className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-100 transition-colors"
                    >
                      Beri Tindak Lanjut
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
