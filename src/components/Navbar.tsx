import React, { useState } from 'react';
import {
  Shield,
  FileCheck2,
  RefreshCw,
  Moon,
  Sun,
  UserCheck,
  ChevronDown,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { User, Role } from '../types';
import { store } from '../services/store';

interface NavbarProps {
  currentUser: User;
  onRoleChange: (userId: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenJDIH: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onRoleChange,
  darkMode,
  onToggleDarkMode,
  onOpenJDIH,
  mobileMenuOpen,
  onToggleMobileMenu,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const users = store.getUsers();

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Admin Tim':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'User':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Guest':
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Emblem */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                    AI Agent SOP & Regulasi
                  </span>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                    PORTAL RESMI
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                  Pangkalan Data SOP Kedinasan & Regulasi Terverifikasi JDIH
                </p>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* JDIH Sync Status Indicator */}
            <button
              onClick={onOpenJDIH}
              title="Periksa Status JDIH Komdigi"
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium">JDIH Komdigi</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={darkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Quick Role Switcher Simulation */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left"
              >
                <img
                  src={
                    currentUser.avatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
                  }
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-600"
                />
                <div className="hidden md:block max-w-[140px]">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {currentUser.role}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Simulasi Pengguna & Hak Akses
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Pilih peran untuk menguji isolasi hak akses (RBAC):
                    </p>
                  </div>

                  <div className="py-1 max-h-72 overflow-y-auto">
                    {users.map((u) => {
                      const isCurrent = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            onRoleChange(u.id);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 flex items-start space-x-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                            isCurrent ? 'bg-blue-50/70 dark:bg-blue-950/30' : ''
                          }`}
                        >
                          <img
                            src={
                              u.avatar ||
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
                            }
                            alt={u.name}
                            className="w-7 h-7 rounded-full object-cover mt-0.5 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                                {u.name}
                              </p>
                              {isCurrent && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 ml-1" />
                              )}
                            </div>
                            <div className="flex items-center space-x-1.5 mt-0.5">
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${getRoleBadgeColor(
                                  u.role
                                )}`}
                              >
                                {u.role}
                              </span>
                              {u.nip && (
                                <span className="text-[10px] text-slate-400 truncate">
                                  NIP: {u.nip.slice(-6)}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="px-3 pt-2 pb-1 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                    💡 <span className="italic">Guest = Akses publik saja; Super Admin = Akses penuh.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
