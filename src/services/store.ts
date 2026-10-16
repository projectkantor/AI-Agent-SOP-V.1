import {
  User,
  Team,
  Document,
  DocumentVersion,
  FeedbackItem,
  AuditLog,
  JDIHSyncLog,
  Role,
  Visibility,
  LegalStatus,
  IndexStatus,
} from '../types';
import {
  INITIAL_DOCUMENTS,
  INITIAL_FEEDBACKS,
  INITIAL_TEAMS,
  INITIAL_USERS,
  INITIAL_VERSIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SYNC_LOGS,
} from '../data/initialData';

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'aisop_current_user_id',
  DOCUMENTS: 'aisop_documents',
  TEAMS: 'aisop_teams',
  USERS: 'aisop_users',
  VERSIONS: 'aisop_versions',
  FEEDBACKS: 'aisop_feedbacks',
  AUDIT_LOGS: 'aisop_audit_logs',
  SYNC_LOGS: 'aisop_sync_logs',
  DARK_MODE: 'aisop_dark_mode',
};

class AppStore {
  private users: User[] = [];
  private teams: Team[] = [];
  private documents: Document[] = [];
  private versions: DocumentVersion[] = [];
  private feedbacks: FeedbackItem[] = [];
  private auditLogs: AuditLog[] = [];
  private syncLogs: JDIHSyncLog[] = [];
  private currentUserId: string = 'user-guest';
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      this.users = storedUsers ? JSON.parse(storedUsers) : [...INITIAL_USERS];

      const storedTeams = localStorage.getItem(STORAGE_KEYS.TEAMS);
      this.teams = storedTeams ? JSON.parse(storedTeams) : [...INITIAL_TEAMS];

      const storedDocs = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (storedDocs) {
        const parsed: Document[] = JSON.parse(storedDocs);
        const missingInitials = INITIAL_DOCUMENTS.filter(
          (initDoc) => !parsed.some((p) => p.id === initDoc.id)
        );
        this.documents = [...parsed, ...missingInitials];
      } else {
        this.documents = [...INITIAL_DOCUMENTS];
      }

      const storedVersions = localStorage.getItem(STORAGE_KEYS.VERSIONS);
      this.versions = storedVersions ? JSON.parse(storedVersions) : [...INITIAL_VERSIONS];

      const storedFeedbacks = localStorage.getItem(STORAGE_KEYS.FEEDBACKS);
      this.feedbacks = storedFeedbacks ? JSON.parse(storedFeedbacks) : [...INITIAL_FEEDBACKS];

      const storedAudit = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      this.auditLogs = storedAudit ? JSON.parse(storedAudit) : [...INITIAL_AUDIT_LOGS];

      const storedSync = localStorage.getItem(STORAGE_KEYS.SYNC_LOGS);
      this.syncLogs = storedSync ? JSON.parse(storedSync) : [...INITIAL_SYNC_LOGS];

