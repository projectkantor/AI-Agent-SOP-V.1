import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  BookOpen,
  FileText,
  AlertTriangle,
  Info,
  ExternalLink,
  Download,
  ThumbsUp,
  ThumbsDown,
  Flag,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { User, AIConversation, SourceReference } from '../types';
import { askAIAgent, AnswerResult } from '../services/aiRAG';
import { store } from '../services/store';

interface AgentViewProps {
  currentUser: User;
  onOpenJDIH: () => void;
  onViewDocument: (docId: string) => void;
  onOpenReportModal: (convId: string, docId: string | null, qSnippet: string, aSnippet: string) => void;
  initialPinnedDocId?: string | null;
  onClearPinnedDoc?: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  references?: SourceReference[];
  hasInactiveWarning?: boolean;
  inactiveWarningMessage?: string;
  hasUnverifiedWarning?: boolean;
  unverifiedWarningMessage?: string;
  emptyState?: boolean;
  canCheckJDIH?: boolean;
  feedback?: 'Membantu' | 'Tidak membantu' | 'Laporan kekeliruan' | null;
}

const QUICK_QUESTIONS = [
  'Berapa hari sebelum keberangkatan pengajuan perjalanan dinas luar kota?',
  'Apa saja syarat pencairan honorarium narasumber kegiatan?',
  'Berapa batas uang harian perjalanan dinas DKI Jakarta PMK 49/2023?',
  'Bagaimana tata cara dan hak pengajuan cuti tahunan ASN?',
  'Pengadaan langsung barang dan jasa pemerintah di bawah 50 juta?',
  'SOP akses VPN internal dan kredensial server (Hanya Tim TI)',
  'Apakah Permenkominfo No. 12 Tahun 2021 masih berlaku?',
  'Ketentuan jam kerja fleksibel pegawai ASN',
];

