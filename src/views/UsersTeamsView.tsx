import React, { useState } from 'react';
import {
  Users,
  Building2,
  Shield,
  UserPlus,
  UserCheck,
  Lock,
  Plus,
  Search,
  CheckCircle2,
  Settings,
  Mail,
  BadgeAlert,
} from 'lucide-react';
import { User, Team, Role } from '../types';
import { store } from '../services/store';

interface UsersTeamsViewProps {
  currentUser: User;
}

export const UsersTeamsView: React.FC<UsersTeamsViewProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'teams'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);

  // Editing user role state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<Role>('User');
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserNip, setNewUserNip] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('User');
  const [newUserTeamIds, setNewUserTeamIds] = useState<string[]>([]);

  // New Team Form State
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamCode, setNewTeamCode] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');

  const isSuperAdmin = currentUser.role === 'Super Admin';
  const users = store.getUsers();
  const teams = store.getTeams();

  const filteredUsers = users.filter((u) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.nip && u.nip.includes(q)) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const handleOpenRoleModal = (u: User) => {
    setSelectedUser(u);
    setNewRole(u.role);
    setSelectedTeamIds([...u.teamIds]);
    setShowRoleModal(true);
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      store.assignUserRole(selectedUser.id, newRole, selectedTeamIds, currentUser);
      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    try {
      store.addUser(
        newUserName,
        newUserEmail,
        newUserNip,
        newUserRole,
        newUserTeamIds
      );
      setShowAddUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserNip('');
      setNewUserTeamIds([]);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName || !newTeamCode) return;
    try {
      store.addTeam(newTeamName, newTeamCode, newTeamDesc);
      setShowAddTeamModal(false);
      setNewTeamName('');
      setNewTeamCode('');
      setNewTeamDesc('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Manajemen Tim dan Pengguna
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Atur struktur unit kerja instansi dan kelola penugasan peran Admin Tim dengan akses dokumen tertentu.
          </p>
        </div>

        {isSuperAdmin && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-medium flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Pegawai</span>
            </button>
            <button
              onClick={() => setShowAddTeamModal(true)}
              className="px-3 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-medium flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Unit Tim</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('users')}
          className={`py-2.5 px-4 text-xs sm:text-sm font-medium border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'users'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Daftar Pengguna & Hak Akses ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('teams')}
          className={`py-2.5 px-4 text-xs sm:text-sm font-medium border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'teams'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Daftar Unit Tim ({teams.length})</span>
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari pengguna berdasarkan nama, NIP, atau peran..."
              className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Nama & Identitas</th>
                    <th className="py-3 px-3">Akun Resmi (Email)</th>
                    <th className="py-3 px-3">Peran (Role)</th>
                    <th className="py-3 px-3">Unit Tim Naungan</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((u) => {
                    const userTeams = teams.filter((t) => u.teamIds.includes(t.id));

                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2.5">
                            <img
                              src={
                                u.avatar ||
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
                              }
                              alt={u.name}
                              className="w-8 h-8 rounded-full object-cover shrink-0"
                            />
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white text-xs">
                                {u.name}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {u.nip ? `NIP: ${u.nip}` : 'Tamu / Akun Umum'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                          {u.email}
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                              u.role === 'Super Admin'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                                : u.role === 'Admin Tim'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                                : u.role === 'User'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                          {userTeams.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {userTeams.map((t) => (
                                <span
                                  key={t.id}
                                  className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                >
                                  {t.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">Tidak terkait tim</span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <span className="inline-flex items-center text-[11px] text-emerald-600 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                            Aktif
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          {isSuperAdmin ? (
                            <button
                              onClick={() => handleOpenRoleModal(u)}
                              className="px-2.5 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg font-medium transition-colors"
                            >
                              Atur Hak Akses
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400">Read-only</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* TEAMS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => {
            const adminUsers = users.filter((u) => team.adminUserIds.includes(u.id));
            const memberCount = team.memberUserIds.length;

            return (
              <div
                key={team.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-0.5 rounded font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-mono">
                      {team.code}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {memberCount} Anggota Terdaftar
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-2">
                    {team.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {team.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Admin Tim Berwenang:
                    </p>
                    {adminUsers.length > 0 ? (
                      <div className="space-y-1">
                        {adminUsers.map((adm) => (
                          <div
                            key={adm.id}
                            className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300"
                          >
                            <Shield className="w-3.5 h-3.5 text-blue-500" />
                            <span className="font-medium">{adm.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-amber-600 dark:text-amber-400 italic">
                        Belum ada Admin Tim yang ditugaskan
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Role Assignment Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Atur Hak Akses Pengguna & Admin
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Konfigurasi peran untuk <strong>{selectedUser.name}</strong> ({selectedUser.email})
              </p>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Pilih Peran (Role):
                </label>
                <div className="space-y-2">
                  {(['User', 'Admin Tim', 'Super Admin', 'Guest'] as Role[]).map((r) => (
                    <label
                      key={r}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${
                        newRole === r
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{r}</div>
                        <div className="text-[11px] text-slate-400">
                          {r === 'Super Admin' && 'Akses penuh seluruh sistem & dokumen'}
                          {r === 'Admin Tim' && 'Mengelola SOP & izin dokumen tim naungannya'}
                          {r === 'User' && 'Bertanya & membaca dokumen terindeks yang diizinkan'}
                          {r === 'Guest' && 'Hanya membaca dokumen publik'}
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="role"
                        value={r}
                        checked={newRole === r}
                        onChange={() => setNewRole(r)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Team Assignment (Crucial for Admin Tim & User) */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Unit Tim Naungan (Lingkup Akses Dokumen):
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {teams.map((t) => {
                    const isChecked = selectedTeamIds.includes(t.id);
                    return (
                      <label
                        key={t.id}
                        className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTeamIds([...selectedTeamIds, t.id]);
                            } else {
                              setSelectedTeamIds(selectedTeamIds.filter((id) => id !== t.id));
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs">{t.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Tambah Pegawai Baru
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Daftarkan akun resmi pegawai ASN ke sistem internal.
              </p>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap & Gelar
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Ilham, S.T."
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Akun Email Resmi Instansi
                </label>
                <input
                  type="email"
                  required
                  placeholder="ilham@instansi.go.id"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  NIP (Nomor Induk Pegawai)
                </label>
                <input
                  type="text"
                  placeholder="199208152019021004"
                  value={newUserNip}
                  onChange={(e) => setNewUserNip(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Peran Awal
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as Role)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200"
                >
                  <option value="User">User (Pegawai)</option>
                  <option value="Admin Tim">Admin Tim</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Unit Tim
                </label>
                <select
                  onChange={(e) => setNewUserTeamIds([e.target.value])}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200"
                >
                  <option value="">Pilih Tim...</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                >
                  Daftarkan Pegawai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Team Modal */}
      {showAddTeamModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Tambah Unit Tim Kerja Baru
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Bentuk kelompok kerja untuk isolasi dokumen dan pembagian tanggung jawab SOP.
              </p>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Unit Tim
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tim Humas & Protokoler"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kode Singkatan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: HMS"
                  value={newTeamCode}
                  onChange={(e) => setNewTeamCode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 uppercase font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi Tanggung Jawab
                </label>
                <textarea
                  rows={3}
                  placeholder="Tugas pokok dan fungsi pengelolaan SOP unit..."
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddTeamModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                >
                  Simpan Tim Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
