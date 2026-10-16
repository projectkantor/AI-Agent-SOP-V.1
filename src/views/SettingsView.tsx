import React, { useState } from 'react';
import {
  Settings,
  RefreshCw,
  Shield,
  HardDrive,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Lock,
  Server,
  Zap,
} from 'lucide-react';
import { User, JDIHSyncLog } from '../types';
import { store } from '../services/store';

interface SettingsViewProps {
  currentUser: User;
  onOpenJDIH: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currentUser, onOpenJDIH }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [syncSchedule, setSyncSchedule] = useState('12');
  const [autoIndexDrive, setAutoIndexDrive] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [promptDefense, setPromptDefense] = useState(true);

  const isSuperAdmin = currentUser.role === 'Super Admin';
  const syncLogs = store.getJDIHSyncLogs();
  const latestSync = syncLogs[0];

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncSuccessMsg(null);
    try {
      const log = await store.triggerJDIHSync();
      setSyncSuccessMsg(
        `Sinkronisasi berhasil! Diperiksa ${log.recordsProcessed} record regulasi JDIH Komdigi. Status dokumen diperbarui.`
      );
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResetData = () => {
    if (
      confirm(
        'Apakah Anda yakin ingin mengatur ulang data aplikasi kembali ke data DEMO bawaan pabrik?'
      )
    ) {
      store.resetToFactoryDefaults();
      alert('Data pangkalan SOP & regulasi telah diatur ulang ke kondisi demo awal.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Pengaturan Sistem & Integrasi Regulasi
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Konfigurasi sinkronisasi JDIH Komdigi, konektor Google Drive, dan tata kelola keamanan RBAC.
        </p>
      </div>

      {/* JDIH Integration Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                Integrasi Portal JDIH Komdigi
              </h2>
              <p className="text-[11px] text-slate-500">
                Penyedia verifikasi status keberlakuan dan relasi peraturan perundang-undangan.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenJDIH}
            className="text-xs text-blue-600 hover:underline flex items-center space-x-1"
          >
            <span>Buka JDIH</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Sync Status Banner */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-slate-900 dark:text-white">
                Status Koneksi: Terhubung (Live API Adapter)
              </span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Sinkronisasi Terakhir:{' '}
              {latestSync
                ? new Date(latestSync.startedAt).toLocaleString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Belum pernah'}
            </p>
          </div>

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium rounded-xl text-xs flex items-center justify-center space-x-2 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
          </button>
        </div>

        {syncSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{syncSuccessMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Jadwal Sinkronisasi Otomatis
            </label>
            <select
              value={syncSchedule}
              onChange={(e) => setSyncSchedule(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200"
            >
              <option value="6">Setiap 6 Jam</option>
              <option value="12">Setiap 12 Jam (Rekomendasi)</option>
              <option value="24">Setiap 24 Jam (Sekali Sehari)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              URL Endpoint JDIH
            </label>
            <input
              type="text"
              readOnly
              value="https://jdih.komdigi.go.id"
              className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-500 font-mono text-xs cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Google Drive Workspace Connector Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center space-x-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">
              Konektor Google Drive (Sumber SOP Internal)
            </h2>
            <p className="text-[11px] text-slate-500">
              Integrasi pembacaan dokumen SOP & pedoman kerja berbasis tautan Google Drive resmi.
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Service Account Google Drive: Read-Only
              </p>
              <p className="text-[11px] text-slate-500">
                Akses aman tanpa izin memodifikasi berkas asli di Google Drive instansi.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              Aktif & Terotorisasi
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                Pengindeksan Teks Otomatis (Auto-Index Drive Link)
              </p>
              <p className="text-[11px] text-slate-500">
                Mengekstrak klausul, pasal, dan ringkasan saat tautan Google Drive baru ditambahkan.
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoIndexDrive}
              onChange={(e) => setAutoIndexDrive(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Security & RBAC Configuration */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center space-x-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">
              Tata Kelola Keamanan & Pertahanan AI (Security Hardening)
            </h2>
            <p className="text-[11px] text-slate-500">
              Pengaturan pertahanan prompt injection dan isolasi batasan dokumen rahasia.
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                Pertahanan Prompt Injection & Adversarial Attack
              </p>
              <p className="text-[11px] text-slate-500">
                Memblokir upaya pembocoran dokumen 'Hanya Tim' atau instruksi yang mencoba mengabaikan aturan kedinasan.
              </p>
            </div>
            <input
              type="checkbox"
              checked={promptDefense}
              onChange={(e) => setPromptDefense(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Batas Waktu Sesi Tidak Aktif (Session Timeout)
              </label>
              <select
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200"
              >
                <option value="30">30 Menit</option>
                <option value="60">60 Menit (Standar)</option>
                <option value="120">2 Jam</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Retensi Log Audit Sistem
              </label>
              <input
                type="text"
                readOnly
                value="365 Hari (Sesuai Kebijakan Arsip Negara)"
                className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-500 cursor-not-allowed text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Factory Reset Danger Zone */}
      {isSuperAdmin && (
        <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-red-900 dark:text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <h3 className="font-bold text-xs uppercase tracking-wider">
              Zona Pengaturan Administrator Utama
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Jika diperlukan untuk pengujian demo ulang, Anda dapat mengatur ulang seluruh pangkalan data SOP, hak akses admin, dan riwayat pertanyaan kembali ke data bawaan simulasi.
          </p>
          <button
            onClick={handleResetData}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data Simulasi Bawaan</span>
          </button>
        </div>
      )}
    </div>
  );
};