export const AgentView: React.FC<AgentViewProps> = ({
  currentUser,
  onOpenJDIH,
  onViewDocument,
  onOpenReportModal,
  initialPinnedDocId,
  onClearPinnedDoc,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'agent',
      text: `Halo, **${currentUser.name}**! Saya adalah AI Agent Resmi SOP dan Regulasi Instansi.\n\nSaya siap membantu Anda menelusuri standar operasional prosedur (SOP) kedinasan, ketentuan administratif, serta peraturan perundang-undangan (JDIH) yang **sah, terindeks, dan masih berlaku** sesuai hak akses akun Anda.\n\nSilakan pilih mode jawaban (*Ringkas* atau *Rinci*) dan ajukan pertanyaan Anda.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuestion, setInputQuestion] = useState('');
  const [mode, setMode] = useState<'Ringkas' | 'Rinci'>('Ringkas');
  const [selectedScope, setSelectedScope] = useState<string>(
    initialPinnedDocId ? initialPinnedDocId : 'Semua sumber'
  );
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const permittedDocs = store.getPermittedDocuments(currentUser);

  useEffect(() => {
    if (initialPinnedDocId) {
      setSelectedScope(initialPinnedDocId);
    }
  }, [initialPinnedDocId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (customQuery?: string) => {
    const query = (customQuery || inputQuestion).trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const result: AnswerResult = await askAIAgent(query, mode, selectedScope, currentUser);

      const agentMessage: Message = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: result.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        references: result.sourceReferences,
        hasInactiveWarning: result.hasInactiveWarning,
        inactiveWarningMessage: result.inactiveWarningMessage,
        hasUnverifiedWarning: result.hasUnverifiedWarning,
        unverifiedWarningMessage: result.unverifiedWarningMessage,
        emptyState: result.emptyState,
        canCheckJDIH: result.canCheckJDIH,
        feedback: null,
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: 'agent',
          text: `Terjadi kendala saat memproses jawaban: ${err.message || 'Silakan coba sesaat lagi.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = (messageId: string, type: 'Membantu' | 'Tidak membantu') => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, feedback: type } : m))
    );

    const targetMsg = messages.find((m) => m.id === messageId);
    if (!targetMsg) return;

    const userQuestion = messages.slice(0, messages.indexOf(targetMsg)).reverse().find((m) => m.sender === 'user');

    store.submitFeedback({
      conversationId: messageId,
      documentId: targetMsg.references?.[0]?.documentId || null,
      documentTitle: targetMsg.references?.[0]?.documentTitle || null,
      type,
      note: type === 'Membantu' ? 'Jawaban dinilai membantu oleh pengguna.' : 'Jawaban dinilai kurang membantu.',
      questionSnippet: userQuestion?.text || 'Pertanyaan pengguna',
      answerSnippet: targetMsg.text.slice(0, 150) + '...',
    });
  };

  const handleReportIncorrect = (message: Message) => {
    const userQuestion = messages.slice(0, messages.indexOf(message)).reverse().find((m) => m.sender === 'user');
    onOpenReportModal(
      message.id,
      message.references?.[0]?.documentId || null,
      userQuestion?.text || 'Pertanyaan',
      message.text
    );
  };

  const pinnedDoc = initialPinnedDocId
    ? permittedDocs.find((d) => d.id === initialPinnedDocId)
    : null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-6xl mx-auto px-4 sm:px-6 py-4">
      {/* Top Scope and Mode Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 mb-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Scope Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Lingkup Rujukan:
            </span>
            <select
              value={selectedScope}
              onChange={(e) => {
                setSelectedScope(e.target.value);
                if (onClearPinnedDoc && e.target.value !== initialPinnedDocId) {
                  onClearPinnedDoc();
                }
              }}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="Semua sumber">Semua Sumber Terindeks</option>
              <option value="SOP (Drive)">Hanya SOP (Google Drive)</option>
              <option value="Regulasi (JDIH)">Hanya Regulasi (JDIH)</option>
              {pinnedDoc && (
                <option value={pinnedDoc.id}>📌 Dokumen: {pinnedDoc.title.slice(0, 35)}...</option>
              )}
            </select>

            {pinnedDoc && (
              <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-medium">
                Terkunci pada 1 dokumen
              </span>
            )}
          </div>

          {/* Mode Toggle: Ringkas vs Rinci */}
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => setMode('Ringkas')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                mode === 'Ringkas'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Mode Ringkas
            </button>
            <button
              onClick={() => setMode('Rinci')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                mode === 'Rinci'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Mode Rinci (Langkah demi Langkah)
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-3">
        {messages.map((message) => {
          const isUser = message.sender === 'user';
          return (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gradient-to-tr from-indigo-700 to-blue-600 text-white'
                }`}
              >
                {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
              </div>

              {/* Message Bubble Content */}
              <div className={`max-w-[85%] sm:max-w-[78%] space-y-2`}>
                <div
                  className={`rounded-2xl p-4 sm:p-5 text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none'
                  }`}
                >
                  {/* Warning: Inactive Regulation */}
                  {message.hasInactiveWarning && message.inactiveWarningMessage && (
                    <div className="mb-3.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-300 text-xs flex items-start space-x-2.5">
                      <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-900 dark:text-red-200">
                          Peringatan Dokumen Tidak Berlaku
                        </p>
                        <p className="mt-0.5 whitespace-pre-wrap">{message.inactiveWarningMessage}</p>
                      </div>
                    </div>
                  )}

                  {/* Warning: Unverified / Stale JDIH */}
                  {message.hasUnverifiedWarning && message.unverifiedWarningMessage && (
                    <div className="mb-3.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs flex items-start space-x-2.5">
                      <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-900 dark:text-amber-200">
                          Pemberitahuan Status JDIH
                        </p>
                        <p className="mt-0.5 whitespace-pre-wrap">{message.unverifiedWarningMessage}</p>
                      </div>
                    </div>
                  )}

                  {/* Body text with markdown-like formatting */}
                  <div className="whitespace-pre-wrap space-y-2 font-normal">
                    {message.text}
                  </div>

                  {/* JDIH Fallback Button if empty */}
                  {message.emptyState && message.canCheckJDIH && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2">
                      <button
                        onClick={onOpenJDIH}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors"
                      >
                        <span>Cek di Portal JDIH Komdigi</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Source References Citations Card */}
                {!isUser && message.references && message.references.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 sm:p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                        <span>Rujukan Sumber Resmi ({message.references.length})</span>
                      </span>
                      <span className="text-[10px] text-slate-400">Terverifikasi Hak Akses</span>
                    </div>

                    <div className="space-y-2">
                      {message.references.map((ref, idx) => (
                        <div
                          key={idx}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/70 rounded-lg p-2.5 text-xs hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                    ref.sourceType === 'Google Drive'
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                      : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300'
                                  }`}
                                >
                                  {ref.sourceType}
                                </span>
                                <span
                                  className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                    ref.legalStatus === 'Berlaku'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                      : ref.legalStatus === 'Tidak Berlaku'
                                      ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                                  }`}
                                >
                                  {ref.legalStatus}
                                </span>
                              </div>

                              <p className="font-semibold text-slate-900 dark:text-white mt-1">
                                {ref.documentTitle}
                              </p>
                              {ref.documentNumber && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                  Nomor: {ref.documentNumber} {ref.year ? `(${ref.year})` : ''}
                                </p>
                              )}

                              {ref.section && (
                                <div className="mt-1.5 p-1.5 rounded bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 italic">
                                  "{ref.quote || ref.section}"
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Reference actions */}
                          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                            <button
                              onClick={() => onViewDocument(ref.documentId)}
                              className="text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center space-x-1"
                            >
                              <span>Lihat Detail Dokumen</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>

                            <div className="flex items-center space-x-2">
                              {ref.downloadAllowed ? (
                                <a
                                  href={ref.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                                  title="Unduh / Buka Dokumen Asli"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Unduh</span>
                                </a>
                              ) : (
                                <span
                                  className="inline-flex items-center space-x-1 text-slate-400 cursor-not-allowed"
                                  title="Izin unduh dinonaktifkan oleh Admin Tim"
                                >
                                  <Lock className="w-3 h-3" />
                                  <span>Unduh Dikunci</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Agent Action Feedback Bar */}
                {!isUser && (
                  <div className="flex items-center justify-between px-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="text-[11px] text-slate-400">
                      {message.timestamp} • AI Agent Grounded
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleFeedback(message.id, 'Membantu')}
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                          message.feedback === 'Membantu'
                            ? 'text-emerald-600 font-semibold'
                            : 'text-slate-500'
                        }`}
                        title="Jawaban Membantu"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>Membantu</span>
                      </button>

                      <button
                        onClick={() => handleFeedback(message.id, 'Tidak membantu')}
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                          message.feedback === 'Tidak membantu'
                            ? 'text-red-600 font-semibold'
                            : 'text-slate-500'
                        }`}
                        title="Jawaban Kurang Membantu"
                      >
                        <ThumbsDown className="w-3 h-3" />
                        <span>Tidak</span>
                      </button>

                      <button
                        onClick={() => handleReportIncorrect(message)}
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                        title="Laporkan Jika Terdapat Kesalahan Jawaban"
                      >
                        <Flag className="w-3 h-3" />
                        <span>Laporkan Kekeliruan</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs text-slate-600 dark:text-slate-300 flex items-center space-x-2.5 shadow-xs">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>
                Mengevaluasi dokumen terindeks, memvalidasi hak akses & mensintesis rujukan resmi...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Suggestions */}
      {messages.length <= 2 && (
        <div className="mb-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Pertanyaan SOP & Regulasi yang Sering Dicari:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-left transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Tanyakan SOP atau regulasi, misalnya: prosedur perjalanan dinas..."
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl pl-3.5 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={!inputQuestion.trim() || isLoading}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-xl font-medium text-sm flex items-center space-x-1.5 transition-colors shadow-sm disabled:cursor-not-allowed"
          >
            <span>Kirim</span>
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Konteks diisolasi sesuai peran {currentUser.role}</span>
          </span>
          <span>Ditenagai AI Agent SOP & JDIH Komdigi</span>
        </div>
      </div>
    </div>
  );
};
