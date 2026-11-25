import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Download,
  FileSpreadsheet,
  Eye,
  Trash2,
  RotateCcw,
  UserCheck,
  ArrowRight,
  Paperclip,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { OFFICER_PROFILES } from '../data/mockData';
import { storageService } from '../services/storageService';
import { LekhaDocument, WorkflowStage } from '../types';

const WORKFLOW_STAGES: WorkflowStage[] = [
  'Received',
  'Digitized',
  'Verified',
  'Assigned',
  'Action Pending',
  'Completed',
];

interface FileManagementPageProps {
  trackingMode?: boolean;
}

export const FileManagementPage: React.FC<FileManagementPageProps> = ({
  trackingMode = false,
}) => {
  const navigate = useNavigate();
  const {
    documents,
    departments,
    selectedDepartment,
    assignDocumentOfficer,
    advanceWorkflowStage,
    deleteDocument,
    canDelete,
    canExport,
    activeProfile,
    addAuditEvent,
    notify,
  } = useApp();
  const { t } = useLanguage();

  const [nameQuery, setNameQuery] = useState('');
  const [villageQuery, setVillageQuery] = useState('');
  const [refQuery, setRefQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>(selectedDepartment);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');

  const [detailDoc, setDetailDoc] = useState<LekhaDocument | null>(null);
  const [confirmDeleteDoc, setConfirmDeleteDoc] = useState<LekhaDocument | null>(
    null
  );

  const allCategories = useMemo(
    () => Array.from(new Set(documents.map((d) => d.category))),
    [documents]
  );

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      if (deptFilter !== 'all' && doc.departmentId !== deptFilter) return false;
      if (categoryFilter !== 'all' && doc.category !== categoryFilter) return false;
      if (stageFilter !== 'all' && doc.workflowStage !== stageFilter) return false;
      if (dateFilter && !doc.createdAt.startsWith(dateFilter)) return false;
      if (
        nameQuery.trim() &&
        !`${doc.applicantName} ${doc.title}`
          .toLowerCase()
          .includes(nameQuery.trim().toLowerCase())
      ) {
        return false;
      }
      if (
        villageQuery.trim() &&
        !`${doc.village} ${doc.district}`
          .toLowerCase()
          .includes(villageQuery.trim().toLowerCase())
      ) {
        return false;
      }
      if (
        refQuery.trim() &&
        !doc.referenceNumber
          .toLowerCase()
          .includes(refQuery.trim().toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [
    documents,
    deptFilter,
    categoryFilter,
    stageFilter,
    dateFilter,
    nameQuery,
    villageQuery,
    refQuery,
  ]);

  const handleExportCsv = () => {
    if (!canExport) {
      notify(t('files.exportCsv'), t('common.permissionDenied'), 'warning');
      return;
    }
    storageService.exportDocumentsCsv(filtered);
    addAuditEvent({
      actor: activeProfile.name,
      role: activeProfile.role,
      action: 'Exported',
      targetRef: `CSV (${filtered.length} records)`,
      departmentId: selectedDepartment,
      details: `Exported ${filtered.length} records to CSV.`,
    });
    notify(t('files.exportCsv'), `${filtered.length} records`, 'success');
  };

  const handleExportExcel = () => {
    if (!canExport) {
      notify(t('files.exportExcel'), t('common.permissionDenied'), 'warning');
      return;
    }
    storageService.exportDocumentsExcel(filtered);
    addAuditEvent({
      actor: activeProfile.name,
      role: activeProfile.role,
      action: 'Exported',
      targetRef: `XLS (${filtered.length} records)`,
      departmentId: selectedDepartment,
      details: `Exported ${filtered.length} records to Excel.`,
    });
    notify(t('files.exportExcel'), `${filtered.length} records`, 'success');
  };

  const resetAll = () => {
    setNameQuery('');
    setVillageQuery('');
    setRefQuery('');
    setDeptFilter('all');
    setCategoryFilter('all');
    setDateFilter('');
    setStageFilter('all');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0B2545]">
            {trackingMode ? t('nav.tracking') : t('files.title')}
          </h1>
          <p className="text-sm text-slate-600 mt-1">{t('files.subtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200 bg-white hover:bg-[#F3F4FA] text-xs font-semibold text-[#0B2545]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('files.exportCsv')}</span>
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0B2545] hover:bg-[#13315C] text-white text-xs font-semibold"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{t('files.exportExcel')}</span>
          </button>
        </div>
      </div>

      {/* Workflow Stage Pipeline Summary (highlighted on Tracking view) */}
      <section className="bg-white rounded-2xl border border-indigo-100 p-4 shadow-xs">
        <div className="text-xs font-bold text-[#0B2545] mb-3">
          {t('files.workflowTitle')}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {WORKFLOW_STAGES.map((stage) => {
            const count = documents.filter((d) => d.workflowStage === stage).length;
            const active = stageFilter === stage;
            return (
              <button
                key={stage}
                type="button"
                onClick={() => setStageFilter(active ? 'all' : stage)}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  active
                    ? 'bg-[#0B2545] text-white border-[#0B2545]'
                    : 'bg-[#F8F9FD] hover:bg-blue-50 border-indigo-100 text-slate-800'
                }`}
              >
                <div className="text-[11px] font-medium opacity-80">
                  {t(`stage.${stage}`)}
                </div>
                <div className="font-mono tabular-nums text-xl font-bold mt-1">
                  {count}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Search & Multi-Field Filter Bar */}
      <section className="bg-white rounded-2xl border border-indigo-100 p-4 space-y-3 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={nameQuery}
              onChange={(e) => setNameQuery(e.target.value)}
              placeholder={t('files.searchName')}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-[#F3F4FA] border border-indigo-100"
            />
          </div>

          <input
            type="text"
            value={villageQuery}
            onChange={(e) => setVillageQuery(e.target.value)}
            placeholder={t('files.filterVillage')}
            className="px-3 py-2 text-xs rounded-xl bg-[#F3F4FA] border border-indigo-100"
          />

          <input
            type="text"
            value={refQuery}
            onChange={(e) => setRefQuery(e.target.value)}
            placeholder={t('files.filterRef')}
            className="px-3 py-2 text-xs font-mono rounded-xl bg-[#F3F4FA] border border-indigo-100"
          />

          <select
            aria-label={t('files.filterDept')}
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-[#F3F4FA] border border-indigo-100"
          >
            <option value="all">{t('dept.all')}</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {t(d.nameKey)}
              </option>
            ))}
          </select>

          <select
            aria-label={t('files.filterCategory')}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-[#F3F4FA] border border-indigo-100"
          >
            <option value="all">{t('common.all')}</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <input
              type="date"
              aria-label={t('files.filterDate')}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="flex-1 min-w-0 px-2.5 py-2 text-xs rounded-xl bg-[#F3F4FA] border border-indigo-100"
            />
            <button
              type="button"
              onClick={resetAll}
              title={t('files.resetFilters')}
              className="p-2 rounded-xl border border-indigo-100 hover:bg-[#F3F4FA] text-slate-600"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Records Table */}
      <section className="bg-white rounded-2xl border border-indigo-100 overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            {t('common.noResults')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-indigo-100 bg-[#F8F9FD] text-[11px] font-semibold text-slate-500">
                  <th className="py-3 px-4">{t('field.referenceNumber')}</th>
                  <th className="py-3 px-4">{t('field.applicantName')}</th>
                  <th className="py-3 px-4">{t('files.filterDept')}</th>
                  <th className="py-3 px-4">{t('files.assignTask')}</th>
                  <th className="py-3 px-4">{t('common.status')}</th>
                  <th className="py-3 px-4 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-50 text-xs">
                {filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#F8F9FD]">
                    <td className="py-3 px-4 font-mono font-semibold text-[#0B2545] whitespace-nowrap">
                      {doc.referenceNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {doc.applicantName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {doc.village} · {doc.district}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">
                        {t(`dept.${doc.departmentId}`)}
                      </div>
                      <div className="text-[11px] text-slate-500">{doc.category}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        aria-label={`${t('files.assignTask')} ${doc.referenceNumber}`}
                        value={doc.assignedTo}
                        onChange={(e) =>
                          assignDocumentOfficer(doc.id, e.target.value)
                        }
                        className="px-2 py-1 text-xs rounded-lg bg-[#F3F4FA] border border-indigo-100 text-slate-800"
                      >
                        {OFFICER_PROFILES.map((p) => (
                          <option key={p.id} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        aria-label={`${t('files.updateStage')} ${doc.referenceNumber}`}
                        value={doc.workflowStage}
                        onChange={(e) =>
                          advanceWorkflowStage(
                            doc.id,
                            e.target.value as WorkflowStage
                          )
                        }
                        className="px-2 py-1 text-xs font-semibold rounded-lg bg-blue-50 border border-indigo-200 text-[#0B2545]"
                      >
                        {WORKFLOW_STAGES.map((st) => (
                          <option key={st} value={st}>
                            {t(`stage.${st}`)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailDoc(doc)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-indigo-200 hover:bg-[#F3F4FA] text-[11px] font-semibold text-[#0B2545]"
                        >
                          <Eye className="w-3 h-3" />
                          <span>{t('police.preview')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/verification/${doc.id}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0B2545] hover:bg-[#13315C] text-white text-[11px] font-semibold"
                        >
                          <span>{t('files.openFile')}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteDoc(doc)}
                            title={t('files.deleteRecord')}
                            aria-label={t('files.deleteRecord')}
                            className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Detail Modal: Original Scan, Fields, Attachments & History */}
      {detailDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-indigo-100 max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-mono text-xs text-[#2563EB]">
                  {detailDoc.referenceNumber} · {t(`stage.${detailDoc.workflowStage}`)}
                </div>
                <h3 className="font-display text-lg font-bold text-[#0B2545]">
                  {detailDoc.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailDoc(null)}
                aria-label={t('common.close')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl bg-[#EEF1FA] p-3 flex items-center justify-center">
                <img
                  src={detailDoc.imageUrl}
                  alt={detailDoc.referenceNumber}
                  referrerPolicy="no-referrer"
                  className="max-h-72 object-contain rounded-lg bg-white"
                />
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1.5">
                  {detailDoc.fields.map((f) => (
                    <div
                      key={f.key}
                      className="flex justify-between gap-2 py-1 border-b border-indigo-50"
                    >
                      <span className="text-slate-500">{t(f.labelKey)}</span>
                      <span className="font-semibold text-slate-900 text-right">
                        {f.value || '—'}
                      </span>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="font-bold text-[#0B2545] mb-1 flex items-center gap-1">
                    <Paperclip className="w-3.5 h-3.5" /> {t('files.attachments')}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {detailDoc.attachments.map((att) => (
                      <span
                        key={att}
                        className="px-2 py-1 rounded bg-[#F3F4FA] font-mono text-[11px] text-slate-700"
                      >
                        {att}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>
                    {t('files.assignTask')}: {detailDoc.assignedTo}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-red-200 max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-display text-base font-bold text-slate-900">
              {t('files.deleteRecord')} · {confirmDeleteDoc.referenceNumber}
            </h3>
            <p className="text-xs text-slate-600">{confirmDeleteDoc.title}</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteDoc(null)}
                className="px-4 py-2 rounded-xl border border-indigo-100 text-xs font-semibold text-slate-700"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteDocument(confirmDeleteDoc.id);
                  setConfirmDeleteDoc(null);
                  notify(t('files.deleteRecord'), confirmDeleteDoc.referenceNumber, 'info');
                }}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold"
              >
                {t('common.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
