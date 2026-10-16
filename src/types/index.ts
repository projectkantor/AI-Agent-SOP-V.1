export type Role = 'Super Admin' | 'Admin Tim' | 'User' | 'Guest';

export type SourceType = 'Google Drive' | 'JDIH';

export type Visibility = 'Publik' | 'Terbagi' | 'Hanya Tim';

export type IndexStatus = 'Terindeks' | 'Menunggu' | 'Gagal';

export type LegalStatus = 'Berlaku' | 'Tidak Berlaku' | 'Belum Terverifikasi';

export interface User {
  id: string;
  name: string;
  email: string;
  nip?: string;
  role: Role;
  teamIds: string[];
  isActive: boolean;
  avatar?: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  description: string;
  adminUserIds: string[];
  memberUserIds: string[];
  createdAt: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  sourceUrl: string;
  changeSummary: string | null;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
}

export interface Document {
  id: string;
  title: string;
  documentNumber: string | null;
  year: number | null;
  documentType: string; // SOP, Peraturan Menteri, Keputusan Menteri, Surat Edaran, dll.
  sourceType: SourceType;
  sourceUrl: string;
  ownerTeamId: string | null;
  ownerTeamName?: string;
  visibility: Visibility;
  sharedTeamIds: string[];
  sharedUserIds: string[];
  downloadAllowed: boolean;
  indexStatus: IndexStatus;
  legalStatus: LegalStatus;
  legalStatusNote: string | null;
  baseRegulationIds: string[]; // IDs of parent regulations (e.g., JDIH laws)
  replacementDocumentId: string | null; // ID of doc that replaced this if revoked
  replacementDocumentTitle?: string | null;
  version: number;
  indexedText: string;
  tags: string[];
  lastSyncedAt: string | null;
  createdBy: string;
  createdByName?: string;
  updatedAt: string;
  clauses?: { title: string; content: string }[];
}

export interface SourceReference {
  documentId: string;
  documentTitle: string;
  documentNumber: string | null;
  year: number | null;
  section: string | null;
  quote: string | null;
  sourceType: SourceType;
  legalStatus: LegalStatus;
  sourceUrl: string;
  downloadAllowed: boolean;
}

export interface ScannedDocData {
  documentId: string;
  documentTitle: string;
  documentNumber: string | null;
  year: number | null;
  ownerTeam: string;
  sourceType: SourceType;
  legalStatus: LegalStatus;
  matchedClause: string;
  keyFacts: string[];
  extractedParagraph: string;
  followUpSuggestions: string[];
}

export interface AIConversation {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  question: string;
  answer: string;
  sourceDocumentIds: string[];
  sourceReferences: SourceReference[];
  mode: 'Ringkas' | 'Rinci';
  scope: string; // 'Semua sumber' | 'SOP (Drive)' | 'Regulasi (JDIH)' | docId
  createdAt: string;
  feedback?: 'Membantu' | 'Tidak membantu' | 'Laporan kekeliruan' | null;
  feedbackNote?: string | null;
}

export interface FeedbackItem {
  id: string;
  conversationId: string;
  documentId: string | null;
  documentTitle?: string | null;
  userId: string;
  userName: string;
  type: 'Membantu' | 'Tidak membantu' | 'Laporan kekeliruan';
  note: string | null;
  questionSnippet: string;
  answerSnippet: string;
  reviewStatus: 'Baru' | 'Ditinjau' | 'Ditindaklanjuti';
  adminNotes?: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  resourceType: 'Document' | 'User' | 'Team' | 'JDIHSync' | 'Security';
  resourceId: string | null;
  resourceTitle?: string;
  teamId: string | null;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface JDIHSyncLog {
  id: string;
  startedAt: string;
  finishedAt: string | null;
  status: 'Berhasil' | 'Gagal' | 'Parsial';
  recordsProcessed: number;
  newRegulationsCount: number;
  updatedCount: number;
  errorMessage: string | null;
}
