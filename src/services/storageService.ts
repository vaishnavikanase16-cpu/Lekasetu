import { LekhaDocument, PoliceComplaintRecord } from '../types';

export function downloadBlob(filename: string, content: BlobPart, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const storageService = {
  exportDocumentsCsv(docs: LekhaDocument[]) {
    const headers = [
      'Reference Number',
      'Department',
      'Category',
      'Office',
      'Applicant Name',
      'Contact',
      'Village',
      'District',
      'Address',
      'Language',
      'Workflow Stage',
      'Assigned To',
      'Updated At',
    ];
    const rows = docs.map((d) => [
      d.referenceNumber,
      d.departmentId,
      d.category,
      d.officeName,
      d.applicantName,
      d.contactNumber,
      d.village,
      d.district,
      d.address,
      d.inputLanguage,
      d.workflowStage,
      d.assignedTo,
      d.updatedAt,
    ]);
    const csv =
      '\uFEFF' +
      [headers, ...rows]
        .map((r) => r.map((c) => `"${String(c ?? '').replaceAll('"', '""')}"`).join(','))
        .join('\n');
    downloadBlob(
      `lekhasetu_records_${new Date().toISOString().slice(0, 10)}.csv`,
      csv,
      'text/csv;charset=utf-8'
    );
  },

  exportDocumentsExcel(docs: LekhaDocument[]) {
    const tableRows = docs
      .map(
        (d) =>
          `<tr><td>${escapeHtml(d.referenceNumber)}</td><td>${escapeHtml(
            d.departmentId
          )}</td><td>${escapeHtml(d.category)}</td><td>${escapeHtml(
            d.applicantName
          )}</td><td>${escapeHtml(d.district)}</td><td>${escapeHtml(
            d.workflowStage
          )}</td><td>${escapeHtml(d.assignedTo)}</td></tr>`
      )
      .join('');
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body><table border="1"><thead><tr><th>Reference</th><th>Department</th><th>Category</th><th>Applicant</th><th>District</th><th>Stage</th><th>Assigned To</th></tr></thead><tbody>${tableRows}</tbody></table></body></html>`;
    downloadBlob(
      `lekhasetu_records_${new Date().toISOString().slice(0, 10)}.xls`,
      html,
      'application/vnd.ms-excel;charset=utf-8'
    );
  },

  exportFullBackupJson(payload: {
    documents: LekhaDocument[];
    complaints: PoliceComplaintRecord[];
    exportedAt: string;
  }) {
    downloadBlob(
      `lekhasetu_sqlite_backup_${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(payload, null, 2),
      'application/json;charset=utf-8'
    );
  },
};

function escapeHtml(str: string): string {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
