/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Document } from './types';
import { store } from './services/store';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { AgentView } from './views/AgentView';
import { KnowledgeBaseView } from './views/KnowledgeBaseView';
import { DashboardView } from './views/DashboardView';
import { FeedbackView } from './views/FeedbackView';
import { UsersTeamsView } from './views/UsersTeamsView';
import { SettingsView } from './views/SettingsView';
import { DocumentDetailModal } from './components/DocumentDetailModal';
import { AddDocumentModal } from './components/AddDocumentModal';
import { JDIHModal } from './components/JDIHModal';
import { ReportFeedbackModal } from './components/ReportFeedbackModal';
import { CheckCircle2, Shield, AlertTriangle } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(store.getCurrentUser());
  const [currentTab, setCurrentTab] = useState<NavTab>('agent');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('aisop_dark_mode') === 'true';
  });

  // Modals & Pinned state
  const [selectedDocForDetail, setSelectedDocForDetail] = useState<Document | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showJDIHModal, setShowJDIHModal] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [pinnedDocId, setPinnedDocId] = useState<string | null>(null);

  // Reporting modal state
  const [reportModalData, setReportModalData] = useState<{
    isOpen: boolean;
    conversationId: string;
    documentId: string | null;
    questionSnippet: string;
    answerSnippet: string;
  }>({
    isOpen: false,
    conversationId: '',
    documentId: null,
    questionSnippet: '',
    answerSnippet: '',
  });

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize store updates
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setCurrentUser(store.getCurrentUser());
    });
    return () => unsubscribe();
  }, []);

  // Synchronize Dark Mode on HTML tag
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('aisop_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('aisop_dark_mode', 'false');
    }
  }, [darkMode]);

  // If role changes to Guest or User while on an admin-only tab, auto-switch to agent
  useEffect(() => {
    const isAdmin = currentUser.role === 'Super Admin' || currentUser.role === 'Admin Tim';
    if (!isAdmin && ['dashboard', 'feedback', 'users_teams', 'settings'].includes(currentTab)) {
      setCurrentTab('agent');
    }
  }, [currentUser, currentTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRoleChange = (userId: string) => {
    store.setCurrentUser(userId);
    const updated = store.getCurrentUser();
    showToast(`Beralih simulasi peran: ${updated.name} (${updated.role})`);
  };

  const handleAskDocument = (docId: string) => {
    setPinnedDocId(docId);
    setCurrentTab('agent');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-slate-900/90 dark:bg-slate-100/90 text-white dark:text-slate-900 text-xs font-semibold shadow-xl backdrop-blur-xs transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenJDIH={() => setShowJDIHModal(true)}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* App Body Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            currentUser={currentUser}
            onOpenJDIH={() => setShowJDIHModal(true)}
          />
        </div>

        {/* Mobile Slide-in Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden bg-slate-900/60 backdrop-blur-xs flex">
            <div className="w-72 bg-white dark:bg-slate-900 h-full shadow-2xl">
              <Sidebar
                currentTab={currentTab}
                onSelectTab={setCurrentTab}
                currentUser={currentUser}
                onOpenJDIH={() => {
                  setShowJDIHModal(true);
                  setMobileMenuOpen(false);
                }}
                onCloseMobile={() => setMobileMenuOpen(false)}
              />
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Content View Container */}
        <main className="flex-1 overflow-y-auto">
          {currentTab === 'agent' && (
            <AgentView
              currentUser={currentUser}
              onOpenJDIH={() => setShowJDIHModal(true)}
              onViewDocument={(docId) => {
                const doc = store.getDocumentById(docId, currentUser);
                if (doc) setSelectedDocForDetail(doc);
              }}
              onOpenReportModal={(convId, docId, q, a) => {
                setReportModalData({
                  isOpen: true,
                  conversationId: convId,
                  documentId: docId,
                  questionSnippet: q,
                  answerSnippet: a,
                });
              }}
              initialPinnedDocId={pinnedDocId}
              onClearPinnedDoc={() => setPinnedDocId(null)}
            />
          )}

          {currentTab === 'knowledge_base' && (
            <KnowledgeBaseView
              currentUser={currentUser}
              onOpenAddModal={() => setShowAddModal(true)}
              onViewDetail={(doc) => setSelectedDocForDetail(doc)}
              onAskDoc={handleAskDocument}
            />
          )}

          {currentTab === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              onViewDoc={(doc) => setSelectedDocForDetail(doc)}
              onAskDoc={handleAskDocument}
              onOpenJDIH={() => setShowJDIHModal(true)}
            />
          )}

          {currentTab === 'feedback' && <FeedbackView currentUser={currentUser} />}

          {currentTab === 'users_teams' && <UsersTeamsView currentUser={currentUser} />}

          {currentTab === 'settings' && (
            <SettingsView
              currentUser={currentUser}
              onOpenJDIH={() => setShowJDIHModal(true)}
            />
          )}
        </main>
      </div>

      {/* Detail Document Modal */}
      <DocumentDetailModal
        document={selectedDocForDetail}
        currentUser={currentUser}
        onClose={() => setSelectedDocForDetail(null)}
        onAskDoc={handleAskDocument}
      />

      {/* Add Document (Google Drive Link) Modal */}
      {showAddModal && (
        <AddDocumentModal
          currentUser={currentUser}
          onClose={() => setShowAddModal(false)}
          onSuccess={(title) => showToast(`Dokumen "${title}" berhasil ditambahkan & diindeks!`)}
        />
      )}

      {/* JDIH Fallback & Search Modal */}
      <JDIHModal isOpen={showJDIHModal} onClose={() => setShowJDIHModal(false)} />

      {/* Report Inaccurate Answer Modal */}
      <ReportFeedbackModal
        isOpen={reportModalData.isOpen}
        onClose={() =>
          setReportModalData((prev) => ({ ...prev, isOpen: false }))
        }
        conversationId={reportModalData.conversationId}
        documentId={reportModalData.documentId}
        questionSnippet={reportModalData.questionSnippet}
        answerSnippet={reportModalData.answerSnippet}
      />
    </div>
  );
}
