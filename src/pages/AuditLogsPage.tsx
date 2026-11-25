import React, { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { downloadBlob } from '../services/storageService';

export const AuditLogsPage: React.FC = () => {
  const { auditLogs, canExport, notify } = useApp();
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return auditLogs;
    return auditLogs.filter((l) =>
      [l.actor, l.action, l.targetRef, l.details]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [auditLogs, search]);

  const handleExportAudit = () => {
    if (!canExport) {
      notify(t('audit.title'), t('common.permissionDenied'), 'warning');
      return;
    }
    const headers = ['Timestamp', 'Actor', 'Role', 'Action', 'Target', 'Previous', 'Updated', 'Details'];
    const rows = filtered.map((l) => [
      l.timestamp,
      l.actor,
      l.role,
      l.action,
      l.targetRef,
      l.previousValue || '',
      l.updatedValue || '',
      l.details,
    ]);
    const csv =
      '\uFEFF' +
      [headers, ...rows]
        .map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(','))
        .join('\n');
    downloadBlob(
      `lekhasetu_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`,
      csv,
      'text/csv;charset=utf-8'
    );
    notify(t('audit.exportAudit'), `${filtered.length} logs`, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0B2545]">
            {t('audit.title')}
          </h1>
          <p className="text-sm text-slate-600 mt-1">{t('audit.subtitle')}</p>
        </div>

        <button
          type="button"
          onClick={handleExportAudit}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B2545] hover:bg-[#13315C] text-white text-xs font-semibold whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t('audit.exportAudit')}</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-indigo-100 p-4 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('files.searchName')}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#F3F4FA] border border-indigo-100"
          />
        </div>
      </div>

      <section className="bg-white rounded-2xl border border-indigo-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-indigo-100 bg-[#F8F9FD] text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">{t('audit.actor')}</th>
                <th className="py-3 px-4">{t('audit.action')}</th>
                <th className="py-3 px-4">{t('audit.target')}</th>
                <th className="py-3 px-4">{t('audit.prevNew')}</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-50 text-xs">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-[#F8F9FD]">
                  <td className="py-3 px-4 font-mono tabular-nums text-slate-500 whitespace-nowrap">
                    {new Date(l.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{l.actor}</div>
                    <div className="text-[11px] text-slate-500">
                      {t(`role.${l.role}`)}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#2563EB] whitespace-nowrap">
                    {l.action}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#0B2545] whitespace-nowrap">
                    {l.targetRef}
                  </td>
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                    {l.previousValue || l.updatedValue
                      ? `${l.previousValue || '—'} → ${l.updatedValue || '—'}`
                      : '—'}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-md">{l.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
