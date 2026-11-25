import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { triggerFileDownload } from '../services/documentService';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { history, notify } = useApp();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return history.filter((item) => {
      if (actionFilter !== 'all' && item.action !== actionFilter) return false;
      if (q) {
        const hay = [
          item.applicationNumber,
          item.departmentName,
          item.actor,
          item.details,
          item.action,
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [history, search, actionFilter]);

  const handleExportAuditLog = () => {
    triggerFileDownload(
      `sarkar_ai_audit_history_${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(filtered, null, 2),
      'application/json;charset=utf-8'
    );
    notify('Audit Log Exported', `Exported ${filtered.length} history events.`, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Processing History & Audit Log
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Immutable chronological log of document uploads, OCR runs, manual corrections,
            verifications, and central sync batches.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportAuditLog}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit JSON</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search application number, officer, or event..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-md overflow-x-auto">
          {['all', 'Uploaded', 'OCR Processed', 'Field Edited', 'Verified', 'Exported', 'Synced'].map(
            (act) => (
              <button
                key={act}
                type="button"
                onClick={() => setActionFilter(act)}
                className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                  actionFilter === act
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {act === 'all' ? 'All Events' : act}
              </button>
            )
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No processing events match the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Application / Dept</th>
                  <th className="py-3 px-4">Actor & Mode</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4 text-right">Record</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {filtered.map((ev) => (
                  <tr
                    key={ev.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {new Date(ev.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {ev.action}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono text-slate-900 dark:text-slate-100">
                        {ev.applicationNumber}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {ev.departmentName}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-slate-800 dark:text-slate-200">{ev.actor}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {ev.mode}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-md">
                      {ev.details}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {ev.documentId !== 'system' && ev.documentId !== 'report' && (
                        <button
                          type="button"
                          onClick={() => navigate(`/documents/${ev.documentId}`)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E3A8A] dark:text-blue-400 hover:underline"
                        >
                          <span>Open</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
