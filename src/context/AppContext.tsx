import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { API_CONFIG } from '../config/apiConfig';
import {
  DEMO_OFFICERS,
  DEPARTMENTS,
  INITIAL_DOCUMENTS,
  INITIAL_HISTORY,
} from '../data/mockData';
import { apiClient } from '../services/apiClient';
import { computeConfidenceBand, documentService, UploadDocumentPayload } from '../services/documentService';
import {
  BackendMode,
  Department,
  DocumentRecord,
  ExtractedField,
  HistoryEvent,
  LanguageMode,
  OfflineSystemState,
  OfficerUser,
  VerificationStatus,
} from '../types';

export interface ActiveProcessingJob {
  jobId: string;
  payload: UploadDocumentPayload;
  startedAt: string;
  completedDocId?: string;
}

export interface ToastNotice {
  id: string;
  title: string;
  message: string;
  tone: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextValue {
  user: OfficerUser | null;
  loginAsOfficer: (officerId: string) => void;
  loginWithCustomEmail: (email: string, name: string, designation: string) => void;
  logout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  backendMode: BackendMode;
  apiBaseUrl: string;
  updateBackendConfig: (url: string, mode: BackendMode) => void;
  offlineState: OfflineSystemState;
  toggleOfflineMode: () => void;
  syncOfflineQueue: () => Promise<void>;
  departments: Department[];
  documents: DocumentRecord[];
  history: HistoryEvent[];
  selectedDepartmentFilter: string;
  setSelectedDepartmentFilter: (deptId: string) => void;
  activeProcessingJob: ActiveProcessingJob | null;
  startProcessingJob: (payload: UploadDocumentPayload) => ActiveProcessingJob;
  finalizeProcessingJob: (job: ActiveProcessingJob) => Promise<DocumentRecord>;
  updateDocumentRecord: (
    docId: string,
    updatedFields: ExtractedField[],
    status: VerificationStatus,
    actionNote?: string
  ) => Promise<void>;
  addHistoryEvent: (event: Omit<HistoryEvent, 'id' | 'timestamp'>) => void;
  defaultLanguage: LanguageMode;
  setDefaultLanguage: (lang: LanguageMode) => void;
  confidenceThreshold: number;
  setConfidenceThreshold: (val: number) => void;
  assistantOpen: boolean;
  setAssistantOpen: (open: boolean) => void;
  assistantDocId: string;
  setAssistantDocId: (id: string) => void;
  openAssistantForDoc: (docId: string) => void;
  toasts: ToastNotice[];
  notify: (title: string, message: string, tone?: ToastNotice['tone']) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEYS = {
  THEME: 'sarkar_ai_theme',
  DOCS: 'sarkar_ai_documents_v1',
  HISTORY: 'sarkar_ai_history_v1',
  BACKEND_URL: 'sarkar_ai_backend_url',
  BACKEND_MODE: 'sarkar_ai_backend_mode',
  OFFLINE_MODE: 'sarkar_ai_offline_mode',
  USER: 'sarkar_ai_user',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<OfficerUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved === 'null') return null;
      return saved ? JSON.parse(saved) : DEMO_OFFICERS[0];
    } catch {
      return DEMO_OFFICERS[0];
    }
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return saved === 'dark' ? 'dark' : 'light';
  });

  const [backendMode, setBackendMode] = useState<BackendMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BACKEND_MODE);
    return saved === 'fastapi' ? 'fastapi' : API_CONFIG.DEFAULT_MODE;
  });

  const [apiBaseUrl, setApiBaseUrl] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.BACKEND_URL) || API_CONFIG.DEFAULT_BASE_URL;
  });

  const [offlineMode, setOfflineMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.OFFLINE_MODE);
    return saved === null ? true : saved === 'true';
  });

  const [documents, setDocuments] = useState<DocumentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOCS);
      return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
    } catch {
      return INITIAL_DOCUMENTS;
    }
  });

  const [history, setHistory] = useState<HistoryEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return saved ? JSON.parse(saved) : INITIAL_HISTORY;
    } catch {
      return INITIAL_HISTORY;
    }
  });

  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('all');
  const [activeProcessingJob, setActiveProcessingJob] = useState<ActiveProcessingJob | null>(null);
  const [defaultLanguage, setDefaultLanguage] = useState<LanguageMode>('Automatic');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(85);
  const [assistantOpen, setAssistantOpen] = useState<boolean>(false);
  const [assistantDocId, setAssistantDocId] = useState<string>(INITIAL_DOCUMENTS[0].id);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('2026-11-24T08:30:00');
  const [toasts, setToasts] = useState<ToastNotice[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  useEffect(() => {
    apiClient.configure(apiBaseUrl, backendMode);
    localStorage.setItem(STORAGE_KEYS.BACKEND_URL, apiBaseUrl);
    localStorage.setItem(STORAGE_KEYS.BACKEND_MODE, backendMode);
  }, [apiBaseUrl, backendMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, String(offlineMode));
  }, [offlineMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(documents));
    } catch {
      // Ignore quota exceeded if large custom uploads are stored in memory
    }
  }, [documents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch {
      // Ignore quota exceeded
    }
  }, [history]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, user ? JSON.stringify(user) : 'null');
  }, [user]);

  const notify = (
    title: string,
    message: string,
    tone: ToastNotice['tone'] = 'info'
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const updateBackendConfig = (url: string, mode: BackendMode) => {
    setApiBaseUrl(url);
    setBackendMode(mode);
    notify(
      mode === 'fastapi' ? 'FastAPI Mode Enabled' : 'Demo Simulation Mode Enabled',
      mode === 'fastapi'
        ? `API requests routed to ${url}`
        : 'Using offline local simulation dataset and demo OCR extractor.',
      'info'
    );
  };

  const loginAsOfficer = (officerId: string) => {
    const found = DEMO_OFFICERS.find((o) => o.id === officerId) || DEMO_OFFICERS[0];
    setUser(found);
    notify('Officer Authenticated', `Signed in as ${found.name}`, 'success');
  };

  const loginWithCustomEmail = (email: string, name: string, designation: string) => {
    const customUser: OfficerUser = {
      id: `off-${Date.now()}`,
      name: name || 'Government Officer',
      designation: designation || 'Digitization Officer',
      department: 'Revenue Department',
      district: 'Bengaluru Urban',
      employeeCode: 'KA-GOV-2026-0918',
      email,
      avatarUrl: DEMO_OFFICERS[0].avatarUrl,
    };
    setUser(customUser);
    notify('Officer Authenticated', `Signed in as ${customUser.name}`, 'success');
  };

  const logout = () => {
    setUser(null);
    notify('Session Closed', 'Signed out of SARKAR AI workstation.', 'info');
  };

  const addHistoryEvent = (event: Omit<HistoryEvent, 'id' | 'timestamp'>) => {
    const fullEvent: HistoryEvent = {
      ...event,
      id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    setHistory((prev) => [fullEvent, ...prev]);
  };

  const startProcessingJob = (payload: UploadDocumentPayload): ActiveProcessingJob => {
    const job: ActiveProcessingJob = {
      jobId: `job-${Date.now()}`,
      payload,
      startedAt: new Date().toISOString(),
    };
    setActiveProcessingJob(job);
    return job;
  };

  const finalizeProcessingJob = async (
    job: ActiveProcessingJob
  ): Promise<DocumentRecord> => {
    const result = await documentService.uploadAndProcessDocument(job.payload);
    const createdDoc = result.document;

    setDocuments((prev) => [createdDoc, ...prev]);
    setAssistantDocId(createdDoc.id);
    setActiveProcessingJob((prev) =>
      prev && prev.jobId === job.jobId ? { ...prev, completedDocId: createdDoc.id } : prev
    );

    addHistoryEvent({
      documentId: createdDoc.id,
      applicationNumber: createdDoc.applicationNumber,
      departmentName: createdDoc.departmentName,
      action: 'Uploaded',
      actor: user?.name || 'District Officer',
      details: `Uploaded ${createdDoc.fileName} (${createdDoc.language})`,
      mode: result.mode === 'fastapi' ? 'FastAPI Live' : 'Demo Simulation',
    });

    addHistoryEvent({
      documentId: createdDoc.id,
      applicationNumber: createdDoc.applicationNumber,
      departmentName: createdDoc.departmentName,
      action: 'OCR Processed',
      actor: result.mode === 'fastapi' ? 'FastAPI PaddleOCR + RAG' : 'Local OCR Engine (Demo)',
      details: `Extracted ${createdDoc.fields.length} fields at ${createdDoc.overallConfidence}% average confidence.`,
      mode: result.mode === 'fastapi' ? 'FastAPI Live' : 'Demo Simulation',
    });

    return createdDoc;
  };

  const updateDocumentRecord = async (
    docId: string,
    updatedFields: ExtractedField[],
    status: VerificationStatus,
    actionNote?: string
  ) => {
    await documentService.saveDocumentChanges(docId, updatedFields, status, documents);

    const avgConf = Math.round(
      updatedFields.reduce((sum, f) => sum + f.confidence, 0) /
        Math.max(updatedFields.length, 1)
    );

    const getVal = (key: string, fallback: string) =>
      updatedFields.find((f) => f.key === key)?.value ?? fallback;

    let updatedDocRef: DocumentRecord | undefined;

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) return doc;
        const nextDoc: DocumentRecord = {
          ...doc,
          fields: updatedFields,
          status,
          overallConfidence: status === 'Verified' ? Math.max(avgConf, 92) : avgConf,
          confidenceBand: computeConfidenceBand(
            status === 'Verified' ? Math.max(avgConf, 92) : avgConf
          ),
          applicantName: getVal('applicantName', doc.applicantName),
          fatherName: getVal('fatherName', doc.fatherName),
          address: getVal('address', doc.address),
          village: getVal('village', doc.village),
          district: getVal('district', doc.district),
          applicationNumber: getVal('applicationNumber', doc.applicationNumber),
          formDate: getVal('formDate', doc.formDate),
        };
        updatedDocRef = nextDoc;
        return nextDoc;
      })
    );

    if (updatedDocRef) {
      addHistoryEvent({
        documentId: updatedDocRef.id,
        applicationNumber: updatedDocRef.applicationNumber,
        departmentName: updatedDocRef.departmentName,
        action: status === 'Verified' ? 'Verified' : 'Field Edited',
        actor: user?.name || 'District Officer',
        details:
          actionNote ||
          (status === 'Verified'
            ? 'Officer verified extracted data and committed record to local store.'
            : 'Updated extracted field values during review.'),
        mode: backendMode === 'fastapi' ? 'FastAPI Live' : 'Demo Simulation',
      });
    }
  };

  const toggleOfflineMode = () => {
    setOfflineMode((prev) => {
      const next = !prev;
      notify(
        next ? 'Offline Mode Active' : 'Central Sync Link Ready',
        next
          ? 'Workstation isolated: using local OCR engine, local SQLite cache & quantized AI model.'
          : 'Network link enabled: queued records ready for central district synchronization.',
        'info'
      );
      return next;
    });
  };

  const syncOfflineQueue = async () => {
    const unsyncedCount = documents.filter((d) => !d.syncedToCentral).length;
    if (unsyncedCount === 0) {
      notify('All Records Synchronized', 'No pending offline records in local queue.', 'success');
      return;
    }

    setIsSyncing(true);
    await new Promise((r) => setTimeout(r, 900));

    setDocuments((prev) => prev.map((d) => ({ ...d, syncedToCentral: true })));
    setLastSyncedAt(new Date().toISOString());
    setIsSyncing(false);

    addHistoryEvent({
      documentId: documents[0]?.id || 'system',
      applicationNumber: 'BATCH-SYNC',
      departmentName: 'All Departments',
      action: 'Synced',
      actor: 'Offline Sync Daemon',
      details: `Synchronized ${unsyncedCount} locally processed records to District Data Centre.`,
      mode: backendMode === 'fastapi' ? 'FastAPI Live' : 'Demo Simulation',
    });

    notify(
      'Synchronization Complete',
      `${unsyncedCount} offline records synced to district registry.`,
      'success'
    );
  };

  const openAssistantForDoc = (docId: string) => {
    setAssistantDocId(docId);
    setAssistantOpen(true);
  };

  const offlineState: OfflineSystemState = useMemo(() => {
    const pendingSyncCount = documents.filter((d) => !d.syncedToCentral).length;
    return {
      offlineMode,
      ocrEngine: {
        name: 'PaddleOCR + Indic-TrOCR',
        status: 'Ready (Local)',
        languages: ['Kannada (ಕನ್ನಡ)', 'English'],
        version: 'Local Edge Engine',
      },
      localDatabase: {
        engine: 'SQLite WAL + IndexedDB Cache',
        status: isSyncing ? 'Syncing' : 'Connected',
        cachedRecords: documents.length,
        storageUsedMb: Number((18.4 + documents.length * 1.35).toFixed(1)),
      },
      localAiModel: {
        name: 'Indic-Llama-3-8B (Q4_K_M)',
        quantization: '4-bit Local Inference',
        status: 'Loaded in RAM',
      },
      syncStatus: {
        pendingSyncCount,
        lastSyncedAt,
        state: isSyncing
          ? 'Syncing'
          : pendingSyncCount > 0
            ? 'Local Queue Active'
            : 'Synchronized',
      },
    };
  }, [offlineMode, isSyncing, documents, lastSyncedAt]);

  return (
    <AppContext.Provider
      value={{
        user,
        loginAsOfficer,
        loginWithCustomEmail,
        logout,
        theme,
        toggleTheme,
        backendMode,
        apiBaseUrl,
        updateBackendConfig,
        offlineState,
        toggleOfflineMode,
        syncOfflineQueue,
        departments: DEPARTMENTS,
        documents,
        history,
        selectedDepartmentFilter,
        setSelectedDepartmentFilter,
        activeProcessingJob,
        startProcessingJob,
        finalizeProcessingJob,
        updateDocumentRecord,
        addHistoryEvent,
        defaultLanguage,
        setDefaultLanguage,
        confidenceThreshold,
        setConfidenceThreshold,
        assistantOpen,
        setAssistantOpen,
        assistantDocId,
        setAssistantDocId,
        openAssistantForDoc,
        toasts,
        notify,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
