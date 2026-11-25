import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Download,
  Eye,
  RotateCcw,
  CheckCircle2,
  FileJson,
  UploadCloud,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ConfidenceIndicator } from '../components/common/ConfidenceIndicator';
import {
  exportDocumentAsJSON,
  exportDocumentsReportCSV,
  triggerFileDownload,
} from '../services/documentService';

export const DocumentRecordsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    documents,
    departments,
    selectedDepartmentFilter,
    setSelectedDepartmentFilter,
    updateDocumentRecord,
    addHistoryEvent,
    user,
    backendMode,
    notify,
  } = useApp();

  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [confidenceFilter, setConfidenceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const filteredDocs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return documents.filter((doc) => {
      if (
        selectedDepartmentFilter !== 'all' &&
        doc.departmentId !== selectedDepartmentFilter
      ) {
        return false;
      }
      if (languageFilter !== 'all' && doc.language !== languageFilter) {
        return false;
      }
      if (confidenceFilter !== 'all' && doc.confidenceBand !== confidenceFilter) {
        return false;
      }
      if (statusFilter !== 'all' && doc.status !== statusFilter) {
        return false;
      }
      if (dateFilter && doc.formDate !== dateFilter && !doc.uploadedAt.startsWith(dateFilter)) {
        return false;
      }
      if (q) {
        const hay = [
          doc.applicationNumber,
          doc.applicantName,
          doc.fatherName,
          doc.village,
          doc.district,
          doc.departmentName,
          doc.formType,
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    documents,
    selectedDepartmentFilter,
    languageFilter,
    confidenceFilter,
    statusFilter,
    dateFilter,
    search,
  ]);

  const resetFilters = () => {
    setSearch('');
    setSelectedDepartmentFilter('all');
    setLanguageFilter('all');
    setConfidenceFilter('all');
    setStatusFilter('all');
    setDateFilter('');
  };

  const handleDownloadReportCSV = () => {
    exportDocumentsReportCSV(filteredDocs);
    addHistoryEvent({
      documentId: filteredDocs[0]?.id || 'report',
      applicationNumber: 'REPORT-CSV',
      departmentName: 'All Filtered',
      action: 'Exported',
      actor: user?.name || 'Officer',
      details: `Exported CSV report containing ${filteredDocs.length} document records.`,
      mode: backendMode === 'fastapi' ? 'FastAPI Live' : 'Demo Simulation',
    });
    notify(
      'Report Downloaded',
      `Exported ${filteredDocs.length} records to CSV.`,
      'success'
    );
  };

  const handleDownloadReportJSON = () => {
    triggerFileDownload(
      `sarkar_ai_records_${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(filteredDocs, null, 2),
      'application/json;charset=utf-8'
    );
    notify(
      'JSON Bundle Downloaded',
      `Exported ${filteredDocs.length} structured records.`,
      'success'
    );
  };

  const handleQuickVerify = async (docId: string) => {
    const target = documents.find((d) => d.id === docId);
    if (!target) return;
    await updateDocumentRecord(
      target.id,
      target.fields,
      'Verified',
      'Quick-verified from Document Management table.'
    );
    notify('Document Verified', `${target.applicationNumber} marked Verified.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Document Records
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Search, filter, verify, and export digitized handwritten government applications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadReportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Report</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadReportJSON}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/upload')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#0F294A] hover:bg-[#1E3A8A] text-white text-xs font-semibold whitespace-nowrap"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Form</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search app no., applicant, village, district..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
          </div>

          {/* Department */}
          <select
            aria-label="Filter by department"
            value={selectedDepartmentFilter}
            onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Language */}
          <select
            aria-label="Filter by language"
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
          >
            <option value="all">All Languages</option>
            <option value="Kannada">Kannada</option>
            <option value="English">English</option>
            <option value="Bilingual (KN + EN)">Bilingual (KN + EN)</option>
          </select>

          {/* Confidence */}
          <select
            aria-label="Filter by confidence"
            value={confidenceFilter}
            onChange={(e) => setConfidenceFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
          >
            <option value="all">All Confidence Bands</option>
            <option value="High">High (85%+)</option>
            <option value="Medium">Medium (65–84%)</option>
            <option value="Low">Low (&lt;65%)</option>
          </select>

          {/* Date */}
          <input
            type="date"
            aria-label="Filter by form date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-md">
            {['all', 'Verified', 'Pending Review', 'Low Confidence'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st === 'all' ? 'All Statuses' : st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-mono tabular-nums">
              Showing {filteredDocs.length} of {documents.length} records
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#1E3A8A] dark:text-blue-400 hover:underline"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>
      </section>

      {/* Documents Table */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        {filteredDocs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No document records match your current search or filter criteria.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 rounded-md bg-[#0F294A] text-white text-xs font-semibold"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">Application No.</th>
                  <th className="py-3 px-4">Applicant & Location</th>
                  <th className="py-3 px-4">Department & Form</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Status & Sync</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono tabular-nums font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {doc.applicationNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {doc.applicantName}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {doc.village} · {doc.district}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {doc.departmentName}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {doc.formType}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {doc.formDate}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {doc.language}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <ConfidenceIndicator score={doc.overallConfidence} showBar />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div
                        className={`font-medium ${
                          doc.status === 'Verified'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : doc.status === 'Low Confidence'
                              ? 'text-red-700 dark:text-red-400'
                              : 'text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {doc.status}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {doc.syncedToCentral ? 'Synced' : 'Local Queue'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/documents/${doc.id}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#0F294A] hover:bg-[#1E3A8A] text-white text-[11px] font-semibold"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Review</span>
                        </button>
                        {doc.status !== 'Verified' && (
                          <button
                            type="button"
                            onClick={() => handleQuickVerify(doc.id)}
                            title="Mark Verified"
                            aria-label={`Verify ${doc.applicationNumber}`}
                            className="p-1.5 rounded border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => exportDocumentAsJSON(doc)}
                          title="Download Record JSON"
                          aria-label={`Export JSON for ${doc.applicationNumber}`}
                          className="p-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
