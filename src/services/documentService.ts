import JSZip from 'jszip';
import { API_CONFIG } from '../config/apiConfig';
import {
  AnalyticsSummary,
  Department,
  DocumentRecord,
  ExtractedField,
  LanguageMode,
  VerificationStatus,
} from '../types';
import { apiClient } from './apiClient';
import { ASSET_PATHS, DAILY_ACTIVITY_SERIES, DEPARTMENTS } from '../data/mockData';

export interface UploadDocumentPayload {
  file: File | null;
  previewUrl: string;
  fileName: string;
  fileType: 'image/jpeg' | 'image/png' | 'application/pdf';
  departmentId: string;
  formType: string;
  languageMode: LanguageMode;
  officerName: string;
}

export interface ProcessDocumentResponse {
  document: DocumentRecord;
  mode: 'demo' | 'fastapi';
}

export function computeConfidenceBand(score: number): 'High' | 'Medium' | 'Low' {
  if (score >= 85) return 'High';
  if (score >= 65) return 'Medium';
  return 'Low';
}

function generateDemoExtractedDocument(payload: UploadDocumentPayload): DocumentRecord {
  const dept = DEPARTMENTS.find((d) => d.id === payload.departmentId) || DEPARTMENTS[0];
  const nowIso = new Date().toISOString();
  const idSuffix = Math.floor(100 + Math.random() * 899);
  const appNum = `${dept.shortCode}/KA/2026/${Math.floor(10000 + Math.random() * 89999)}`;

  const isRevenueScan = payload.previewUrl === ASSET_PATHS.REVENUE_SCAN;
  const isAgriScan = payload.previewUrl === ASSET_PATHS.AGRI_SCAN;
  const isPanchayatScan = payload.previewUrl === ASSET_PATHS.PANCHAYAT_SCAN;

  const docLanguage =
    payload.languageMode === 'Kannada'
      ? 'Kannada'
      : payload.languageMode === 'English'
        ? 'English'
        : 'Bilingual (KN + EN)';

  let fields: ExtractedField[] = [];
  let applicantName = 'Suresh Babu K. (ಸುರೇಶ್ ಬಾಬು ಕೆ.)';
  let fatherName = 'Krishnappa K. (ಕೃಷ್ಣಪ್ಪ ಕೆ.)';
  let address = 'No. 18, Temple Street, Devanahalli';
  let village = 'Bidalur (ಬಿದಲೂರು)';
  let district = 'Bengaluru Rural';
  let formDate = nowIso.slice(0, 10);

  if (isRevenueScan) {
    applicantName = 'Ravi Kumar B. (ರವಿ ಕುಮಾರ್ ಬಿ.)';
    fatherName = 'B. Nagaraj (ಬಿ. ನಾಗರಾಜ್)';
    address = 'No. 45, 3rd Main, Hosakote, Bangalore Rural';
    village = 'Hullahalli (ಹುಲ್ಲಹಳ್ಳಿ)';
    district = 'Bengaluru Rural';
    formDate = '2026-10-18';
    fields = [
      { key: 'applicationNumber', label: 'Application Number', labelKn: 'ಅರ್ಜಿ ಸಂಖ್ಯೆ', value: appNum, confidence: 96, isCore: true, required: true },
      { key: 'applicantName', label: 'Applicant Name', labelKn: 'ಅರ್ಜಿದಾರರ ಹೆಸರು', value: applicantName, confidence: 94, isCore: true, required: true },
      { key: 'fatherName', label: "Father's Name", labelKn: 'ತಂದೆಯ ಹೆಸರು', value: fatherName, confidence: 92, isCore: true, required: true },
      { key: 'address', label: 'Address', labelKn: 'ವಿಳಾಸ', value: address, confidence: 88, isCore: true, required: true },
      { key: 'village', label: 'Village', labelKn: 'ಗ್ರಾಮ', value: village, confidence: 91, isCore: true, required: true },
      { key: 'district', label: 'District', labelKn: 'ಜಿಲ್ಲೆ', value: district, confidence: 95, isCore: true, required: true },
      { key: 'formDate', label: 'Date', labelKn: 'ದಿನಾಂಕ', value: formDate, confidence: 79, isCore: true, required: true, ocrNote: 'Circular office stamp overlaps right corner of date.' },
      { key: 'surveyNumber', label: 'Survey Number', labelKn: 'ಸರ್ವೆ ನಂ.', value: '14/2A', confidence: 83, required: true },
      { key: 'landExtent', label: 'Land Extent', labelKn: 'ವಿಸ್ತೀರ್ಣ', value: '2 Acres 10 Guntas (Dry)', confidence: 74, ocrNote: 'Checkbox mark near Dry/Drain requires confirmation.' },
      { key: 'mutationReason', label: 'Mutation Reason', labelKn: 'ಕಾರಣ', value: 'Inheritance (ವಾರಸುದಾರಿಕೆ)', confidence: 61, required: true, ocrNote: 'Kannada ligature stroke faint; please verify spelling.' },
    ];
  } else if (isAgriScan) {
    applicantName = 'Raghavendra S. Gowda';
    fatherName = '';
    address = 'Hulikere, Mandya Taluk';
    village = 'Hulikere';
    district = 'Mandya';
    formDate = '2026-10-15';
    fields = [
      { key: 'applicationNumber', label: 'Application Number', labelKn: 'ಅರ್ಜಿ ಸಂಖ್ಯೆ', value: appNum, confidence: 95, isCore: true, required: true },
      { key: 'applicantName', label: 'Applicant Name', labelKn: 'ರೈತರ ಹೆಸರು', value: applicantName, confidence: 95, isCore: true, required: true },
      { key: 'fatherName', label: "Father's Name", labelKn: 'ತಂದೆಯ ಹೆಸರು', value: '', confidence: 20, isCore: true, required: true, ocrNote: 'Guardian field missing on uploaded scan.' },
      { key: 'address', label: 'Address', labelKn: 'ವಿಳಾಸ', value: address, confidence: 62, isCore: true, required: true, ocrNote: 'Row 2 address line left blank; inferred from Taluk.' },
      { key: 'village', label: 'Village', labelKn: 'ಗ್ರಾಮ', value: village, confidence: 93, isCore: true, required: true },
      { key: 'district', label: 'District', labelKn: 'ಜಿಲ್ಲೆ', value: district, confidence: 96, isCore: true, required: true },
      { key: 'formDate', label: 'Date', labelKn: 'ದಿನಾಂಕ', value: formDate, confidence: 91, isCore: true, required: true },
      { key: 'surveyNumber', label: 'Survey Number', labelKn: 'ಸರ್ವೆ ನಂ.', value: '147/2A, 147/2B', confidence: 77, required: true },
      { key: 'cropGrown', label: 'Crop & Area', labelKn: 'ಬೆಳೆ ಮತ್ತು ವಿಸ್ತೀರ್ಣ', value: 'Maize · 4.5 Acres', confidence: 93 },
      { key: 'cropLoss', label: 'Crop Loss %', labelKn: 'ಬೆಳೆ ಹಾನಿ %', value: '80% (Drought)', confidence: 88 },
    ];
  } else if (isPanchayatScan) {
    applicantName = 'Rajesh Kumar Singh';
    fatherName = 'Late Ram Singh';
    address = 'Ward 4, Dhanuha, Basantpur Panchayat';
    village = 'Dhanuha / Ward 4';
    district = 'Basantpur Sadar';
    formDate = '2026-10-20';
    fields = [
      { key: 'applicationNumber', label: 'Application Number', value: appNum, confidence: 97, isCore: true, required: true },
      { key: 'applicantName', label: 'Applicant Name', value: applicantName, confidence: 96, isCore: true, required: true },
      { key: 'fatherName', label: "Father's Name", value: fatherName, confidence: 94, isCore: true, required: true },
      { key: 'address', label: 'Address', value: address, confidence: 91, isCore: true, required: true },
      { key: 'village', label: 'Village', value: village, confidence: 95, isCore: true, required: true },
      { key: 'district', label: 'District', value: district, confidence: 93, isCore: true, required: true },
      { key: 'formDate', label: 'Date', value: formDate, confidence: 96, isCore: true, required: true },
      { key: 'aadhaarNumber', label: 'Aadhaar Reference', value: '8901 2345 6789', confidence: 95 },
      { key: 'mobileNumber', label: 'Mobile Number', value: '9876543210', confidence: 97 },
      { key: 'propertyPlotKhata', label: 'Plot & Khata', value: 'Plot 120 · Khata 23 · 0.15 Acre', confidence: 90 },
    ];
  } else {
    if (payload.languageMode === 'Kannada') {
      applicantName = 'ಮಂಜುನಾಥ್ ಆರ್. ಗೌಡ';
      fatherName = 'ರಾಮಚಂದ್ರ ಗೌಡ';
      address = 'ನಂ. 22, ಗಾಂಧಿ ಬಜಾರ್, ಶಿವಮೊಗ್ಗ';
      village = 'ಗಾಂಧಿ ಬಜಾರ್ ವಾರ್ಡ್ 4';
      district = 'Shivamogga';
    } else if (payload.languageMode === 'English') {
      applicantName = 'Prakash N. Deshmukh';
      fatherName = 'Narayan Deshmukh';
      address = 'Plot 19, Vidya Nagar, Hubballi';
      village = 'Vidya Nagar Ward 11';
      district = 'Dharwad';
    }

    fields = [
      { key: 'applicationNumber', label: 'Application Number', labelKn: 'ಅರ್ಜಿ ಸಂಖ್ಯೆ', value: appNum, confidence: 95, isCore: true, required: true },
      { key: 'applicantName', label: 'Applicant Name', labelKn: 'ಅರ್ಜಿದಾರರ ಹೆಸರು', value: applicantName, confidence: 91, isCore: true, required: true },
      { key: 'fatherName', label: "Father's Name", labelKn: 'ತಂದೆಯ ಹೆಸರು', value: fatherName, confidence: 87, isCore: true, required: true },
      { key: 'address', label: 'Address', labelKn: 'ವಿಳಾಸ', value: address, confidence: 82, isCore: true, required: true, ocrNote: 'Handwritten house number ink slightly light.' },
      { key: 'village', label: 'Village / Ward', labelKn: 'ಗ್ರಾಮ / ವಾರ್ಡ್', value: village, confidence: 89, isCore: true, required: true },
      { key: 'district', label: 'District', labelKn: 'ಜಿಲ್ಲೆ', value: district, confidence: 94, isCore: true, required: true },
      { key: 'formDate', label: 'Date', labelKn: 'ದಿನಾಂಕ', value: formDate, confidence: 92, isCore: true, required: true },
      { key: 'departmentFormCode', label: 'Form Category', labelKn: 'ಅರ್ಜಿ ವಿಧ', value: payload.formType, confidence: 96 },
      { key: 'remarks', label: 'Officer / Clerk Remarks', labelKn: 'ಷರಾ', value: 'Handwritten signature detected at lower margin', confidence: 64, ocrNote: 'Lower margin signature overlaps printed instruction text.' },
    ];
  }

  const avgConfidence = Math.round(
    fields.reduce((acc, f) => acc + f.confidence, 0) / Math.max(fields.length, 1)
  );
  const hasCriticalLow = fields.some((f) => f.confidence < 65);

  return {
    id: `doc-2026-${idSuffix}`,
    applicationNumber: appNum,
    title: `${payload.formType} (${dept.shortCode})`,
    departmentId: dept.id,
    departmentName: dept.name,
    formType: payload.formType,
    language: docLanguage,
    detectedScripts:
      docLanguage === 'Kannada'
        ? ['Kannada']
        : docLanguage === 'English'
          ? ['Latin']
          : ['Kannada', 'Latin'],
    applicantName,
    fatherName,
    address,
    village,
    district,
    formDate,
    uploadedAt: nowIso,
    processedAt: nowIso,
    fileName: payload.fileName,
    fileType: payload.fileType,
    imageUrl: payload.previewUrl,
    status: hasCriticalLow ? 'Low Confidence' : 'Pending Review',
    overallConfidence: avgConfidence,
    confidenceBand: computeConfidenceBand(avgConfidence),
    syncedToCentral: false,
    processingMode: 'Demo Simulation',
    assignedOfficer: payload.officerName,
    fields,
  };
}

