import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Search,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  FileText,
  Globe,
} from 'lucide-react';

interface JDIHModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JDIHModal: React.FC<JDIHModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const officialUrl = 'https://jdih.komdigi.go.id';

  if (!isOpen) return null;

  const handleExternalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const queryUrl = searchTerm.trim()
      ? `${officialUrl}/pencarian?q=${encodeURIComponent(searchTerm.trim())}`
      : officialUrl;
    window.open(queryUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Jaringan Dokumentasi dan Informasi Hukum (JDIH)
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Portal Resmi Komdigi
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Layanan penelusuran peraturan perundang-undangan dan status keberlakuan hukum.
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

        {/* Search Bar on JDIH */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
          <form onSubmit={handleExternalSearch} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari peraturan di portal JDIH (misal: PMK Standar Biaya Masukan, Tata Kelola SPBE)..."
                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition-colors shrink-0"
            >
              <span>Cari di JDIH</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Body / Embedded Fallback Preview */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center justify-center text-center space-y-4 bg-slate-100/50 dark:bg-slate-950/50">
          <div className="max-w-md bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Verifikasi Langsung ke Pangkalan Data JDIH
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Sesuai kebijakan keamanan browser modern (CORS/X-Frame-Options), situs resmi pemerintah dilindungi dari penyematan iframe langsung. Anda dapat membuka portal resmi dalam tab baru yang aman.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1.5">
              <div className="flex items-center space-x-1.5 text-blue-600 dark:text-blue-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Ketentuan Hukum Integritas RAG:</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Isi web JDIH yang dibuka pengguna bersifat sebagai rujukan konfirmasi manual dan tidak diperlakukan sebagai basis teks model secara sembarangan tanpa sinkronisasi resmi.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <a
                href={officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 shadow-xs transition-colors"
              >
                <span>Buka JDIH Komdigi Resmi</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
