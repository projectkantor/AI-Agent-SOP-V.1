import React from 'react';
import {
  MessageSquare,
  BookOpen,
  LayoutDashboard,
  ThumbsUp,
  Users,
  Settings,
  ShieldAlert,
  Lock,
  Building,
  Info,
  ExternalLink,
} from 'lucide-react';
import { User, Role } from '../types';

export type NavTab =
  | 'agent'
  | 'knowledge_base'
  | 'dashboard'
  | 'feedback'
  | 'users_teams'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentUser: User;
  onOpenJDIH: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenJDIH,
  onCloseMobile,
}) => {
  const isAdmin = currentUser.role === 'Super Admin' || currentUser.role === 'Admin Tim';

  const navItems = [
    {
      id: 'agent' as NavTab,
      label: 'Tanya Agent',
      icon: MessageSquare,
      description: 'Konsultasi SOP & regulasi AI',
      allowed: true,
      badge: null,
    },
    {
      id: 'knowledge_base' as NavTab,
      label: 'Knowledge Base',
      icon: BookOpen,
      description: 'Pangkalan SOP & JDIH',
      allowed: true,
      badge: null,
    },
    {
      id: 'dashboard' as NavTab,
      label: 'Dasbor Pembaruan',
      icon: LayoutDashboard,
      description: 'SOP terdampak & regulasi',
      allowed: isAdmin,
      badge: 'Admin',
    },
    {
      id: 'feedback' as NavTab,
      label: 'Umpan Balik & Evaluasi',
      icon: ThumbsUp,
      description: 'Laporan kekeliruan jawaban',
      allowed: isAdmin,
      badge: 'Admin',
    },
    {
      id: 'users_teams' as NavTab,
      label: 'Tim dan Pengguna',
      icon: Users,
      description: 'Struktur tim & hak akses',
      allowed: isAdmin,
      badge: 'Admin',
    },
    {
      id: 'settings' as NavTab,
      label: 'Pengaturan Sistem',
      icon: Settings,
      description: 'Sinkronisasi JDIH & RBAC',
      allowed: isAdmin,
      badge: 'Admin',
    },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)]">
      {/* Navigation list */}
      <div className="p-4 space-y-6 overflow-y-auto">
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Menu Utama
          </p>
          <nav className="space-y-1">
            {navItems
              .filter((item) => item.allowed)
              .map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && !isActive && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
          </nav>
        </div>

        {/* Guest info card if Guest */}
        {currentUser.role === 'Guest' && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs">
            <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300 font-semibold mb-1">
              <Info className="w-4 h-4 shrink-0" />
              <span>Akses Tamu Publik</span>
            </div>
            <p className="text-amber-700 dark:text-amber-400/90 leading-relaxed text-[11px]">
              Anda sedang mengakses sebagai Tamu. Hanya dokumen SOP & regulasi publik yang dapat dicari. Untuk mengunggah SOP atau mengelola tim, login sebagai Admin.
            </p>
          </div>
        )}

        {/* Quick link to JDIH */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Sinkronisasi JDIH</span>
            </span>
            <span className="text-[10px] text-slate-400">Aktif</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
            Basis data peraturan resmi Komdigi disinkronkan otomatis.
          </p>
          <button
            onClick={onOpenJDIH}
            className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
          >
            <span>Periksa Portal JDIH</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* User Session Bar */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center space-x-3">
          <img
            src={
              currentUser.avatar ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
            }
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              {currentUser.name}
            </p>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium truncate">
              {currentUser.role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