export const documentService = {
  async uploadAndProcessDocument(
    payload: UploadDocumentPayload
  ): Promise<ProcessDocumentResponse> {
    if (apiClient.getMode() === 'fastapi') {
      const formData = new FormData();
      if (payload.file) {
        formData.append('file', payload.file);
      }
      formData.append('department_id', payload.departmentId);
      formData.append('form_type', payload.formType);
      formData.append('language_mode', payload.languageMode);

      const uploaded = await apiClient.request<{ document_id: string }>(
        API_CONFIG.ENDPOINTS.UPLOAD_DOCUMENT,
        { method: 'POST', body: formData }
      );

      const processed = await apiClient.request<DocumentRecord>(
        API_CONFIG.ENDPOINTS.PROCESS_DOCUMENT,
        {
          method: 'POST',
          body: JSON.stringify({
            document_id: uploaded.document_id,
            language_mode: payload.languageMode,
            run_verification: true,
          }),
        }
      );

      return {
        document: { ...processed, processingMode: 'FastAPI OCR Engine' },
        mode: 'fastapi',
      };
    }

    // Demo local simulation mode
    return {
      document: generateDemoExtractedDocument(payload),
      mode: 'demo',
    };
  },

  async fetchDepartments(): Promise<Department[]> {
    if (apiClient.getMode() === 'fastapi') {
      return apiClient.request<Department[]>(API_CONFIG.ENDPOINTS.DEPARTMENTS, {
        method: 'GET',
      });
    }
    return DEPARTMENTS;
  },

  async fetchDocuments(localDocs: DocumentRecord[]): Promise<DocumentRecord[]> {
    if (apiClient.getMode() === 'fastapi') {
      return apiClient.request<DocumentRecord[]>(API_CONFIG.ENDPOINTS.DOCUMENTS, {
        method: 'GET',
      });
    }
    return localDocs;
  },

  async fetchDocumentById(
    id: string,
    localDocs: DocumentRecord[]
  ): Promise<DocumentRecord | undefined> {
    if (apiClient.getMode() === 'fastapi') {
      return apiClient.request<DocumentRecord>(API_CONFIG.ENDPOINTS.DOCUMENT_BY_ID(id), {
        method: 'GET',
      });
    }
    return localDocs.find((d) => d.id === id);
  },

  async saveDocumentChanges(
    docId: string,
    fields: ExtractedField[],
    status: VerificationStatus,
    localDocs: DocumentRecord[]
  ): Promise<DocumentRecord | undefined> {
    if (apiClient.getMode() === 'fastapi') {
      return apiClient.request<DocumentRecord>(API_CONFIG.ENDPOINTS.DOCUMENT_BY_ID(docId), {
        method: 'PUT',
        body: JSON.stringify({ fields, status }),
      });
    }
    return localDocs.find((d) => d.id === docId);
  },

  async fetchAnalytics(localDocs: DocumentRecord[]): Promise<AnalyticsSummary> {
    if (apiClient.getMode() === 'fastapi') {
      return apiClient.request<AnalyticsSummary>(API_CONFIG.ENDPOINTS.ANALYTICS, {
        method: 'GET',
      });
    }

    const totalProcessed = localDocs.length;
    const pendingCount = localDocs.filter((d) => d.status === 'Pending Review').length;
    const verifiedCount = localDocs.filter((d) => d.status === 'Verified').length;
    const lowConfidenceCount = localDocs.filter(
      (d) => d.status === 'Low Confidence' || d.overallConfidence < 70
    ).length;
    const avgConfidence = Math.round(
      localDocs.reduce((sum, d) => sum + d.overallConfidence, 0) / Math.max(totalProcessed, 1)
    );

    const kannadaCount = localDocs.filter((d) => d.language === 'Kannada').length;
    const englishCount = localDocs.filter((d) => d.language === 'English').length;
    const bilingualCount = localDocs.filter((d) => d.language === 'Bilingual (KN + EN)').length;

    const departmentStats = DEPARTMENTS.map((dept) => {
      const deptDocs = localDocs.filter((d) => d.departmentId === dept.id);
      return {
        department: dept.name.replace(' Department', ''),
        shortCode: dept.shortCode,
        processed: dept.totalProcessed + deptDocs.length,
        verified: Math.round(dept.totalProcessed * 0.84) + deptDocs.filter((d) => d.status === 'Verified').length,
        avgConfidence: dept.avgConfidence,
      };
    });

    const confidenceDistribution = [
      {
        range: 'High (85–100%)',
        count: localDocs.filter((d) => d.overallConfidence >= 85).length,
        band: 'High' as const,
      },
      {
        range: 'Medium (65–84%)',
        count: localDocs.filter((d) => d.overallConfidence >= 65 && d.overallConfidence < 85).length,
        band: 'Medium' as const,
      },
      {
        range: 'Low (<65%)',
        count: localDocs.filter((d) => d.overallConfidence < 65).length,
        band: 'Low' as const,
      },
    ];

    return {
      totalProcessed: 2694 + totalProcessed,
      pendingCount: 156 + pendingCount,
      verifiedCount: 2418 + verifiedCount,
      lowConfidenceCount: 120 + lowConfidenceCount,
      avgConfidence,
      kannadaCount: 1120 + kannadaCount,
      englishCount: 685 + englishCount,
      bilingualCount: 889 + bilingualCount,
      dailyActivity: DAILY_ACTIVITY_SERIES,
      departmentStats,
      confidenceDistribution,
    };
  },
};