      const savedUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      if (savedUserId && this.users.some((u) => u.id === savedUserId)) {
        this.currentUserId = savedUserId;
      } else {
        this.currentUserId = 'user-guest'; // Default to Guest
      }
    } catch (err) {
      console.warn('Failed to load from localStorage, using initial dataset', err);
      this.users = [...INITIAL_USERS];
      this.teams = [...INITIAL_TEAMS];
      this.documents = [...INITIAL_DOCUMENTS];
      this.versions = [...INITIAL_VERSIONS];
      this.feedbacks = [...INITIAL_FEEDBACKS];
      this.auditLogs = [...INITIAL_AUDIT_LOGS];
      this.syncLogs = [...INITIAL_SYNC_LOGS];
      this.currentUserId = 'user-guest';
    }
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(this.teams));
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(this.documents));
      localStorage.setItem(STORAGE_KEYS.VERSIONS, JSON.stringify(this.versions));
      localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(this.feedbacks));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
      localStorage.setItem(STORAGE_KEYS.SYNC_LOGS, JSON.stringify(this.syncLogs));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, this.currentUserId);
    } catch (err) {
      console.warn('Storage save error:', err);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // Current User management
  public getCurrentUser(): User {
    const user = this.users.find((u) => u.id === this.currentUserId);
    if (!user) {
      return this.users[0] || INITIAL_USERS[0];
    }
    return user;
  }

  public setCurrentUser(userId: string) {
    if (this.users.some((u) => u.id === userId)) {
      this.currentUserId = userId;
      this.logAudit({
        actorUserId: userId,
        actorName: this.getCurrentUser().name,
        actorRole: this.getCurrentUser().role,
        action: 'SWITCH_USER_SESSION',
        resourceType: 'User',
        resourceId: userId,
        teamId: null,
        metadata: { switchedTo: userId },
      });
      this.saveState();
    }
  }

  // Strict RBAC permission evaluators
  public canAccessDocument(user: User, doc: Document): boolean {
    if (user.role === 'Super Admin') return true;
    if (doc.visibility === 'Publik') return true;

    // Guest cannot see internal docs
    if (user.role === 'Guest') return false;

    // 'Hanya Tim': user must belong to ownerTeamId
    if (doc.visibility === 'Hanya Tim') {
      return !!doc.ownerTeamId && user.teamIds.includes(doc.ownerTeamId);
    }

    // 'Terbagi': user belongs to ownerTeamId OR sharedTeamIds OR sharedUserIds
    if (doc.visibility === 'Terbagi') {
      const inOwnerTeam = !!doc.ownerTeamId && user.teamIds.includes(doc.ownerTeamId);
      const inSharedTeam = doc.sharedTeamIds.some((tid) => user.teamIds.includes(tid));
      const inSharedUser = doc.sharedUserIds.includes(user.id);
      return inOwnerTeam || inSharedTeam || inSharedUser;
    }

    return false;
  }

  public canDownloadDocument(user: User, doc: Document): boolean {
    if (!this.canAccessDocument(user, doc)) return false;
    if (user.role === 'Super Admin') return true;
    return !!doc.downloadAllowed;
  }

  public canUploadDocument(user: User): boolean {
    return user.role === 'Super Admin' || user.role === 'Admin Tim';
  }

  public canEditDocument(user: User, doc: Document): boolean {
    if (user.role === 'Super Admin') return true;
    if (user.role === 'Admin Tim') {
      return !!doc.ownerTeamId && user.teamIds.includes(doc.ownerTeamId);
    }
    return false;
  }

  // Document Operations
  public getPermittedDocuments(user?: User): Document[] {
    const activeUser = user || this.getCurrentUser();
    return this.documents.filter((doc) => this.canAccessDocument(activeUser, doc));
  }

  public getDocumentById(id: string, user?: User): Document | null {
    const activeUser = user || this.getCurrentUser();
    const doc = this.documents.find((d) => d.id === id);
    if (!doc) return null;
    if (!this.canAccessDocument(activeUser, doc)) return null;
    return doc;
  }

  public addDocument(
    data: {
      title: string;
      documentNumber: string | null;
      year: number | null;
      documentType: string;
      sourceUrl: string;
      ownerTeamId: string | null;
      visibility: Visibility;
      sharedTeamIds: string[];
      downloadAllowed: boolean;
      baseRegulationIds: string[];
      tags: string[];
      indexedText: string;
      clauses?: { title: string; content: string }[];
    },
    user?: User
  ): Document {
    const activeUser = user || this.getCurrentUser();
    if (!this.canUploadDocument(activeUser)) {
      throw new Error('Hanya Super Admin dan Admin Tim yang dapat mengunggah SOP / dokumen.');
    }

    // Force team ownership if Admin Tim
    let assignedTeamId = data.ownerTeamId;
    if (activeUser.role === 'Admin Tim') {
      assignedTeamId = activeUser.teamIds[0] || null;
    }

    const team = this.teams.find((t) => t.id === assignedTeamId);
    const newDocId = `doc-${Date.now()}`;
    const newDoc: Document = {
      id: newDocId,
      title: data.title,
      documentNumber: data.documentNumber,
      year: data.year,
      documentType: data.documentType,
      sourceType: 'Google Drive',
      sourceUrl: data.sourceUrl,
      ownerTeamId: assignedTeamId,
      ownerTeamName: team ? team.name : undefined,
      visibility: data.visibility,
      sharedTeamIds: data.sharedTeamIds || [],
      sharedUserIds: [],
      downloadAllowed: data.downloadAllowed,
      indexStatus: 'Terindeks',
      legalStatus: 'Berlaku',
      legalStatusNote: 'Dokumen SOP diverifikasi oleh Admin Tim dan terindeks.',
      baseRegulationIds: data.baseRegulationIds || [],
      replacementDocumentId: null,
      version: 1,
      indexedText: data.indexedText,
      tags: data.tags || [],
      lastSyncedAt: new Date().toISOString(),
      createdBy: activeUser.id,
      createdByName: activeUser.name,
      updatedAt: new Date().toISOString(),
      clauses: data.clauses || [
        { title: 'Ketentuan Umum', content: data.indexedText.slice(0, 180) + '...' },
      ],
    };

    this.documents.unshift(newDoc);

    // Record version
    const versionRecord: DocumentVersion = {
      id: `ver-${Date.now()}`,
      documentId: newDocId,
      version: 1,
      sourceUrl: data.sourceUrl,
      changeSummary: 'Unggah awal dokumen SOP dari tautan Google Drive.',
      createdBy: activeUser.id,
      createdByName: activeUser.name,
      createdAt: new Date().toISOString(),
    };
    this.versions.unshift(versionRecord);

    // Audit log
    this.logAudit({
      actorUserId: activeUser.id,
      actorName: activeUser.name,
      actorRole: activeUser.role,
      action: 'ADD_DRIVE_DOCUMENT',
      resourceType: 'Document',
      resourceId: newDocId,
      resourceTitle: newDoc.title,
      teamId: assignedTeamId,
      metadata: { visibility: data.visibility, downloadAllowed: data.downloadAllowed },
    });

    this.saveState();
    return newDoc;
  }

  public batchAddDocuments(
    folderUrl: string,
    docs: Array<{
      title: string;
      documentNumber: string | null;
      year: number | null;
      documentType: string;
      sourceUrl: string;
      ownerTeamId: string | null;
      tags: string[];
      indexedText: string;
    }>,
    user?: User
  ): Document[] {
    const activeUser = user || this.getCurrentUser();
    if (!this.canUploadDocument(activeUser)) {
      throw new Error('Hanya Super Admin dan Admin Tim yang dapat melakukan batch upload dokumen.');
    }

    const createdDocs: Document[] = [];

    docs.forEach((item, index) => {
      let assignedTeamId = item.ownerTeamId;
      if (activeUser.role === 'Admin Tim') {
        assignedTeamId = activeUser.teamIds[0] || null;
      }

      const team = this.teams.find((t) => t.id === assignedTeamId);
      const newDocId = `doc-batch-${Date.now()}-${index}`;

      const newDoc: Document = {
        id: newDocId,
        title: item.title,
        documentNumber: item.documentNumber,
        year: item.year || new Date().getFullYear(),
        documentType: item.documentType || 'SOP',
        sourceType: 'Google Drive',
        sourceUrl: item.sourceUrl || `${folderUrl}#file-${index}`,
        ownerTeamId: assignedTeamId,
        ownerTeamName: team ? team.name : undefined,
        visibility: 'Publik', // Default Publik per user instruction
        sharedTeamIds: [],
        sharedUserIds: [],
        downloadAllowed: true,
        indexStatus: 'Terindeks',
        legalStatus: 'Berlaku',
        legalStatusNote: 'Dokumen diimpor massal dari Google Drive Folder dan terindeks otomatis.',
        baseRegulationIds: [],
        replacementDocumentId: null,
        version: 1,
        indexedText: item.indexedText,
        tags: item.tags || ['batch-upload', 'google-drive'],
        lastSyncedAt: new Date().toISOString(),
        createdBy: activeUser.id,
        createdByName: activeUser.name,
        updatedAt: new Date().toISOString(),
        clauses: [
          { title: 'Intisari Prosedur', content: item.indexedText.slice(0, 180) + '...' },
        ],
      };

      this.documents.unshift(newDoc);
      createdDocs.push(newDoc);

      this.versions.unshift({
        id: `ver-batch-${Date.now()}-${index}`,
        documentId: newDocId,
        version: 1,
        sourceUrl: newDoc.sourceUrl,
        changeSummary: `Impor massal dari Google Drive Folder: ${folderUrl}`,
        createdBy: activeUser.id,
        createdByName: activeUser.name,
        createdAt: new Date().toISOString(),
      });
    });

    this.logAudit({
      actorUserId: activeUser.id,
      actorName: activeUser.name,
      actorRole: activeUser.role,
      action: 'BATCH_UPLOAD_DRIVE_FOLDER',
      resourceType: 'Document',
      resourceId: null,
      resourceTitle: `Batch Upload (${docs.length} dokumen dari Drive Folder)`,
      teamId: createdDocs[0]?.ownerTeamId || null,
      metadata: { folderUrl, count: docs.length, defaultVisibility: 'Publik' },
    });

    this.saveState();
    return createdDocs;
  }

  public updateDocument(
    id: string,
    updates: Partial<Document> & { changeSummary?: string },
    user?: User
  ): Document {
    const activeUser = user || this.getCurrentUser();
    const docIndex = this.documents.findIndex((d) => d.id === id);
    if (docIndex === -1) throw new Error('Dokumen tidak ditemukan.');

    const currentDoc = this.documents[docIndex];
    if (!this.canEditDocument(activeUser, currentDoc)) {
      throw new Error('Anda tidak memiliki hak untuk mengedit dokumen ini.');
    }

    const newVersion = (currentDoc.version || 1) + 1;
    const updatedDoc: Document = {
      ...currentDoc,
      ...updates,
      version: newVersion,
      updatedAt: new Date().toISOString(),
    };

    this.documents[docIndex] = updatedDoc;

    if (updates.sourceUrl || updates.changeSummary) {
      this.versions.unshift({
        id: `ver-${Date.now()}`,
        documentId: id,
        version: newVersion,
        sourceUrl: updates.sourceUrl || currentDoc.sourceUrl,
        changeSummary: updates.changeSummary || 'Pembaruan metadata dan isi dokumen SOP.',
        createdBy: activeUser.id,
        createdByName: activeUser.name,
        createdAt: new Date().toISOString(),
      });
    }

    this.logAudit({
      actorUserId: activeUser.id,
      actorName: activeUser.name,
      actorRole: activeUser.role,
      action: 'UPDATE_DOCUMENT',
      resourceType: 'Document',
      resourceId: id,
      resourceTitle: updatedDoc.title,
      teamId: updatedDoc.ownerTeamId,
      metadata: { newVersion, changeSummary: updates.changeSummary },
    });

    this.saveState();
    return updatedDoc;
  }

  public deleteDocument(id: string, user?: User) {
    const activeUser = user || this.getCurrentUser();
    const doc = this.documents.find((d) => d.id === id);
    if (!doc) throw new Error('Dokumen tidak ditemukan.');

    if (!this.canEditDocument(activeUser, doc)) {
      throw new Error('Anda tidak berwenang menghapus dokumen ini.');
    }

    this.documents = this.documents.filter((d) => d.id !== id);
    this.logAudit({
      actorUserId: activeUser.id,
      actorName: activeUser.name,
      actorRole: activeUser.role,
      action: 'DELETE_DOCUMENT',
      resourceType: 'Document',
      resourceId: id,
      resourceTitle: doc.title,
      teamId: doc.ownerTeamId,
      metadata: { deletedBy: activeUser.name },
    });

    this.saveState();
  }

  public getDocumentVersions(documentId: string): DocumentVersion[] {
    return this.versions.filter((v) => v.documentId === documentId);
  }

  // Teams & Users Management
  public getTeams(): Team[] {
    return this.teams;
  }

  public getUsers(): User[] {
    return this.users;
  }

  public assignUserRole(
    userId: string,
    role: Role,
    teamIds: string[],
    user?: User
  ) {
    const activeUser = user || this.getCurrentUser();
    if (activeUser.role !== 'Super Admin') {
      throw new Error('Hanya Super Admin yang dapat mengubah peran dan akses admin pengguna.');
    }

    const uIndex = this.users.findIndex((u) => u.id === userId);
    if (uIndex === -1) throw new Error('Pengguna tidak ditemukan.');

    const targetUser = this.users[uIndex];
    const oldRole = targetUser.role;

    this.users[uIndex] = {
      ...targetUser,
      role,
      teamIds,
    };

    // Update team admin mapping
    this.teams = this.teams.map((t) => {
      let admins = t.adminUserIds.filter((id) => id !== userId);
      let members = t.memberUserIds.filter((id) => id !== userId);

      if (teamIds.includes(t.id)) {
        members.push(userId);
        if (role === 'Admin Tim' || role === 'Super Admin') {
          admins.push(userId);
        }
      }

      return {
        ...t,
        adminUserIds: Array.from(new Set(admins)),
        memberUserIds: Array.from(new Set(members)),
      };
    });

    this.logAudit({
      actorUserId: activeUser.id,
      actorName: activeUser.name,
      actorRole: activeUser.role,
      action: 'UPDATE_USER_ROLE_AND_ACCESS',
      resourceType: 'User',
      resourceId: userId,
      resourceTitle: targetUser.name,
      teamId: teamIds[0] || null,
      metadata: { oldRole, newRole: role, assignedTeams: teamIds },
    });

    this.saveState();
  }

  public addTeam(name: string, code: string, description: string): Team {
    const activeUser = this.getCurrentUser();
    if (activeUser.role !== 'Super Admin') {
      throw new Error('Hanya Super Admin yang dapat menambahkan unit tim baru.');
    }

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name,
      code: code.toUpperCase(),
      description,
      adminUserIds: [],
      memberUserIds: [],
      createdAt: new Date().toISOString(),
    };

    this.teams.push(newTeam);
    this.logAudit({
      actorUserId: activeUser.id,
      actorName: activeUser.name,
      actorRole: activeUser.role,
      action: 'CREATE_TEAM',
      resourceType: 'Team',
      resourceId: newTeam.id,
      resourceTitle: newTeam.name,
      teamId: newTeam.id,
      metadata: { code },
    });

    this.saveState();
    return newTeam;
  }

  public addUser(name: string, email: string, nip: string, role: Role, teamIds: string[]): User {
    const activeUser = this.getCurrentUser();
    if (activeUser.role !== 'Super Admin' && activeUser.role !== 'Admin Tim') {
      throw new Error('Tidak memiliki izin menambah pengguna.');
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      nip,
      role,
      teamIds,
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    this.users.push(newUser);

    // add to teams
    this.teams = this.teams.map((t) => {
      if (teamIds.includes(t.id)) {
        const members = Array.from(new Set([...t.memberUserIds, newUser.id]));
        const admins = role === 'Admin Tim' || role === 'Super Admin'
          ? Array.from(new Set([...t.adminUserIds, newUser.id]))
          : t.adminUserIds;
        return { ...t, memberUserIds: members, adminUserIds: admins };
      }
      return t;
    });

    this.logAudit({
      actorUserId: activeUser.id,
      actorName: activeUser.name,
      actorRole: activeUser.role,
      action: 'CREATE_USER',
      resourceType: 'User',
      resourceId: newUser.id,
      resourceTitle: newUser.name,
      teamId: teamIds[0] || null,
      metadata: { role, email, nip },
    });

    this.saveState();
    return newUser;
  }

  // Feedback Management
  public getFeedbacks(user?: User): FeedbackItem[] {
    const activeUser = user || this.getCurrentUser();
    if (activeUser.role === 'Super Admin') return this.feedbacks;
    if (activeUser.role === 'Admin Tim') {
      // Show feedback for documents owned by activeUser's teams
      const myTeamDocIds = new Set(
        this.documents
          .filter((d) => d.ownerTeamId && activeUser.teamIds.includes(d.ownerTeamId))
          .map((d) => d.id)
      );
      return this.feedbacks.filter((f) => !f.documentId || myTeamDocIds.has(f.documentId));
    }
    // Guest & User only see their own feedback
    return this.feedbacks.filter((f) => f.userId === activeUser.id);
  }

  public submitFeedback(data: {
    conversationId: string;
    documentId: string | null;
    documentTitle?: string | null;
    type: 'Membantu' | 'Tidak membantu' | 'Laporan kekeliruan';
    note: string | null;
    questionSnippet: string;
    answerSnippet: string;
  }): FeedbackItem {
    const activeUser = this.getCurrentUser();
    const item: FeedbackItem = {
      id: `fb-${Date.now()}`,
      conversationId: data.conversationId,
      documentId: data.documentId,
      documentTitle: data.documentTitle,
      userId: activeUser.id,
      userName: activeUser.name,
      type: data.type,
      note: data.note,
      questionSnippet: data.questionSnippet,
      answerSnippet: data.answerSnippet,
      reviewStatus: 'Baru',
      adminNotes: null,
      createdAt: new Date().toISOString(),
    };

    this.feedbacks.unshift(item);
    this.saveState();
    return item;
  }

  public updateFeedbackReview(id: string, status: 'Baru' | 'Ditinjau' | 'Ditindaklanjuti', adminNotes?: string) {
    const activeUser = this.getCurrentUser();
    if (activeUser.role !== 'Super Admin' && activeUser.role !== 'Admin Tim') {
      throw new Error('Hanya Admin yang dapat meninjau umpan balik.');
    }

    const idx = this.feedbacks.findIndex((f) => f.id === id);
    if (idx !== -1) {
      this.feedbacks[idx] = {
        ...this.feedbacks[idx],
        reviewStatus: status,
        adminNotes: adminNotes ?? this.feedbacks[idx].adminNotes,
      };
      this.saveState();
    }
  }

  // Audit Logs
  public getAuditLogs(user?: User): AuditLog[] {
    const activeUser = user || this.getCurrentUser();
    if (activeUser.role === 'Super Admin') return this.auditLogs;
    if (activeUser.role === 'Admin Tim') {
      return this.auditLogs.filter(
        (log) => !log.teamId || activeUser.teamIds.includes(log.teamId)
      );
    }
    return [];
  }

  public logAudit(entry: Omit<AuditLog, 'id' | 'createdAt'>) {
    const log: AuditLog = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    // keep up to 250 logs
    if (this.auditLogs.length > 250) {
      this.auditLogs = this.auditLogs.slice(0, 250);
    }
  }

  // JDIH Sync Logs & Simulation
  public getJDIHSyncLogs(): JDIHSyncLog[] {
    return this.syncLogs;
  }

  public triggerJDIHSync(): Promise<JDIHSyncLog> {
    return new Promise((resolve) => {
      const activeUser = this.getCurrentUser();
      const startTime = new Date().toISOString();

      setTimeout(() => {
        // Update document statuses (e.g. SE.05/SJ/2023 gets verified)
        this.documents = this.documents.map((d) => {
          if (d.sourceType === 'JDIH') {
            return {
              ...d,
              legalStatus: d.legalStatus === 'Tidak Berlaku' ? 'Tidak Berlaku' : 'Berlaku',
              legalStatusNote:
                d.legalStatus === 'Tidak Berlaku'
                  ? 'Tetap Tidak Berlaku - Digantikan oleh Permenkomdigi 3/2024.'
                  : 'Terverifikasi aktif resmi melalui sinkronisasi API JDIH Komdigi.',
              lastSyncedAt: new Date().toISOString(),
            };
          }
          return d;
        });

        const syncLog: JDIHSyncLog = {
          id: `sync-log-${Date.now()}`,
          startedAt: startTime,
          finishedAt: new Date().toISOString(),
          status: 'Berhasil',
          recordsProcessed: 45,
          newRegulationsCount: 0,
          updatedCount: 3,
          errorMessage: null,
        };

        this.syncLogs.unshift(syncLog);

        this.logAudit({
          actorUserId: activeUser.id,
          actorName: activeUser.name,
          actorRole: activeUser.role,
          action: 'MANUAL_JDIH_SYNC',
          resourceType: 'JDIHSync',
          resourceId: syncLog.id,
          resourceTitle: 'Sinkronisasi Manual JDIH Komdigi',
          teamId: null,
          metadata: { processed: 45, updated: 3 },
        });

        this.saveState();
        resolve(syncLog);
      }, 1200);
    });
  }

  public resetToFactoryDefaults() {
    this.users = [...INITIAL_USERS];
    this.teams = [...INITIAL_TEAMS];
    this.documents = [...INITIAL_DOCUMENTS];
    this.versions = [...INITIAL_VERSIONS];
    this.feedbacks = [...INITIAL_FEEDBACKS];
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    this.syncLogs = [...INITIAL_SYNC_LOGS];
    this.currentUserId = 'user-guest';
    this.saveState();
  }
}

export const store = new AppStore();
