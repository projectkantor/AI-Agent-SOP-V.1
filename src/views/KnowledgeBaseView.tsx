import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  FileText,
  ExternalLink,
  Download,
  Lock,
  MessageSquare,
  Eye,
  Building,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Sparkles,
  LayoutGrid,
  List as ListIcon,
  Trash2,
  Edit3,
} from 'lucide-react';
import { Document, User, SourceType, Visibility, LegalStatus, IndexStatus } from '../types';
import { store } from '../services/store';

interface KnowledgeBaseViewProps {
  currentUser: User;
  onOpenAddModal: () => void;
  onViewDetail: (doc: Document) => void;
  onAskDoc: (docId: string) => void;
  onEditDoc?: (doc: Document) => void;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  currentUser,
  onOpenAddModal,
  onViewDetail,
  onAskDoc,
  onEditDoc,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterLegal, setFilterLegal] = useState<string>('all');
  const [filterVisibility, setFilterVisibility] = useState<string>('all');
  const [filterIndex, setFilterIndex] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const canUpload = store.canUploadDocument(currentUser);
  const permittedDocs = store.getPermittedDocuments(currentUser);
  const teams = store.getTeams();

  // Distinct document types and years for filter dropdowns
  const availableTypes = useMemo(() => {
    return Array.from(new Set(permittedDocs.map((d) => d.documentType))).filter(Boolean);
  }, [permittedDocs]);

  const availableYears = useMemo(() => {
    return Array.from(new Set(permittedDocs.map((d) => d.year))).filter(Boolean).sort((a, b) => (b as number) - (a as number));
  }, [permittedDocs]);

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return permittedDocs.filter((doc) => {
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = doc.title.toLowerCase().includes(q);
        const matchesNumber = doc.documentNumber?.toLowerCase().includes(q) || false;
        const matchesYear = doc.year?.toString().includes(q) || false;
        const matchesTags = doc.tags.some((t) => t.toLowerCase().includes(q));
        const matchesText = doc.indexedText.toLowerCase().includes(q);
        if (!matchesTitle && !matchesNumber && !matchesYear && !matchesTags && !matchesText) {
          return false;
        }
      }

      // Source Filter
      if (filterSource !== 'all' && doc.sourceType !== filterSource) return false;

      // Team Filter
      if (filterTeam !== 'all') {
        if (filterTeam === 'jdih' && doc.sourceType !== 'JDIH') return false;
        if (filterTeam !== 'jdih' && doc.ownerTeamId !== filterTeam) return false;
      }

      // Type Filter
      if (filterType !== 'all' && doc.documentType !== filterType) return false;

      // Year Filter
      if (filterYear !== 'all' && doc.year?.toString() !== filterYear) return false;

      // Legal Status Filter
      if (filterLegal !== 'all' && doc.legalStatus !== filterLegal) return false;

      // Visibility Filter
      if (filterVisibility !== 'all' && doc.visibility !== filterVisibility) return false;

      // Index Status Filter
      if (filterIndex !== 'all' && doc.indexStatus !== filterIndex) return false;

      return true;
    });
  }, [
    permittedDocs,
    searchTerm,
    filterSource,
    filterTeam,
    filterType,
    filterYear,
    filterLegal,
    filterVisibility,
    filterIndex,
  ]);

  const getLegalStatusBadge = (status: LegalStatus) => {
    switch (status) {
      case 'Berlaku':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
            Berlaku
          </span>
        );
      case 'Tidak Berlaku':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800">
            <XCircle className="w-3 h-3 mr-1 text-red-600" />
            Tidak Berlaku
          </span>
        );
      case 'Belum Terverifikasi':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
            <AlertTriangle className="w-3 h-3 mr-1 text-yellow-600" />
            Belum Terverifikasi
          </span>
        );
    }
  };

  const getIndexStatusBadge = (status: IndexStatus) => {
    switch (status) {
      case 'Terindeks':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
            Terindeks
          </span>
        );
      case 'Menunggu':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900">
            Menunggu
          </span>
        );
      case 'Gagal':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900">
            Gagal
          </span>
        );
    }
  };

  const getVisibilityBadge = (vis: Visibility) => {
    switch (vis) {
      case 'Publik':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            Publik
          </span>
        );
      case 'Terbagi':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            Terbagi
          </span>
        );
      case 'Hanya Tim':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Hanya Tim
          </span>
        );
    }
  };

  const handleDelete = (doc: Document) => {
    if (confirm(`Apakah Anda yakin ingin menghapus arsip dokumen "${doc.title}"?`)) {
      try {
        store.deleteDocument(doc.id, currentUser);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Knowledge Base Dokumen & Regulasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Pusat dokumen SOP resmi instansi dan peraturan perundang-undangan terverifikasi JDIH.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Tampilan Tabel"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Tampilan Kartu"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Add SOP Link Button (Restricted to Super Admin & Admin Tim) */}
          {canUpload ? (
            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-medium flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tautan SOP</span>
            </button>
          ) : (
            <div
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl text-xs flex items-center space-x-1.5 cursor-not-allowed"
              title="Hanya Super Admin & Admin Tim yang dapat mengunggah SOP baru"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Unggah SOP (Perlu Hak Admin)</span>
            </div>
          )}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan judul dokumen, nomor, tahun, kata kunci, atau teks pasal..."
            className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {/* Sumber */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Sumber</label>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200"
            >
              <option value="all">Semua Sumber</option>
              <option value="Google Drive">Google Drive</option>
              <option value="JDIH">JDIH</option>
            </select>
          </div>

          {/* Tim Pengampu */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tim Pengampu</label>
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200"
            >
              <option value="all">Semua Tim</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
              <option value="jdih">JDIH Pusat</option>
            </select>
          </div>

          {/* Jenis */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Jenis Dokumen</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200"
            >
              <option value="all">Semua Jenis</option>
              {availableTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Tahun */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tahun</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200"
            >
              <option value="all">Semua Tahun</option>
              {availableYears.map((yr) => (
                <option key={yr as number} value={(yr as number).toString()}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Status Keberlakuan */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Keberlakuan</label>
            <select
              value={filterLegal}
              onChange={(e) => setFilterLegal(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200"
            >
              <option value="all">Semua Status</option>
              <option value="Berlaku">Berlaku</option>
              <option value="Tidak Berlaku">Tidak Berlaku</option>
              <option value="Belum Terverifikasi">Belum Terverifikasi</option>
            </select>
          </div>

          {/* Visibilitas */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Visibilitas</label>
            <select
              value={filterVisibility}
              onChange={(e) => setFilterVisibility(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200"
            >
              <option value="all">Semua Visibilitas</option>
              <option value="Publik">Publik</option>
              <option value="Terbagi">Terbagi</option>
              <option value="Hanya Tim">Hanya Tim</option>
            </select>
          </div>
        </div>

        {/* Counter Info */}
        <div className="flex items-center justify-between pt-1 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Menampilkan <strong>{filteredDocs.length}</strong> dari{' '}
            <strong>{permittedDocs.length}</strong> dokumen yang berhak Anda akses ({currentUser.role}).
          </span>
          {(searchTerm ||
            filterSource !== 'all' ||
            filterTeam !== 'all' ||
            filterType !== 'all' ||
            filterYear !== 'all' ||
            filterLegal !== 'all' ||
            filterVisibility !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterSource('all');
                setFilterTeam('all');
                setFilterType('all');
                setFilterYear('all');
                setFilterLegal('all');
                setFilterVisibility('all');
                setFilterIndex('all');
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* Main List / Grid Content */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-base text-slate-900 dark:text-white">
            Tidak Ada Dokumen yang Ditemukan
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Tidak ada dokumen yang cocok dengan filter atau kata kunci pencarian Anda pada batas akses peran{' '}
            <span className="font-semibold text-blue-600">{currentUser.role}</span>.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Judul Dokumen</th>
                  <th className="py-3.5 px-3">Jenis & Sumber</th>
                  <th className="py-3.5 px-3">Tim Pemilik</th>
                  <th className="py-3.5 px-3">Visibilitas</th>
                  <th className="py-3.5 px-3">Status Indeks</th>
                  <th className="py-3.5 px-3">Keberlakuan</th>
                  <th className="py-3.5 px-3">Versi</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDocs.map((doc) => {
                  const canDownload = store.canDownloadDocument(currentUser, doc);
                  const canEdit = store.canEditDocument(currentUser, doc);

                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Judul & Nomor */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-semibold text-slate-900 dark:text-white text-xs leading-snug">
                          {doc.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-2">
                          <span>{doc.documentNumber || 'Tanpa Nomor'}</span>
                          {doc.year && <span>• Tahun {doc.year}</span>}
                        </div>
                      </td>

                      {/* Jenis & Sumber */}
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {doc.documentType}
                        </div>
                        <span
                          className={`inline-block text-[10px] px-1.5 py-0.2 rounded mt-0.5 font-semibold ${
                            doc.sourceType === 'Google Drive'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                              : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300'
                          }`}
                        >
                          {doc.sourceType}
                        </span>
                      </td>

                      {/* Tim */}
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                        {doc.ownerTeamName || 'Pemerintah Pusat (JDIH)'}
                      </td>

                      {/* Visibilitas */}
                      <td className="py-3.5 px-3">{getVisibilityBadge(doc.visibility)}</td>

                      {/* Status Indeks */}
                      <td className="py-3.5 px-3">{getIndexStatusBadge(doc.indexStatus)}</td>

                      {/* Status Keberlakuan */}
                      <td className="py-3.5 px-3">{getLegalStatusBadge(doc.legalStatus)}</td>

                      {/* Versi */}
                      <td className="py-3.5 px-3 text-slate-500 font-mono">v{doc.version}</td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Detail */}
                          <button
                            onClick={() => onViewDetail(doc)}
                            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Lihat Detail & Riwayat Dokumen"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Tanya Dokumen Ini */}
                          <button
                            onClick={() => onAskDoc(doc.id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                            title="Tanya Dokumen Ini pada AI Agent"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          {/* Unduh (Gated) */}
                          {canDownload ? (
                            <a
                              href={doc.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                              title="Unduh Berkas Resmi"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          ) : (
                            <span
                              className="p-1.5 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                              title="Izin unduh tidak diberikan"
                            >
                              <Lock className="w-4 h-4" />
                            </span>
                          )}

                          {/* Delete (Admin only) */}
                          {canEdit && (
                            <button
                              onClick={() => handleDelete(doc)}
                              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                              title="Hapus Dokumen"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const canDownload = store.canDownloadDocument(currentUser, doc);
            const canEdit = store.canEditDocument(currentUser, doc);

            return (
              <div
                key={doc.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-500 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        doc.sourceType === 'Google Drive'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                          : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300'
                      }`}
                    >
                      {doc.sourceType}
                    </span>
                    {getLegalStatusBadge(doc.legalStatus)}
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                    {doc.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    No: {doc.documentNumber || '-'} • Th {doc.year || '-'}
                  </p>

                  <div className="mt-3 flex items-center space-x-2 text-[10px]">
                    {getVisibilityBadge(doc.visibility)}
                    {getIndexStatusBadge(doc.indexStatus)}
                    <span className="text-slate-400">v{doc.version}</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 line-clamp-3 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                    {doc.indexedText}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => onViewDetail(doc)}
                    className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline inline-flex items-center space-x-1"
                  >
                    <span>Detail & Riwayat</span>
                  </button>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => onAskDoc(doc.id)}
                      className="px-2.5 py-1 text-xs bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium rounded-lg hover:bg-blue-100 transition-colors flex items-center space-x-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Tanya Dokumen</span>
                    </button>

                    {canDownload ? (
                      <a
                        href={doc.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Unduh"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="p-1.5 text-slate-300 dark:text-slate-600" title="Unduh dinonaktifkan">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