export function triggerFileDownload(filename: string, content: BlobPart, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportDocumentAsJSON(doc: DocumentRecord) {
  const payload = {
    system: 'SARKAR AI – Offline Intelligent Government Document Processing System',
    exportedAt: new Date().toISOString(),
    processingMode: doc.processingMode,
    record: {
      id: doc.id,
      applicationNumber: doc.applicationNumber,
      department: doc.departmentName,
      formType: doc.formType,
      language: doc.language,
      status: doc.status,
      overallConfidence: doc.overallConfidence,
      fields: doc.fields.map((f) => ({
        key: f.key,
        label: f.label,
        value: f.value,
        confidence: f.confidence,
        ocrNote: f.ocrNote || null,
      })),
    },
  };
  triggerFileDownload(
    `${doc.applicationNumber.replaceAll('/', '_')}.json`,
    JSON.stringify(payload, null, 2),
    'application/json;charset=utf-8'
  );
}

export function exportDocumentAsCSV(doc: DocumentRecord) {
  const headers = ['Field Key', 'Field Label', 'Extracted Value', 'Confidence (%)', 'OCR Note'];
  const rows = doc.fields.map((f) => [
    f.key,
    f.label,
    f.value,
    String(f.confidence),
    f.ocrNote || '',
  ]);
  const csvContent =
    '\uFEFF' +
    [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')
      )
      .join('\n');
  triggerFileDownload(
    `${doc.applicationNumber.replaceAll('/', '_')}.csv`,
    csvContent,
    'text/csv;charset=utf-8'
  );
}

export function exportDocumentsReportCSV(docs: DocumentRecord[]) {
  const headers = [
    'Document ID',
    'Application Number',
    'Department',
    'Form Type',
    'Language',
    'Applicant Name',
    'Father Name',
    'Village',
    'District',
    'Date',
    'Status',
    'Overall Confidence (%)',
    'Synced',
  ];
  const rows = docs.map((d) => [
    d.id,
    d.applicationNumber,
    d.departmentName,
    d.formType,
    d.language,
    d.applicantName,
    d.fatherName,
    d.village,
    d.district,
    d.formDate,
    d.status,
    String(d.overallConfidence),
    d.syncedToCentral ? 'Yes' : 'Queued Offline',
  ]);
  const csvContent =
    '\uFEFF' +
    [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')
      )
      .join('\n');
  triggerFileDownload(
    `sarkar_ai_documents_report_${new Date().toISOString().slice(0, 10)}.csv`,
    csvContent,
    'text/csv;charset=utf-8'
  );
}

export async function downloadProjectSourceZip(): Promise<number> {
  const zip = new JSZip();

  // Bundle all frontend source files & root configs via Vite raw glob
  const sourceModules = import.meta.glob(
    ['/src/**/*.{ts,tsx,css}', '/index.html', '/package.json', '/tsconfig.json', '/vite.config.ts', '/.env.example', '/metadata.json'],
    { query: '?raw', import: 'default', eager: true }
  ) as Record<string, string>;

  let fileCount = 0;
  for (const [filePath, content] of Object.entries(sourceModules)) {
    const cleanPath = filePath.replace(/^\/+/, '');
    if (typeof content === 'string') {
      zip.file(cleanPath, content);
      fileCount += 1;
    }
  }

  zip.file(
    'README.md',
    `# SARKAR AI – Offline Intelligent Government Document Processing System

## Quick Start in VS Code
\`\`\`bash
npm install
npm run dev
\`\`\`

## Python FastAPI Backend Integration
1. Configure \`VITE_API_BASE_URL\` in \`.env\` (default: \`http://localhost:8000\`).
2. Switch from Demo Mode to FastAPI Mode inside **Settings** or set \`VITE_DEFAULT_MODE="fastapi"\`.
3. Implement the following endpoints in your FastAPI server:
   - \`POST /upload-document\`
   - \`POST /process-document\`
   - \`GET /departments\`
   - \`GET /documents\`
   - \`GET /documents/{id}\`
   - \`PUT /documents/{id}\`
   - \`GET /analytics\`
`
  );
  fileCount += 1;

  const blob = await zip.generateAsync({ type: 'blob' });
  triggerFileDownload('sarkar-ai-frontend-source.zip', blob, 'application/zip');
  return fileCount;
}
