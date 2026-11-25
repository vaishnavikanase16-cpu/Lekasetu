export type LanguageMode = 'Kannada' | 'English' | 'Automatic';
export type DocumentLanguage = 'Kannada' | 'English' | 'Bilingual (KN + EN)';
export type VerificationStatus = 'Verified' | 'Pending Review' | 'Low Confidence' | 'Processing';
export type ConfidenceBand = 'High' | 'Medium' | 'Low';
export type BackendMode = 'demo' | 'fastapi';

export interface ExtractedField {
  key: string;
  label: string;
  labelKn?: string;
  value: string;
  confidence: number; // 0 to 100
  isCore?: boolean;
  required?: boolean;
  ocrNote?: string;
  lastEditedBy?: string;
}

export interface DocumentRecord {
  id: string;
  applicationNumber: string;
  title: string;
  departmentId: string;
  departmentName: string;
  formType: string;
  language: DocumentLanguage;
  detectedScripts: string[];
  applicantName: string;
  fatherName: string;
  address: string;
  village: string;
  district: string;
  formDate: string;
  uploadedAt: string;
  processedAt: string;
  fileName: string;
  fileType: 'image/jpeg' | 'image/png' | 'application/pdf';
  imageUrl: string;
  status: VerificationStatus;
  overallConfidence: number;
  confidenceBand: ConfidenceBand;
  syncedToCentral: boolean;
  processingMode: 'Demo Simulation' | 'FastAPI OCR Engine';
  assignedOfficer: string;
  fields: ExtractedField[];
}

export interface Department {
  id: string;
  name: string;
  nameKn: string;
  shortCode: string;
  iconName: string;
  description: string;
  formCategories: string[];
  totalProcessed: number;
  avgConfidence: number;
  pendingCount: number;
  accentColor: string;
}

export interface ProcessingStage {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  engineModule: string;
  estimatedMs: number;
  status: 'waiting' | 'running' | 'completed' | 'error';
  metrics?: string;
}

export interface HistoryEvent {
  id: string;
  timestamp: string;
  documentId: string;
  applicationNumber: string;
  departmentName: string;
  action: 'Uploaded' | 'OCR Processed' | 'Field Edited' | 'Verified' | 'Exported' | 'Synced';
  actor: string;
  details: string;
  mode: 'Demo Simulation' | 'FastAPI Live';
}

export interface AnalyticsSummary {
  totalProcessed: number;
  pendingCount: number;
  verifiedCount: number;
  lowConfidenceCount: number;
  avgConfidence: number;
  kannadaCount: number;
  englishCount: number;
  bilingualCount: number;
  dailyActivity: Array<{
    day: string;
    processed: number;
    verified: number;
    kannada: number;
    english: number;
  }>;
  departmentStats: Array<{
    department: string;
    shortCode: string;
    processed: number;
    verified: number;
    avgConfidence: number;
  }>;
  confidenceDistribution: Array<{
    range: string;
    count: number;
    band: ConfidenceBand;
  }>;
}

export interface OfficerUser {
  id: string;
  name: string;
  designation: string;
  department: string;
  district: string;
  employeeCode: string;
  email: string;
  avatarUrl: string;
}

export interface OfflineSystemState {
  offlineMode: boolean;
  ocrEngine: {
    name: string;
    status: 'Ready (Local)' | 'Busy' | 'Offline';
    languages: string[];
    version: string;
  };
  localDatabase: {
    engine: string;
    status: 'Connected' | 'Syncing';
    cachedRecords: number;
    storageUsedMb: number;
  };
  localAiModel: {
    name: string;
    quantization: string;
    status: 'Loaded in RAM' | 'Standby';
  };
  syncStatus: {
    pendingSyncCount: number;
    lastSyncedAt: string;
    state: 'Local Queue Active' | 'Synchronized' | 'Syncing';
  };
}
