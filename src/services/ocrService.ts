import { API_CONFIG } from '../config/apiConfig';
import { LEKHA_ASSETS } from '../data/mockData';
import {
  BackendMode,
  DepartmentId,
  ExtractedField,
  InputLanguageMode,
  LekhaDocument,
} from '../types';

export interface IntakePayload {
  file: File | null;
  previewUrl: string;
  fileName: string;
  fileType: 'image/jpeg' | 'image/png' | 'application/pdf';
  departmentId: Exclude<DepartmentId, 'all'>;
  category: string;
  officeName: string;
  inputLanguage: InputLanguageMode;
  assignedTo: string;
}

/**
 * Independent OCR Service:
 * Keeps local OCR simulation and Python FastAPI PaddleOCR / Indic-TrOCR integration
 * decoupled from React UI components.
 */
export const ocrService = {
  async runDocumentTransformation(
    payload: IntakePayload,
    backendMode: BackendMode,
    apiBaseUrl: string
  ): Promise<LekhaDocument> {
    if (backendMode === 'fastapi') {
      const formData = new FormData();
      if (payload.file) {
        formData.append('file', payload.file);
      }
      formData.append('department_id', payload.departmentId);
      formData.append('category', payload.category);
      formData.append('language', payload.inputLanguage);
      formData.append('office_name', payload.officeName);

      const uploadRes = await fetch(
        `${apiBaseUrl.replace(/\/+$/, '')}${API_CONFIG.ENDPOINTS.UPLOAD_DOCUMENT}`,
        { method: 'POST', body: formData }
      );
      if (!uploadRes.ok) {
        throw new Error(`FastAPI upload failed (${uploadRes.status})`);
      }
      const { document_id } = (await uploadRes.json()) as { document_id: string };

      const procRes = await fetch(
        `${apiBaseUrl.replace(/\/+$/, '')}${API_CONFIG.ENDPOINTS.PROCESS_DOCUMENT}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            document_id,
            language: payload.inputLanguage,
          }),
        }
      );
      if (!procRes.ok) {
        throw new Error(`FastAPI OCR processing failed (${procRes.status})`);
      }
      const processed = (await procRes.json()) as LekhaDocument;
      return { ...processed, ocrSource: 'FastAPI Local OCR' };
    }

    // Simulated local Kannada/English OCR demonstration (never pretends to be real model confidence)
    return buildSimulatedExtraction(payload);
  },
};

function buildSimulatedExtraction(payload: IntakePayload): LekhaDocument {
  const nowIso = new Date().toISOString();
  const refPrefix =
    payload.departmentId === 'police'
      ? 'POL/BLG'
      : payload.departmentId === 'revenue'
        ? 'REV/KA'
        : payload.departmentId === 'gram_panchayat'
          ? 'GP/KA'
          : payload.departmentId === 'hospitals'
            ? 'HLT/KA'
            : payload.departmentId === 'education'
              ? 'EDU/KA'
              : 'MUN/KA';

  const refNum = `${refPrefix}/2026/${Math.floor(1100 + Math.random() * 8800)}`;

  let applicantName = 'Suresh Babu K. (ಸುರೇಶ್ ಬಾಬು ಕೆ.)';
  let fatherName = 'Krishnappa K.';
  let address = 'No. 18, Temple Street, Belagavi';
  let village = 'Shahapur';
  let district = 'Belagavi';
  let contactNumber = '9845123456';
  let recognizedText = '';
  let fields: ExtractedField[] = [];

  if (payload.previewUrl === LEKHA_ASSETS.POLICE_SCAN) {
    applicantName = 'Mallikarjun Patil (ಮಲ್ಲಿಕಾರ್ಜುನ ಪಾಟೀಲ)';
    address = 'Plot No. 45, Near Hanuman Temple, Shahapur, Belagavi';
    village = 'Shahapur 1st Cross';
    district = 'Belagavi';
    contactNumber = '9845X XXX55';
    recognizedText =
      'To, The Inspector of Police, Camp Police Station, Belagavi.\nSubject: Complaint Regarding Regular Public Nuisance and Misconduct in Our Locality.\nI, Mallikarjun Patil, resident of Plot No. 45, Near Hanuman Temple, Shahapur, Belagavi...\nನಮಸ್ಕಾರ ಸಾರ್, ಬೆಳಗಾವಿಯ ಶಾಹಾಪುರ ಹನುಮಾನ್ ದೇವಸ್ಥಾನದ ಹತ್ತಿರವಿರುವ ಪ್ಲಾಟ್ ನಂ. 45ರಲ್ಲಿ ವಾಸವಿರುವ ಮಲ್ಲಿಕಾರ್ಜುನ ಪಾಟೀಲ ಎಂಬ ನಾನು ಸಾರ್ವಜನಿಕ ಶಾಂತಿಭಂಗದ ಬಗ್ಗೆ ದೂರು ಸಲ್ಲಿಸುತ್ತಿದ್ದೇನೆ.';
    fields = [
      { key: 'referenceNumber', labelKey: 'field.referenceNumber', value: refNum, reviewState: 'HighConfidence', required: true },
      { key: 'applicantName', labelKey: 'field.applicantName', value: applicantName, reviewState: 'HighConfidence', required: true },
      { key: 'station', labelKey: 'field.station', value: payload.officeName, reviewState: 'HighConfidence', required: true },
      { key: 'address', labelKey: 'field.address', value: address, reviewState: 'HighConfidence', required: true },
      { key: 'village', labelKey: 'field.village', value: village, reviewState: 'HighConfidence' },
      { key: 'district', labelKey: 'field.district', value: district, reviewState: 'HighConfidence', required: true },
      { key: 'contactNumber', labelKey: 'field.contactNumber', value: contactNumber, reviewState: 'NeedsHumanReview', issueNoteKey: 'Masked phone digits detected; confirm full number' },
      { key: 'reason', labelKey: 'field.reason', value: 'Public nuisance & late-night gathering (7 PM - 1 AM)', reviewState: 'HighConfidence' },
    ];
  } else if (payload.previewUrl === LEKHA_ASSETS.REVENUE_SCAN) {
    applicantName = 'Ravi Kumar B. (ರವಿ ಕುಮಾರ್ ಬಿ.)';
    fatherName = 'B. Nagaraj (ಬಿ. ನಾಗರಾಜ್)';
    address = 'No. 45, 3rd Main, Hosakote, Bangalore Rural';
    village = 'Hullahalli (ಹುಲ್ಲಹಳ್ಳಿ)';
    district = 'Bengaluru Rural';
    recognizedText =
      'ಕರ್ನಾಟಕ ಸರ್ಕಾರ – ಕಂದಾಯ ಇಲಾಖೆ (Form 7)\nApplicant: RAVI KUMAR B. / ರವಿ ಕುಮಾರ್ ಬಿ.\nFather: B. NAGARAJ / ಬಿ. ನಾಗರಾಜ್\nAddress: No. 45, 3rd Main, Hosakote, Bangalore Rural\nVillage: Hullahalli / ಹುಲ್ಲಹಳ್ಳಿ · Survey No: 14/2A · Extent: 2 Acres 10 Guntas\nService: ಪಹಣಿ ವರ್ಗಾವಣೆ / Inheritance (ವಾರಸುದಾರಿಕೆ)';
    fields = [
      { key: 'referenceNumber', labelKey: 'field.referenceNumber', value: refNum, reviewState: 'HighConfidence', required: true },
      { key: 'applicantName', labelKey: 'field.applicantName', value: applicantName, reviewState: 'HighConfidence', required: true },
      { key: 'fatherName', labelKey: 'field.fatherName', value: fatherName, reviewState: 'HighConfidence', required: true },
      { key: 'address', labelKey: 'field.address', value: address, reviewState: 'HighConfidence', required: true },
      { key: 'village', labelKey: 'field.village', value: village, reviewState: 'HighConfidence', required: true },
      { key: 'district', labelKey: 'field.district', value: district, reviewState: 'HighConfidence', required: true },
      { key: 'surveyNumber', labelKey: 'field.surveyNumber', value: '14/2A', reviewState: 'NeedsHumanReview', issueNoteKey: 'Verify handwritten Dry/Drain checkbox', required: true },
      { key: 'reason', labelKey: 'field.reason', value: 'Inheritance (ವಾರಸುದಾರಿಕೆ)', reviewState: 'NeedsHumanReview', issueNoteKey: 'Office stamp overlaps lower signature margin' },
    ];
  } else {
    if (payload.inputLanguage === 'Kannada') {
      applicantName = 'ರಮೇಶ್ ಎಸ್. ಪಾಟೀಲ';
      fatherName = 'ಶಿವಪ್ಪ ಪಾಟೀಲ';
      address = 'ನಂ. 24, ಮಹಾಂತ ನಗರ, ಬೆಳಗಾವಿ';
      village = 'ಮಹಾಂತ ನಗರ ವಾರ್ಡ್ 6';
    }
    recognizedText = `LEKHASETU Simulated OCR Extract (${payload.inputLanguage})\nCategory: ${payload.category}\nApplicant: ${applicantName}\nGuardian: ${fatherName}\nAddress: ${address}\nOffice: ${payload.officeName}`;
    fields = [
      { key: 'referenceNumber', labelKey: 'field.referenceNumber', value: refNum, reviewState: 'HighConfidence', required: true },
      { key: 'applicantName', labelKey: 'field.applicantName', value: applicantName, reviewState: 'HighConfidence', required: true },
      { key: 'fatherName', labelKey: 'field.fatherName', value: fatherName, reviewState: 'NeedsHumanReview', issueNoteKey: 'Verify spelling against original handwriting' },
      { key: 'contactNumber', labelKey: 'field.contactNumber', value: contactNumber, reviewState: 'HighConfidence' },
      { key: 'address', labelKey: 'field.address', value: address, reviewState: 'NeedsHumanReview', issueNoteKey: 'Confirm door number and PIN code', required: true },
      { key: 'village', labelKey: 'field.village', value: village, reviewState: 'HighConfidence' },
      { key: 'district', labelKey: 'field.district', value: district, reviewState: 'HighConfidence', required: true },
    ];
  }

  const needsReviewCount = fields.filter((f) => f.reviewState !== 'HighConfidence').length;
  const hasMissingFields = fields.some(
    (f) => f.reviewState === 'MissingOrInvalid' || !f.value.trim()
  );

  return {
    id: `doc-${Date.now()}`,
    referenceNumber: refNum,
    title: `${payload.category} – ${district}`,
    departmentId: payload.departmentId,
    category: payload.category,
    officeName: payload.officeName,
    district,
    village,
    applicantName,
    contactNumber,
    address,
    inputLanguage: payload.inputLanguage,
    createdAt: nowIso,
    updatedAt: nowIso,
    fileName: payload.fileName,
    fileType: payload.fileType,
    imageUrl: payload.previewUrl,
    recognizedText,
    workflowStage: 'Digitized',
    assignedTo: payload.assignedTo,
    ocrSource: 'Sample Simulation',
    hasMissingFields,
    needsReviewCount,
    attachments: [payload.fileName],
    fields,
    correctionHistory: [],
  };
}
