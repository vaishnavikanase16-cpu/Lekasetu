import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { storageService } from '../services/storageService';
import { MONTHLY_TREND_SERIES } from '../data/mockData';

const OCR_COLORS = ['#15803D', '#D97706', '#DC2626'];

export const ReportsAnalyticsPage: React.FC = () => {
  const { documents, departments, canExport, notify } = useApp();
  const { t } = useLanguage();

  const metrics = useMemo(() => {
    const pendingVerif = documents.filter(
      (d) => d.workflowStage === 'Received' || d.workflowStage === 'Digitized'
    ).length;
    const overdue = documents.filter(
      (d) => d.workflowStage === 'Action Pending' || d.hasMissingFields
    ).length;
    const completed = documents.filter(
      (d) => d.workflowStage === 'Completed' || d.workflowStage === 'Verified'
    ).length;
    return { pendingVerif, overdue, completed };
  }, [documents]);

  const deptStats = useMemo(
    () =>
      departments.map((d) => {
        const list = documents.filter((doc) => doc.departmentId === d.id);
        return {
          name: t(d.nameKey).replace(' Department', '').replace(' ಇಲಾಖೆ', ''),
          processed: list.length,
          verified: list.filter(
            (doc) =>
              doc.workflowStage === 'Verified' || doc.workflowStage === 'Completed'
          ).length,
        };
      }),
    [departments, documents, t]
  );

  const ocrBreakdown = useMemo(() => {
    let high = 0;
    let review = 0;
    let missing = 0;
    documents.forEach((doc) => {
      doc.fields.forEach((f) => {
        if (f.reviewState === 'HighConfidence') high += 1;
        else if (f.reviewState === 'NeedsHumanReview') review += 1;
        else missing += 1;
      });
    });
    return [
      { name: t('review.HighConfidence'), value: high },
      { name: t('review.NeedsHumanReview'), value: review },
      { name: t('review.MissingOrInvalid'), value: missing },
    ];
  }, [documents, t]);

  const handleExport = () => {
    if (!canExport) {
      notify(t('reports.title'), t('common.permissionDenied'), 'warning');
      return;
    }
    storageService.exportDocumentsCsv(documents);
    notify(t('reports.exportReport'), `${documents.length} records`, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0B2545]">
            {t('reports.title')}
          </h1>
          <p className="text-sm text-slate-600 mt-1">{t('reports.subtitle')}</p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B2545] hover:bg-[#13315C] text-white text-xs font-semibold whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t('reports.exportReport')}</span>
        </button>
      </div>

      {/* KPI Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-xs">
          <div className="text-xs text-slate-500">{t('reports.dailyIntake')}</div>
          <div className="font-mono tabular-nums text-2xl font-bold text-[#0B2545] mt-2">
            {documents.length}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-xs">
          <div className="text-xs text-slate-500">{t('reports.weeklyProc')}</div>
          <div className="font-mono tabular-nums text-2xl font-bold text-[#0B2545] mt-2">
            376
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-xs">
          <div className="text-xs text-slate-500">{t('dash.statPendingVerif')}</div>
          <div className="font-mono tabular-nums text-2xl font-bold text-amber-700 mt-2">
            {metrics.pendingVerif}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-xs">
          <div className="text-xs text-slate-500">{t('reports.overdueTasks')}</div>
          <div className="font-mono tabular-nums text-2xl font-bold text-red-700 mt-2">
            {metrics.overdue}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-xs">
          <div className="text-xs text-slate-500">{t('reports.completedRecords')}</div>
          <div className="font-mono tabular-nums text-2xl font-bold text-emerald-700 mt-2">
            {metrics.completed}
          </div>
        </div>
      </section>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-indigo-100 p-5 shadow-xs">
          <h2 className="font-display text-base font-bold text-[#0B2545] mb-4">
            {t('reports.deptStats')}
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptStats} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#64748B" />
                <YAxis tick={{ fontSize: 11 }} stroke="#64748B" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="processed" name={t('dash.chartProcessed')} fill="#0B2545" radius={[4, 4, 0, 0]} />
                <Bar dataKey="verified" name={t('dash.chartVerified')} fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-2xl border border-indigo-100 p-5 shadow-xs">
          <h2 className="font-display text-base font-bold text-[#0B2545] mb-4">
            {t('reports.ocrStats')}
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ocrBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={88}
                  paddingAngle={2}
                >
                  {ocrBreakdown.map((entry, idx) => (
                    <Cell key={entry.name} fill={OCR_COLORS[idx % OCR_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Processing Summary */}
      <div className="bg-white rounded-2xl border border-indigo-100 p-5 shadow-xs">
        <h2 className="font-display text-base font-bold text-[#0B2545] mb-4">
          {t('reports.monthlyProc')}
        </h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY_TREND_SERIES}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#64748B" />
              <YAxis tick={{ fontSize: 11 }} stroke="#64748B" />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="processed" name={t('dash.chartProcessed')} fill="#13315C" radius={[4, 4, 0, 0]} />
              <Bar dataKey="verified" name={t('dash.chartVerified')} fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
