import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  Clock,
  AlertTriangle,
  Files,
  UploadCloud,
  RefreshCw,
  HardDrive,
  Cpu,
  Database,
  ArrowUpRight,
  WifiOff,
  Wifi,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { documentService } from '../services/documentService';
import { AnalyticsSummary } from '../types';
import { ConfidenceIndicator } from '../components/common/ConfidenceIndicator';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    documents,
    offlineState,
    syncOfflineQueue,
    backendMode,
  } = useApp();

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

  const totalDocs = analytics?.totalProcessed ?? 2704;
  const pendingDocs = analytics?.pendingCount ?? 159;
  const verifiedDocs = analytics?.verifiedCount ?? 2423;
  const lowConfDocs = analytics?.lowConfidenceCount ?? 122;

  const languageStats = [
    {
      label: 'Kannada (ಕನ್ನಡ)',
      count: analytics?.kannadaCount ?? 1123,
      share: '41.5%',
      color: 'bg-[#0F294A] dark:bg-blue-500',
    },
    {
      label: 'Bilingual (KN + EN)',
      count: analytics?.bilingualCount ?? 893,
      share: '33.0%',
      color: 'bg-[#D97706]',
    },
    {
      label: 'English',
      count: analytics?.englishCount ?? 688,
      share: '25.5%',
      color: 'bg-[#15803D]',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero / Welcome Banner */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {user?.district || 'Bengaluru Rural'} District Node ·{' '}
            {backendMode === 'demo'
              ? 'Demo Simulation Mode'
              : 'Live Python FastAPI Connected'}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight text-balance">
            Welcome to SARKAR AI
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Offline Intelligent Government Document Processing System for digitizing handwritten
            Kannada and English forms with field-wise confidence verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/upload')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#0F294A] hover:bg-[#1E3A8A] text-white text-sm font-semibold transition-colors whitespace-nowrap"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Process New Document</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/documents')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium transition-colors whitespace-nowrap"
          >
            <span>Review Queue</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 4 KPI Summary Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Total Documents Processed</span>
            <Files className="w-4 h-4 text-[#1E3A8A] dark:text-blue-400" />
          </div>
          <div className="mt-3 font-mono tabular-nums text-3xl font-bold text-slate-900 dark:text-white">
            {totalDocs.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Across 10 Karnataka departments · Avg {analytics?.avgConfidence ?? 87}% conf
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Verified Documents</span>
            <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-3 font-mono tabular-nums text-3xl font-bold text-slate-900 dark:text-white">
            {verifiedDocs.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            89.6% officer sign-off rate
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Pending Documents</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-3 font-mono tabular-nums text-3xl font-bold text-slate-900 dark:text-white">
            {pendingDocs.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Awaiting manual split-screen review
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Low-Confidence Documents</span>
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <div className="mt-3 font-mono tabular-nums text-3xl font-bold text-slate-900 dark:text-white">
            {lowConfDocs.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-red-700 dark:text-red-400 font-medium">
            Requires handwriting check (&lt;65% fields)
          </div>
        </div>
      </section>

      {/* Charts Row: Processing Activity + Kannada/English Stats */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Processing Activity (7-Day Volume)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily digitized forms vs verified citizen records
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/analytics')}
              className="text-xs font-medium text-[#1E3A8A] dark:text-blue-400 hover:underline self-start sm:self-auto"
            >
              View full analytics
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analytics?.dailyActivity || []}
                margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorProcessed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15803D" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#15803D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.45} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    fontSize: '12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area
                  type="monotone"
                  dataKey="processed"
                  name="Digitized"
                  stroke="#1E3A8A"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProcessed)"
                />
                <Area
                  type="monotone"
                  dataKey="verified"
                  name="Verified"
                  stroke="#15803D"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVerified)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Kannada & English Document Statistics + Offline System Status */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              Language Script Distribution
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-4">
              Kannada, Bilingual & English handwritten forms
            </p>
            <div className="space-y-4">
              {languageStats.map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {item.label}
                    </span>
                    <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      {item.count.toLocaleString()} ({item.share})
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: item.share }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                  Offline System Status
                </h2>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                  {offlineState.offlineMode ? (
                    <>
                      <WifiOff className="w-3.5 h-3.5" /> Offline Active
                    </>
                  ) : (
                    <>
                      <Wifi className="w-3.5 h-3.5 text-emerald-600" /> Sync Link On
                    </>
                  )}
                </span>
              </div>

              <dl className="mt-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <dt className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Cpu className="w-3.5 h-3.5" /> Local OCR Engine
                  </dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-100">
                    {offlineState.ocrEngine.status}
                  </dd>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <dt className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Database className="w-3.5 h-3.5" /> Local Database
                  </dt>
                  <dd className="font-mono tabular-nums text-slate-900 dark:text-slate-100">
                    {offlineState.localDatabase.cachedRecords} records ·{' '}
                    {offlineState.localDatabase.storageUsedMb} MB
                  </dd>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <dt className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <HardDrive className="w-3.5 h-3.5" /> Local AI Model
                  </dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-100">
                    {offlineState.localAiModel.name}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-4 pt-3 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                Sync Queue:{' '}
                <strong className="text-slate-900 dark:text-white">
                  {offlineState.syncStatus.pendingSyncCount} pending
                </strong>
              </div>
              <button
                type="button"
                onClick={syncOfflineQueue}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Now</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Department-wise Analytics Chart */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              Department-wise Digitization Analytics
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Volume processed and verified across all 10 government departments
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/departments')}
            className="text-xs font-medium text-[#1E3A8A] dark:text-blue-400 hover:underline self-start sm:self-auto"
          >
            Explore all 10 departments
          </button>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={analytics?.departmentStats || []}
              margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.45} />
              <XAxis dataKey="shortCode" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  fontSize: '12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="processed" name="Processed" fill="#0F294A" radius={[3, 3, 0, 0]} />
              <Bar dataKey="verified" name="Verified" fill="#15803D" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Recent Documents Table */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              Recent Handwritten Form Extractions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select any record to launch Split-Screen Verification
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/documents')}
            className="text-xs font-medium text-[#1E3A8A] dark:text-blue-400 hover:underline whitespace-nowrap"
          >
            View all records
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Application No.</th>
                <th className="py-3 px-4">Applicant / Form</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Language</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {documents.slice(0, 6).map((doc) => (
                <tr
                  key={doc.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4 font-mono tabular-nums font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {doc.applicationNumber}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {doc.applicantName}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {doc.formType} · {doc.district}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {doc.departmentName}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {doc.language}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <ConfidenceIndicator score={doc.overallConfidence} compact />
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`font-medium ${
                        doc.status === 'Verified'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : doc.status === 'Low Confidence'
                            ? 'text-red-700 dark:text-red-400'
                            : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => navigate(`/documents/${doc.id}`)}
                      className="text-xs font-semibold text-[#1E3A8A] dark:text-blue-400 hover:underline"
                    >
                      Review Data
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
