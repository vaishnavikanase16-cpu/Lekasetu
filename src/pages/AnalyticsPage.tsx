import React, { useEffect, useState } from 'react';
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
  LineChart,
  Line,
} from 'recharts';
import { Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { documentService, triggerFileDownload } from '../services/documentService';
import { AnalyticsSummary } from '../types';

const PIE_COLORS = ['#0F294A', '#D97706', '#15803D'];
const CONF_COLORS = {
  High: '#15803D',
  Medium: '#D97706',
  Low: '#DC2626',
};

export const AnalyticsPage: React.FC = () => {
  const { documents, notify } = useApp();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    let active = true;
    documentService.fetchAnalytics(documents).then((data) => {
      if (active) setAnalytics(data);
    });
    return () => {
      active = false;
    };
  }, [documents]);

  const langPieData = [
    { name: 'Kannada (ಕನ್ನಡ)', value: analytics?.kannadaCount ?? 1123 },
    { name: 'Bilingual (KN + EN)', value: analytics?.bilingualCount ?? 893 },
    { name: 'English', value: analytics?.englishCount ?? 688 },
  ];

  const handleExportAnalytics = () => {
    if (!analytics) return;
    triggerFileDownload(
      `sarkar_ai_analytics_${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(analytics, null, 2),
      'application/json;charset=utf-8'
    );
    notify('Analytics Exported', 'Downloaded departmental analytics JSON.', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Digitization Analytics
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Throughput, Kannada & English OCR accuracy, and verification trends across
            departments.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportAnalytics}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Analytics JSON</span>
        </button>
      </div>

      {/* Row 1: Language Breakdown + Confidence Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            Kannada vs English Script Volume
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Share of handwritten forms processed by language mode
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={langPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={88}
                  paddingAngle={2}
                >
                  {langPieData.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            Daily Kannada & English OCR Volume
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            7-day trend comparing Kannada and English form digitization
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={analytics?.dailyActivity || []}
                margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.45} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="kannada"
                  name="Kannada Forms"
                  stroke="#0F294A"
                  strokeWidth={2.5}
                />
                <Line
                  type="monotone"
                  dataKey="english"
                  name="English Forms"
                  stroke="#D97706"
                  strokeWidth={2.5}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Department Confidence & Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            Department-wise Average OCR Confidence (%)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Mean extraction accuracy across all 10 government departments
          </p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics?.departmentStats || []}
                margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.45} />
                <XAxis dataKey="shortCode" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Bar
                  dataKey="avgConfidence"
                  name="Avg Confidence (%)"
                  fill="#1E3A8A"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              Confidence Band Breakdown
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active repository documents by reliability band
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {(analytics?.confidenceDistribution || []).map((item) => {
              const total = Math.max(documents.length, 1);
              const pct = Math.round((item.count / total) * 100);
              return (
                <div key={item.range} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {item.range}
                    </span>
                    <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      {item.count} docs ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: CONF_COLORS[item.band],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
