import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Search,
  RefreshCw,
  Globe,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

interface JDIHIframeModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
}

export const JDIHIframeModal: React.FC<JDIHIframeModalProps> = ({
  isOpen,
  onClose,
  searchQuery,
}) => {
  const [query, setQuery] = useState(searchQuery);
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(1);

  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  if (!isOpen) return null;

  const targetUrl = `https://jdih.komdigi.go.id/produk_hukum/pencarian?tentang=${encodeURIComponent(
    query
  )}&kategori=all&tahun=all`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                  Pencarian Produk Hukum JDIH Komdigi
                </h3>
                <span className="hidden sm:inline-flex text-[10px] px-1.5 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Resmi
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-sm sm:max-w-md">
                Kata Kunci: <strong className="text-blue-600 dark:text-blue-400">"{query}"</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-xs font-semibold flex items-center space-x-1 transition-colors"
              title="Buka Langsung di Tab Baru"
            >
              <span>Buka Tab Baru</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleRefresh}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Muat Ulang Iframe"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* URL Bar & Query Input */}
        <div className="px-3 sm:px-4 py-2 bg-slate-100 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
          <div className="flex-1 flex items-center space-x-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 min-w-0">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ubah kata kunci pencarian..."
              className="bg-transparent text-slate-800 dark:text-slate-200 w-full focus:outline-hidden text-xs truncate"
            />
          </div>

          <button
            onClick={handleCopyUrl}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 text-xs flex items-center space-x-1 shrink-0 font-mono"
            title="Salin Tautan Lengkap JDIH"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Salin URL'}</span>
          </button>
        </div>

        {/* Iframe Viewport Container */}
        <div className="flex-1 bg-slate-50 dark:bg-slate-950 relative overflow-hidden flex flex-col">
          <iframe
            key={iframeKey}
            src={targetUrl}
            title="Hasil Pencarian JDIH Komdigi"
            className="w-full flex-1 border-0"
            allow="fullscreen"
          />

          {/* Fallback Notice Bar at Bottom */}
          <div className="p-2 sm:p-2.5 bg-slate-900 text-slate-200 text-[11px] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Menampilkan hasil pencarian produk hukum resmi: <strong>"{query}"</strong>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400 text-[10px]">
                Jika halaman kosong karena proteksi keamanan iframe:
              </span>
              <a
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-400 hover:text-blue-300 font-semibold"
              >
                Klik untuk Buka di Tab Baru JDIH
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
