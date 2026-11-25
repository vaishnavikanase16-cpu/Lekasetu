export type AppLanguage = 'en' | 'kn';

export type UserRole =
  | 'Administrator'
  | 'Officer'
  | 'Data Entry Operator'
  | 'Reviewer';

export type DepartmentId =
  | 'all'
  | 'police'
  | 'gram_panchayat'
  | 'revenue'
  | 'hospitals'
  | 'education'
  | 'municipal';

export type WorkflowStage =
  | 'Received'
  | 'Digitized'
  | 'Verified'
  | 'Assigned'
  | 'Action Pending'
  | 'Completed';

export type FieldReviewState =
  | 'HighConfidence'
  | 'NeedsHumanReview'
  | 'MissingOrInvalid';

export type InputLanguageMode = 'Kannada' | 'English' | 'Both';

export type BackendMode = 'demo' | 'fastapi';

export interface ExtractedField {
  key: string;
  labelKey: string;
  customLabel?: string;
  value: string;
  reviewState: FieldReviewState;
  modelConfidence?: number; // Only populated if returned by OCR backend
  issueNoteKey?: string;
  customIssueNote?: string;
  required?: boolean;
}

export interface CorrectionEntry {
  id: string;
  timestamp: string;
  officerName: string;
  fieldKey: string;
  previousValue: string;
  updatedValue: string;
  actionType: 'Edited' | 'Verified' | 'Returned';
  note?: string;
}

export interface LekhaDocument {
  id: string;
  referenceNumber: string;
  title: string;
  departmentId: Exclude<DepartmentId, 'all'>;
  category: string;
  officeName: string;
  district: string;
  village: string;
  applicantName: string;
  contactNumber: string;
  address: string;
  inputLanguage: InputLanguageMode;
  createdAt: string;
  updatedAt: string;
  fileName: string;
  fileType: 'image/jpeg' | 'image/png' | 'application/pdf';
  imageUrl: string;
  recognizedText: string;
  workflowStage: WorkflowStage;
  assignedTo: string;
  ocrSource: 'Sample Simulation' | 'FastAPI Local OCR';
  hasMissingFields: boolean;
  needsReviewCount: number;
  fields: ExtractedField[];
  attachments: string[];
  correctionHistory: CorrectionEntry[];
}

export interface PoliceComplaintRecord {
  id: string;
  internalRefNumber: string;
  policeStation: string;
  submittedAt: string;
  complainantName: string;
  contactNumber: string;
  address: string;
  incidentDate: string;
  incidentLocation: string;
  inputMode: InputLanguageMode;
  narrativeEn: string;
  narrativeKn: string;
  supportingDocs: string[];
  status: 'Draft' | 'Submitted for Officer Review' | 'Verified';
  createdBy: string;
}

export interface DepartmentConfig {
  id: Exclude<DepartmentId, 'all'>;
  nameKey: string;
  iconName: string;
  categories: string[];
  configurableFields: string[];
  workflowStages: WorkflowStage[];
  accentHex: string;
}

export interface AppNotification {
  id: string;
  type:
    | 'new_document'
    | 'awaiting_verification'
    | 'task_assigned'
    | 'document_returned'
    | 'task_completed';
  titleKey: string;
  message: string;
  timestamp: string;
  read: boolean;
  documentId?: string;
  departmentId?: Exclude<DepartmentId, 'all'>;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  action: 'Created' | 'Modified' | 'Status Changed' | 'Verified' | 'Returned' | 'Exported' | 'Deleted' | 'Backup';
  targetRef: string;
  departmentId: DepartmentId;
  previousValue?: string;
  updatedValue?: string;
  details: string;
}

export interface OfficerProfile {
  id: string;
  name: string;
  nameKn: string;
  role: UserRole;
  departmentId: DepartmentId;
  office: string;
  employeeId: string;
  avatarUrl: string;
}

export interface RagQueryResult {
  answer: string;
  matchedDocuments: LekhaDocument[];
  matchedComplaints: PoliceComplaintRecord[];
  found: boolean;
  architectureNote: string;
}
