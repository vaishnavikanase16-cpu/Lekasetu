import { BackendMode } from '../types';

export const API_CONFIG = {
  DEFAULT_BASE_URL:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
    'http://localhost:8000',
  DEFAULT_MODE:
    ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_DEFAULT_MODE) as BackendMode) ||
    'demo',
  TIMEOUT_MS: 30000,
  ENDPOINTS: {
    HEALTH: '/health',
    UPLOAD_DOCUMENT: '/upload-document',
    PROCESS_DOCUMENT: '/process-document',
    VERIFY_DOCUMENT: (id: string) => `/documents/${encodeURIComponent(id)}/verify`,
    DOCUMENTS: '/documents',
    DOCUMENT_BY_ID: (id: string) => `/documents/${encodeURIComponent(id)}`,
    POLICE_COMPLAINTS: '/police/complaints',
    NAMMADOCS_QUERY: '/nammadocs/query',
    ANALYTICS: '/analytics',
    AUDIT_LOGS: '/audit-logs',
    BACKUP_EXPORT: '/backup/export',
  },
} as const;
