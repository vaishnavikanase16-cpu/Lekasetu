import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { API_CONFIG } from '../config/apiConfig';
import {
  DEPARTMENT_WORKSPACES,
  INITIAL_AUDIT_LOGS,
  INITIAL_DOCUMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_POLICE_COMPLAINTS,
  OFFICES_BY_DEPARTMENT,
  OFFICER_PROFILES,
} from '../data/mockData';
import { IntakePayload, ocrService } from '../services/ocrService';
import {
  AppNotification,
  AuditLogEntry,
  BackendMode,
  CorrectionEntry,
  DepartmentConfig,
  DepartmentId,
  ExtractedField,
  LekhaDocument,
  OfficerProfile,
  PoliceComplaintRecord,
  UserRole,
  WorkflowStage,
} from '../types';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  tone: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextValue {
  activeProfile: OfficerProfile;
  switchRole: (role: UserRole) => void;
  selectedDepartment: DepartmentId;
  setSelectedDepartment: (dept: DepartmentId) => void;
  selectedOffice: string;
  setSelectedOffice: (office: string) => void;
  availableOffices: string[];
  isOffline: boolean;
  toggleOfflineStatus: () => void;
  backendMode: BackendMode;
  apiBaseUrl: string;
  updateBackendConfig: (url: string, mode: BackendMode) => void;
  departments: DepartmentConfig[];
  documents: LekhaDocument[];
  policeComplaints: PoliceComplaintRecord[];
  notifications: AppNotification[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  auditLogs: AuditLogEntry[];
  pendingIntake: IntakePayload | null;
  setPendingIntake: (payload: IntakePayload | null) => void;
  runScannerTransformation: (payload: IntakePayload) => Promise<LekhaDocument>;
  saveFieldCorrections: (
    docId: string,
    updatedFields: ExtractedField[],
    recognizedText: string
  ) => void;
  verifyDocument: (docId: string, updatedFields?: ExtractedField[]) => void;
  returnDocumentForCorrection: (docId: string, reason: string) => void;
  advanceWorkflowStage: (docId: string, nextStage: WorkflowStage) => void;
  assignDocumentOfficer: (docId: string, officerName: string) => void;
  deleteDocument: (docId: string) => boolean;
  addPoliceComplaint: (
    complaint: Omit<PoliceComplaintRecord, 'id' | 'submittedAt' | 'createdBy'>
  ) => PoliceComplaintRecord;
  resetDemoData: () => void;
  canVerify: boolean;
  canDelete: boolean;
  canExport: boolean;
  toasts: ToastItem[];
  notify: (title: string, message: string, tone?: ToastItem['tone']) => void;
  dismissToast: (id: string) => void;
  addAuditEvent: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEYS = {
  DOCS: 'lekhasetu_documents_v2',
  COMPLAINTS: 'lekhasetu_complaints_v2',
  NOTIFS: 'lekhasetu_notifications_v2',
  AUDIT: 'lekhasetu_audit_v2',
  ROLE: 'lekhasetu_role_v2',
  DEPT: 'lekhasetu_dept_v2',
  OFFLINE: 'lekhasetu_offline_v2',
  API_URL: 'lekhasetu_api_url_v2',
  BACKEND_MODE: 'lekhasetu_backend_mode_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole | null;
    return saved && ['Administrator', 'Officer', 'Data Entry Operator', 'Reviewer'].includes(saved)
      ? saved
      : 'Administrator';
  });

  const activeProfile = useMemo(
    () => OFFICER_PROFILES.find((p) => p.role === role) || OFFICER_PROFILES[0],
    [role]
  );

  const [selectedDepartment, setSelectedDepartmentState] = useState<DepartmentId>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEPT) as DepartmentId | null;
    return saved || 'all';
  });

  const availableOffices = useMemo(
    () => OFFICES_BY_DEPARTMENT[selectedDepartment] || OFFICES_BY_DEPARTMENT.all,
    [selectedDepartment]
  );

  const [selectedOffice, setSelectedOffice] = useState<string>(availableOffices[0]);

  useEffect(() => {
    if (!availableOffices.includes(selectedOffice)) {
      setSelectedOffice(availableOffices[0]);
    }
  }, [availableOffices, selectedOffice]);

  const [isOffline, setIsOffline] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.OFFLINE);
    return saved === null ? true : saved === 'true';
  });

  const [backendMode, setBackendMode] = useState<BackendMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BACKEND_MODE);
    return saved === 'fastapi' ? 'fastapi' : API_CONFIG.DEFAULT_MODE;
  });

  const [apiBaseUrl, setApiBaseUrl] = useState<string>(
    () => localStorage.getItem(STORAGE_KEYS.API_URL) || API_CONFIG.DEFAULT_BASE_URL
  );

  const [documents, setDocuments] = useState<LekhaDocument[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOCS);
      return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
    } catch {
      return INITIAL_DOCUMENTS;
    }
  });

  const [policeComplaints, setPoliceComplaints] = useState<PoliceComplaintRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
      return saved ? JSON.parse(saved) : INITIAL_POLICE_COMPLAINTS;
    } catch {
      return INITIAL_POLICE_COMPLAINTS;
    }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [pendingIntake, setPendingIntake] = useState<IntakePayload | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEPT, selectedDepartment);
  }, [selectedDepartment]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OFFLINE, String(isOffline));
  }, [isOffline]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.API_URL, apiBaseUrl);
    localStorage.setItem(STORAGE_KEYS.BACKEND_MODE, backendMode);
  }, [apiBaseUrl, backendMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(documents));
      localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(policeComplaints));
      localStorage.setItem(STORAGE_KEYS.NOTIFS, JSON.stringify(notifications));
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
    } catch {
      // Ignore storage quota issues
    }
  }, [documents, policeComplaints, notifications, auditLogs]);

  const notify = (
    title: string,
    message: string,
    tone: ToastItem['tone'] = 'info'
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

  const addAuditEvent = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    setAuditLogs((prev) => [
      {
        ...entry,
        id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const pushNotification = (
    notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>
  ) => {
    setNotifications((prev) => [
      {
        ...notif,
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        timestamp: new Date().toISOString(),
        read: false,
      },
      ...prev,
    ]);
  };

  const switchRole = (nextRole: UserRole) => {
    setRole(nextRole);
    const prof = OFFICER_PROFILES.find((p) => p.role === nextRole);
    if (prof) {
      setSelectedDepartmentState(prof.departmentId);
      notify('Role Switched', `${prof.name} (${nextRole})`, 'info');
    }
  };

  const setSelectedDepartment = (dept: DepartmentId) => {
    setSelectedDepartmentState(dept);
  };

  const toggleOfflineStatus = () => {
    setIsOffline((prev) => {
      const next = !prev;
      notify(
        next ? 'Offline – Local Processing Active' : 'Online – Connection Available',
        next
          ? 'Local SQLite, document store, and OCR/RAG modules active.'
          : 'Network link available for optional central synchronization.',
        'info'
      );
      return next;
    });
  };

  const updateBackendConfig = (url: string, mode: BackendMode) => {
    setApiBaseUrl(url);
    setBackendMode(mode);
    notify(
      mode === 'fastapi' ? 'FastAPI Backend Enabled' : 'Illustrative Demo Mode Enabled',
      mode === 'fastapi' ? `Endpoint set to ${url}` : 'Using simulated local OCR & SQLite store.',
      'info'
    );
  };

  const runScannerTransformation = async (
    payload: IntakePayload
  ): Promise<LekhaDocument> => {
    const newDoc = await ocrService.runDocumentTransformation(
      payload,
      backendMode,
      apiBaseUrl
    );
    setDocuments((prev) => [newDoc, ...prev]);

    addAuditEvent({
      actor: activeProfile.name,
      role: activeProfile.role,
      action: 'Created',
      targetRef: newDoc.referenceNumber,
      departmentId: newDoc.departmentId,
      details: `Digitized ${newDoc.fileName} (${newDoc.inputLanguage}) via ${newDoc.ocrSource}.`,
    });

    pushNotification({
      type: 'new_document',
      titleKey: 'New Document Received',
      message: `${newDoc.referenceNumber} (${newDoc.category}) digitized and queued for verification.`,
      documentId: newDoc.id,
      departmentId: newDoc.departmentId,
    });

    return newDoc;
  };

  const saveFieldCorrections = (
    docId: string,
    updatedFields: ExtractedField[],
    recognizedText: string
  ) => {
    const now = new Date().toISOString();
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) return doc;

        const changes: CorrectionEntry[] = [];
        updatedFields.forEach((nf) => {
          const old = doc.fields.find((of) => of.key === nf.key);
          if (old && old.value !== nf.value) {
            changes.push({
              id: `corr-${Date.now()}-${nf.key}`,
              timestamp: now,
              officerName: activeProfile.name,
              fieldKey: nf.key,
              previousValue: old.value,
              updatedValue: nf.value,
              actionType: 'Edited',
            });
            addAuditEvent({
              actor: activeProfile.name,
              role: activeProfile.role,
              action: 'Modified',
              targetRef: doc.referenceNumber,
              departmentId: doc.departmentId,
              previousValue: old.value || '[Blank]',
              updatedValue: nf.value || '[Blank]',
              details: `Corrected field "${nf.key}" in Verification Centre.`,
            });
          }
        });

        const getVal = (k: string, fb: string) =>
          updatedFields.find((f) => f.key === k)?.value ?? fb;

        const hasMissingFields = updatedFields.some(
          (f) => f.required && (!f.value.trim() || f.reviewState === 'MissingOrInvalid')
        );
        const needsReviewCount = updatedFields.filter(
          (f) => f.reviewState !== 'HighConfidence'
        ).length;

        return {
          ...doc,
          fields: updatedFields,
          recognizedText,
          applicantName: getVal('applicantName', doc.applicantName),
          address: getVal('address', doc.address),
          village: getVal('village', doc.village),
          district: getVal('district', doc.district),
          contactNumber: getVal('contactNumber', doc.contactNumber),
          hasMissingFields,
          needsReviewCount,
          updatedAt: now,
          correctionHistory: [...changes, ...doc.correctionHistory],
        };
      })
    );
  };

  const canVerify =
    role === 'Administrator' || role === 'Officer' || role === 'Reviewer';
  const canDelete = role === 'Administrator';
  const canExport =
    role === 'Administrator' || role === 'Officer' || role === 'Reviewer';

  const verifyDocument = (docId: string, updatedFields?: ExtractedField[]) => {
    if (!canVerify) {
      notify('Permission Restricted', 'Data Entry Operators cannot approve official records.', 'warning');
      return;
    }

    const now = new Date().toISOString();
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) return doc;
        const fieldsToSave = (updatedFields || doc.fields).map((f) => ({
          ...f,
          reviewState: f.value.trim() ? ('HighConfidence' as const) : f.reviewState,
        }));

        const hasMissing = fieldsToSave.some((f) => f.required && !f.value.trim());

        const entry: CorrectionEntry = {
          id: `corr-ver-${Date.now()}`,
          timestamp: now,
          officerName: activeProfile.name,
          fieldKey: 'status',
          previousValue: doc.workflowStage,
          updatedValue: 'Verified',
          actionType: 'Verified',
          note: 'Officer verified extracted data against original handwriting.',
        };

        addAuditEvent({
          actor: activeProfile.name,
          role: activeProfile.role,
          action: 'Verified',
          targetRef: doc.referenceNumber,
          departmentId: doc.departmentId,
          previousValue: doc.workflowStage,
          updatedValue: 'Verified',
          details: `Verified and approved record ${doc.referenceNumber}.`,
        });

        pushNotification({
          type: 'task_completed',
          titleKey: 'Document Verified',
          message: `${doc.referenceNumber} approved by ${activeProfile.name}.`,
          documentId: doc.id,
          departmentId: doc.departmentId,
        });

        return {
          ...doc,
          fields: fieldsToSave,
          workflowStage: 'Verified',
          hasMissingFields: hasMissing,
          needsReviewCount: 0,
          updatedAt: now,
          correctionHistory: [entry, ...doc.correctionHistory],
        };
      })
    );
  };

  const returnDocumentForCorrection = (docId: string, reason: string) => {
    const now = new Date().toISOString();
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) return doc;
        const entry: CorrectionEntry = {
          id: `corr-ret-${Date.now()}`,
          timestamp: now,
          officerName: activeProfile.name,
          fieldKey: 'workflowStage',
          previousValue: doc.workflowStage,
          updatedValue: 'Received',
          actionType: 'Returned',
          note: reason || 'Returned for handwriting re-verification.',
        };

        addAuditEvent({
          actor: activeProfile.name,
          role: activeProfile.role,
          action: 'Returned',
          targetRef: doc.referenceNumber,
          departmentId: doc.departmentId,
          previousValue: doc.workflowStage,
          updatedValue: 'Received',
          details: reason || 'Returned for correction.',
        });

        pushNotification({
          type: 'document_returned',
          titleKey: 'Document Returned',
          message: `${doc.referenceNumber} returned for correction: ${reason}`,
          documentId: doc.id,
          departmentId: doc.departmentId,
        });

        return {
          ...doc,
          workflowStage: 'Received',
          updatedAt: now,
          correctionHistory: [entry, ...doc.correctionHistory],
        };
      })
    );
  };

  const advanceWorkflowStage = (docId: string, nextStage: WorkflowStage) => {
    const now = new Date().toISOString();
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) return doc;
        addAuditEvent({
          actor: activeProfile.name,
          role: activeProfile.role,
          action: 'Status Changed',
          targetRef: doc.referenceNumber,
          departmentId: doc.departmentId,
          previousValue: doc.workflowStage,
          updatedValue: nextStage,
          details: `Workflow transitioned from ${doc.workflowStage} to ${nextStage}.`,
        });
        return { ...doc, workflowStage: nextStage, updatedAt: now };
      })
    );
  };

  const assignDocumentOfficer = (docId: string, officerName: string) => {
    const now = new Date().toISOString();
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) return doc;
        addAuditEvent({
          actor: activeProfile.name,
          role: activeProfile.role,
          action: 'Modified',
          targetRef: doc.referenceNumber,
          departmentId: doc.departmentId,
          previousValue: doc.assignedTo,
          updatedValue: officerName,
          details: `Assigned case to ${officerName}.`,
        });
        pushNotification({
          type: 'task_assigned',
          titleKey: 'Task Assigned',
          message: `${doc.referenceNumber} assigned to ${officerName}.`,
          documentId: doc.id,
          departmentId: doc.departmentId,
        });
        return {
          ...doc,
          assignedTo: officerName,
          workflowStage:
            doc.workflowStage === 'Verified' ? 'Assigned' : doc.workflowStage,
          updatedAt: now,
        };
      })
    );
  };

  const deleteDocument = (docId: string): boolean => {
    if (!canDelete) {
      notify('Permission Restricted', 'Only Administrators can delete local records.', 'warning');
      return false;
    }
    const target = documents.find((d) => d.id === docId);
    if (!target) return false;
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    addAuditEvent({
      actor: activeProfile.name,
      role: activeProfile.role,
      action: 'Deleted',
      targetRef: target.referenceNumber,
      departmentId: target.departmentId,
      details: `Deleted record ${target.referenceNumber} (${target.category}).`,
    });
    return true;
  };

  const addPoliceComplaint = (
    complaint: Omit<PoliceComplaintRecord, 'id' | 'submittedAt' | 'createdBy'>
  ): PoliceComplaintRecord => {
    const record: PoliceComplaintRecord = {
      ...complaint,
      id: `pc-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      createdBy: activeProfile.name,
    };
    setPoliceComplaints((prev) => [record, ...prev]);

    addAuditEvent({
      actor: activeProfile.name,
      role: activeProfile.role,
      action: 'Created',
      targetRef: record.internalRefNumber,
      departmentId: 'police',
      details: `Created internal police complaint record (${record.inputMode}) at ${record.policeStation}.`,
    });

    pushNotification({
      type: 'new_document',
      titleKey: 'Internal Complaint Logged',
      message: `${record.internalRefNumber} logged at ${record.policeStation}.`,
      departmentId: 'police',
    });

    return record;
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const resetDemoData = () => {
    setDocuments(INITIAL_DOCUMENTS);
    setPoliceComplaints(INITIAL_POLICE_COMPLAINTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    notify('Demo Data Restored', 'Reset to illustrative Karnataka Government sample records.', 'info');
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        activeProfile,
        switchRole,
        selectedDepartment,
        setSelectedDepartment,
        selectedOffice,
        setSelectedOffice,
        availableOffices,
        isOffline,
        toggleOfflineStatus,
        backendMode,
        apiBaseUrl,
        updateBackendConfig,
        departments: DEPARTMENT_WORKSPACES,
        documents,
        policeComplaints,
        notifications,
        unreadNotificationCount,
        markNotificationRead,
        markAllNotificationsRead,
        auditLogs,
        pendingIntake,
        setPendingIntake,
        runScannerTransformation,
        saveFieldCorrections,
        verifyDocument,
        returnDocumentForCorrection,
        advanceWorkflowStage,
        assignDocumentOfficer,
        deleteDocument,
        addPoliceComplaint,
        resetDemoData,
        canVerify,
        canDelete,
        canExport,
        toasts,
        notify,
        dismissToast,
        addAuditEvent,
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
