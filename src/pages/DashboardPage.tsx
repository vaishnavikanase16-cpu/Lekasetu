import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  Database,
  Clock,
  AlertCircle,
  UploadCloud,
  Search,
  MessageSquareText,
  BarChart3,
  ArrowRight,
  Send,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LEKHA_ASSETS,
  MONTHLY_TREND_SERIES,
  WEEKLY_TREND_SERIES,
} from '../data/mockData';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { documents, selectedDepartment, backendMode, auditLogs } = useApp();
  const { t } = useLanguage();

  const [chartRange, setChartRange] = useState<'weekly' | 'monthly'>('weekly');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [askInput, setAskInput] = useState('');

  const scopedDocs = useMemo(
    () =>
      selectedDepartment === 'all'
        ? documents
        : documents.filter((d) => d.departmentId === selectedDepartment),
    [documents, selectedDepartment]
  );

  const stats = useMemo(() => {
    const processed = scopedDocs.length;
    const saved = scopedDocs.length;
    const pendingVerif = scopedDocs.filter(
      (d) =>
        d.workflowStage === 'Received' ||
        d.workflowStage === 'Digitized' ||
        d.needsReviewCount > 0
    ).length;
    const pendingAction = scopedDocs.filter(
      (d) =>
        d.workflowStage === 'Assigned' || d.workflowStage === 'Action Pending'
    ).length;
    return { processed, saved, pendingVerif, pendingAction };
  }, [scopedDocs]);

  const chartData =
    chartRange === 'weekly' ? WEEKLY_TREND_SERIES : MONTHLY_TREND_SERIES;

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = askInput.trim();
    navigate(q ? `/nammadocs?q=${encodeURIComponent(q)}` : '/nammadocs');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Vidhana Soudha Visual */}
      <section className="rounded-2xl overflow-hidden bg-gradient-to-r from-[#0B2545] via-[#13315C] to-[#1D4ED8] text-white shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-4">
            <div className="space-y-2.5">
              <div className="text-xs font-medium text-blue-200">
                {backendMode === 'demo' ? t('dash.demoBanner') : t('dash.liveBanner')}
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-balance">
                {t('dash.welcomeTitle')}
              </h1>
              <p className="text-sm sm:text-base text-blue-100 font-medium">
                {t('dash.welcomeSubtitle')}
              </p>
              <p className="text-xs sm:text-sm text-blue-200/90 tracking-wide">
                {t('dash.welcomeTagline')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/scanner')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#0B2545] hover:bg-blue-50 text-xs font-bold transition-colors whitespace-nowrap"
              >
                <span>{t('nav.scanner')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/intake')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-semibold transition-colors whitespace-nowrap"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{t('dash.qaUpload')}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[210px] lg:min-h-full bg-[#081C36]">
            <img
              src={LEKHA_ASSETS.VIDHANA_SOUDHA}
              alt="Karnataka Vidhana Soudha"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#13315C]/70 via-transparent to-transparent lg:block hidden" />
          </div>
        </div>
      </section>

      {/* 4 KPI Statistics Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-indigo-100/80 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {t('dash.statProcessed')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono tabular-nums text-3xl font-bold text-[#0B2545]">
            {stats.processed}
          </div>
          <div className="text-xs text-emerald-700 font-medium">
            {t('dash.trendProcessed')}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-indigo-100/80 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {t('dash.statSaved')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#13315C] flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono tabular-nums text-3xl font-bold text-[#0B2545]">
            {stats.saved}
          </div>
          <div className="text-xs text-slate-500">{t('dash.trendSaved')}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-indigo-100/80 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {t('dash.statPendingVerif')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono tabular-nums text-3xl font-bold text-[#0B2545]">
            {stats.pendingVerif}
          </div>
          <div className="text-xs text-amber-700 font-medium">
            {t('dash.trendVerif')}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-indigo-100/80 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {t('dash.statPendingAction')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono tabular-nums text-3xl font-bold text-[#0B2545]">
            {stats.pendingAction}
          </div>
          <div className="text-xs text-slate-500">{t('dash.trendAction')}</div>
        </div>
      </section>

      {/* Middle Row: Interactive Line Chart + Quick Actions */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 sm:p-6 border border-indigo-100/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="font-display text-base font-bold text-[#0B2545]">
                {t('dash.overviewTitle')}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{t('dash.overviewSub')}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                aria-label={t('files.filterDate')}
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg bg-[#F3F4FA] border border-indigo-100 text-slate-700"
              />
              <div className="inline-flex p-0.5 rounded-lg bg-[#EEF1FA] border border-indigo-100">
                <button
                  type="button"
                  onClick={() => setChartRange('weekly')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    chartRange === 'weekly'
                      ? 'bg-[#0B2545] text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t('dash.rangeWeekly')}
                </button>
                <button
                  type="button"
                  onClick={() => setChartRange('monthly')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    chartRange === 'monthly'
                      ? 'bg-[#0B2545] text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t('dash.rangeMonthly')}
                </button>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 8, right: 16, left: -12, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#64748B" />
                <YAxis tick={{ fontSize: 11 }} stroke="#64748B" />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E0E7FF',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="processed"
                  name={t('dash.chartProcessed')}
                  stroke="#0B2545"
                  strokeWidth={2.5}
                  dot={{ r: 3.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="verified"
                  name={t('dash.chartVerified')}
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  dot={{ r: 3.5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4 Functional Quick Actions */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 sm:p-6 border border-indigo-100/80 shadow-xs flex flex-col justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-bold text-[#0B2545]">
              {t('dash.quickActions')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{t('dash.welcomeTagline')}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 flex-1">
            <button
              type="button"
              onClick={() => navigate('/intake')}
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#F3F4FA] hover:bg-blue-50 border border-indigo-100 text-left transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#0B2545] text-white flex items-center justify-center shrink-0">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0B2545]">{t('dash.qaUpload')}</div>
                  <div className="text-[11px] text-slate-500">{t('dash.qaUploadDesc')}</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB]" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/files')}
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#F3F4FA] hover:bg-blue-50 border border-indigo-100 text-left transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0B2545]">{t('dash.qaSearch')}</div>
                  <div className="text-[11px] text-slate-500">{t('dash.qaSearchDesc')}</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB]" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/nammadocs')}
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#F3F4FA] hover:bg-blue-50 border border-indigo-100 text-left transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1D4ED8] text-white flex items-center justify-center shrink-0">
                  <MessageSquareText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0B2545]">{t('dash.qaAsk')}</div>
                  <div className="text-[11px] text-slate-500">{t('dash.qaAskDesc')}</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB]" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/reports')}
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#F3F4FA] hover:bg-blue-50 border border-indigo-100 text-left transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0B2545]">{t('dash.qaReports')}</div>
                  <div className="text-[11px] text-slate-500">{t('dash.qaReportsDesc')}</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB]" />
            </button>
          </div>
        </div>
      </section>

      {/* Bottom Row: Recent Activity + Ask NammaDocs Preview */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 border border-indigo-100/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-[#0B2545]">
              {t('dash.recentActivity')}
            </h2>
            <button
              type="button"
              onClick={() => navigate('/audit')}
              className="text-xs font-semibold text-[#2563EB] hover:underline"
            >
              {t('dash.viewAll')}
            </button>
          </div>

          <div className="divide-y divide-indigo-50">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900">
                    {log.action} · <span className="font-mono">{log.targetRef}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate">
                    {log.details}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] font-medium text-[#2563EB]">
                    {t(`dept.${log.departmentId}`)}
                  </div>
                  <div className="text-[10px] font-mono tabular-nums text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ask NammaDocs AI Preview */}
        <div className="lg:col-span-6 bg-gradient-to-br from-white to-[#EEF1FA] rounded-2xl p-5 sm:p-6 border border-indigo-100 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-start gap-4">
            <img
              src={LEKHA_ASSETS.NAMMADOCS_BOT}
              alt="Ask NammaDocs Assistant"
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover border border-indigo-100 shrink-0"
            />
            <div className="min-w-0">
              <h2 className="font-display text-base font-bold text-[#0B2545]">
                {t('dash.askPreviewTitle')}
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {t('dash.askPreviewSub')}
              </p>
            </div>
          </div>

          <form onSubmit={handleAskSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={askInput}
              onChange={(e) => setAskInput(e.target.value)}
              placeholder={t('dash.askPreviewPlaceholder')}
              className="flex-1 min-w-0 px-3.5 py-2.5 text-xs rounded-xl bg-white border border-indigo-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#13315C] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('dash.askPreviewBtn')}</span>
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {[
              'Find all applications from Belagavi this month',
              'Show complaints with missing addresses',
              'Find application KA2025/1047',
            ].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => navigate(`/nammadocs?q=${encodeURIComponent(q)}`)}
                className="px-3 py-1.5 rounded-lg bg-white border border-indigo-100 hover:border-[#2563EB] text-[11px] font-medium text-slate-700 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
