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
    DEPARTMENTS: '/departments',
    DOCUMENTS: '/documents',
    DOCUMENT_BY_ID: (id: string) => `/documents/${encodeURIComponent(id)}`,
    ANALYTICS: '/analytics',
    AI_ASSISTANT: '/assistant/query',
    SYNC_OFFLINE: '/sync',
  },
} as const;

export const ENDPOINT_SPECIFICATIONS = [
  {
    method: 'POST',
    path: '/upload-document',
    purpose: 'Upload scanned JPG/PNG/PDF form with department, form type, and language metadata',
    payload: 'multipart/form-data (file, department_id, form_type, language_mode)',
  },
  {
    method: 'POST',
    path: '/process-document',
    purpose: 'Run 7-stage offline Kannada & English OCR + AI field extraction & confidence scoring',
    payload: '{ document_id, language_mode, run_verification }',
  },
  {
    method: 'GET',
    path: '/departments',
    purpose: 'Fetch all 10 Karnataka/Indian government departments and form categories',
    payload: 'Query: ?include_stats=true',
  },
  {
    method: 'GET',
    path: '/documents',
    purpose: 'List digitized document records with search, department, language, date & confidence filters',
    payload: 'Query: ?search=&department=&language=&confidence=&status=',
  },
  {
    method: 'GET',
    path: '/documents/{id}',
    purpose: 'Retrieve full document preview metadata and field-wise confidence breakdown',
    payload: 'Path parameter: id',
  },
  {
    method: 'PUT',
    path: '/documents/{id}',
    purpose: 'Save officer-edited fields, update verification status, and append audit log',
    payload: '{ fields: ExtractedField[], status: VerificationStatus }',
  },
  {
    method: 'GET',
    path: '/analytics',
    purpose: 'Aggregate dashboard KPIs, department throughput, and Kannada/English accuracy stats',
    payload: 'Query: ?range=7d|30d|90d',
  },
] as const;
