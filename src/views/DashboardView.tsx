import React from 'react';
import {
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  HelpCircle,
  Users,
  Activity,
  ArrowUpRight,
  ExternalLink,
  Shield,
  FileWarning,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { User, Document } from '../types';
import { store } from '../services/store';

interface DashboardViewProps {
  currentUser: User;
  onViewDoc: (doc: Document) => void;
  onAskDoc: (docId: string) => void;
  onOpenJDIH: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  onViewDoc,
  onAskDoc,
  onOpenJDIH,
}) => {
  const isSuperAdmin = currentUser.role === 'Super Admin';
  const permittedDocs = store.getPermittedDocuments(currentUser);
  const auditLogs = store.getAuditLogs(currentUser);
  const feedbacks = store.getFeedbacks(currentUser);
  const syncLogs = store.getJDIHSyncLogs();
  const allUsers = store.getUsers();

  // Metrics
  const totalIndexed = permittedDocs.filter((d) => d.indexStatus === 'Terindeks').length;
  const revokedRegulations = permittedDocs.filter(
    (d) => d.sourceType === 'JDIH' && d.legalStatus === 'Tidak Berlaku'
  );
  const unverifiedDocs = permittedDocs.filter(
    (d) => d.legalStatus === 'Belum Terverifikasi' || d.indexStatus === 'Gagal'
  );

  // SOPs affected by revoked or changed regulations
  const revokedIds = new Set(revokedRegulations.map((r) => r.id));
  const impactedSOPs = permittedDocs.filter(
    (d) =>
      d.sourceType === 'Google Drive' &&
      d.baseRegulationIds.some((baseId) => revokedIds.has(baseId))
  );

  // Fallback / pending feedback
  const unresolvedFeedbacks = feedbacks.filter((f) => f.reviewStatus === 'Baru');
  const latestSync = syncLogs[0];

  const cards = [
    {
      label: 'Dokumen Terindeks',
      value: totalIndexed,
      icon: FileText,
      color: 'blue',
      sub: isSuperAdmin ? 'Seluruh unit kerja instansi' : 'Unit kerja tim Anda',
    },
    {
      label: 'Regulasi Berubah (JDIH)',
      value: revokedRegulations.length,
      icon: AlertCircle,
      color: 'red',
      sub: 'Perlu sinkronisasi & telaah hukum',
    },
    {
      label: 'SOP Terdampak Perubahan',
      value: impactedSOPs.length,
      icon: FileWarning,
      color: 'amber',
      sub: 'Terkait regulasi yang telah dicabut',
    },
    {
      label: 'Dokumen Perlu Evaluasi',
      value: unverifiedDocs.length,
      icon: Clock,
      color: 'yellow',
      sub: 'Belum terverifikasi / indeks gagal',
    },
    {
      label: 'Sinkronisasi JDIH Terakhir',
      value: latestSync ? latestSync.status : 'Belum Ada',
      icon: RefreshCw,
      color: 'emerald',
      sub: latestSync ? `${latestSync.recordsProcessed} record diperiksa` : '-',
    },
    {
      label: 'Laporan Umpan Balik',
      value: unresolvedFeedbacks.length,
      icon: HelpCircle,
      color: 'purple',
      sub: `${feedbacks.length} total tanggapan masuk`,
    },
    {
      label: 'Pengguna Aktif',
      value: allUsers.filter((u) => u.isActive).length,
      icon: Users,
      color: 'indigo',
      sub: 'Pegawai ASN & Administrator',
    },
    {
      label: 'Aktivitas Audit Tercatat',
      value: auditLogs.length,
      icon: Activity,
      color: 'sky',
      sub: 'Log integritas data sistem',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Dasbor Pembaruan Regulasi & Evaluasi SOP
            </h1>
            <span className="text-xs px-2 py-0.5 rounded font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
              {currentUser.role}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pantau keterkaitan regulasi pusat JDIH dengan kepatuhan SOP operasional instansi secara real-time.
          </p>
        </div>

        <button
          onClick={onOpenJDIH}
          className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
          <span>Status JDIH Komdigi</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                  {c.label}
                </span>
                <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {c.value}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate">{c.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two columns: Changed Regulations & Impacted SOPs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Changed Regulations Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                Regulasi Berubah & Telah Dicabut (JDIH)
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              {revokedRegulations.length} regulasi
            </span>
          </div>

          {revokedRegulations.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              Semua regulasi JDIH berstatus aktif dan berlaku.
            </div>
          ) : (
            <div className="space-y-3">
              {revokedRegulations.map((reg) => (
                <div
                  key={reg.id}
                  className="p-3 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-red-900 dark:text-red-300">
                      {reg.title}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200">
                      Tidak Berlaku
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                    No: {reg.documentNumber || '-'} • Th {reg.year || '-'}
                  </p>
                  {reg.replacementDocumentTitle && (
                    <div className="p-2 rounded bg-white dark:bg-slate-900 text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      <strong className="text-emerald-600 dark:text-emerald-400">Pengganti Resmi:</strong>{' '}
                      {reg.replacementDocumentTitle}
                    </div>
                  )}
                  <div className="pt-1 flex items-center justify-end space-x-2 text-[11px]">
                    <button
                      onClick={() => onViewDoc(reg)}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      Lihat Rincian Perubahan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Impacted SOPs Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                SOP Terdampak yang Perlu Ditinjau & Direvisi
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              {impactedSOPs.length} SOP terhubung
            </span>
          </div>

          {impactedSOPs.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              Tidak ada SOP yang terhubung ke regulasi yang telah dicabut.
            </div>
          ) : (
            <div className="space-y-3">
              {impactedSOPs.map((sop) => (
                <div
                  key={sop.id}
                  className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-950 dark:text-amber-200">
                      {sop.title}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                      Perlu Evaluasi
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Unit: {sop.ownerTeamName || 'Instansi'} • No: {sop.documentNumber || '-'}
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Tergantung regulasi lama</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => onViewDoc(sop)}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        Telaah SOP
                      </button>
                      <button
                        onClick={() => onAskDoc(sop.id)}
                        className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                      >
                        Konsultasi AI
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Audit Log Activity Stream */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">
              Log Audit & Kepatuhan Integritas Sistem ({currentUser.role})
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Terfilter sesuai hak lingkup
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Waktu</th>
                <th className="py-2.5 px-3">Pelaksana</th>
                <th className="py-2.5 px-3">Tindakan</th>
                <th className="py-2.5 px-3">Tipe Sumber</th>
                <th className="py-2.5 px-3">Objek / Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {auditLogs.slice(0, 8).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                    {new Date(log.createdAt).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                    {log.actorName}{' '}
                    <span className="text-[10px] text-slate-400">({log.actorRole})</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                    {log.resourceType}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 truncate max-w-xs">
                    {log.resourceTitle || JSON.stringify(log.metadata)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
