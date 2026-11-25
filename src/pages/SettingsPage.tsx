import React, { useState } from 'react';
import {
  Server,
  WifiOff,
  Wifi,
  RefreshCw,
  Sun,
  Moon,
  Download,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Code2,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ENDPOINT_SPECIFICATIONS } from '../config/apiConfig';
import { apiClient } from '../services/apiClient';
import { downloadProjectSourceZip } from '../services/documentService';
import { BackendMode, LanguageMode } from '../types';

export const SettingsPage: React.FC = () => {
  const {
    user,
    theme,
    toggleTheme,
    backendMode,
    apiBaseUrl,
    updateBackendConfig,
    offlineState,
    toggleOfflineMode,
    syncOfflineQueue,
    defaultLanguage,
    setDefaultLanguage,
    confidenceThreshold,
    setConfidenceThreshold,
    notify,
  } = useApp();

  const [urlInput, setUrlInput] = useState(apiBaseUrl);
  const [modeInput, setModeInput] = useState<BackendMode>(backendMode);
  const [healthResult, setHealthResult] = useState<{
    ok: boolean;
    latencyMs: number;
    message: string;
  } | null>(null);
  const [testingHealth, setTestingHealth] = useState(false);
  const [exportingZip, setExportingZip] = useState(false);

  const handleSaveBackendConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateBackendConfig(urlInput.trim() || 'http://localhost:8000', modeInput);
  };

  const handleTestHealth = async () => {
    setTestingHealth(true);
    apiClient.configure(urlInput.trim() || 'http://localhost:8000', modeInput);
    const res = await apiClient.checkHealth();
    setHealthResult(res);
    setTestingHealth(false);
  };

  const handleDownloadSourceZip = async () => {
    setExportingZip(true);
    try {
      const count = await downloadProjectSourceZip();
      notify(
        'Source ZIP Generated',
        `Packaged ${count} source & config files into sarkar-ai-frontend-source.zip.`,
        'success'
      );
    } catch {
      notify('ZIP Export Failed', 'Could not package source archive.', 'error');
    } finally {
      setExportingZip(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Settings, Offline Engine & FastAPI Integration
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Configure offline OCR workstation preferences, connect your Python FastAPI backend,
          and export editable frontend source code.
        </p>
      </div>

      {/* Section 1: Offline Mode & Local Stack */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Offline Workstation & Local AI Stack
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Designed for air-gapped Taluk & Gram Panchayat offices with intermittent connectivity
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleOfflineMode}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold border transition-colors ${
                offlineState.offlineMode
                  ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                  : 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
              }`}
            >
              {offlineState.offlineMode ? (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>OFFLINE MODE ACTIVE</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span>CENTRAL SYNC ENABLED</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={syncOfflineQueue}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#0F294A] hover:bg-[#1E3A8A] text-white text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Local Queue ({offlineState.syncStatus.pendingSyncCount})</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="text-slate-500 dark:text-slate-400">Local OCR Engine</div>
            <div className="font-semibold text-slate-900 dark:text-white">
              {offlineState.ocrEngine.name}
            </div>
            <div className="text-emerald-700 dark:text-emerald-400 font-medium">
              {offlineState.ocrEngine.status} · KN + EN
            </div>
          </div>

          <div className="p-4 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="text-slate-500 dark:text-slate-400">Local Database</div>
            <div className="font-semibold text-slate-900 dark:text-white">
              {offlineState.localDatabase.engine}
            </div>
            <div className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
              {offlineState.localDatabase.cachedRecords} records ·{' '}
              {offlineState.localDatabase.storageUsedMb} MB
            </div>
          </div>

          <div className="p-4 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="text-slate-500 dark:text-slate-400">Local AI Model</div>
            <div className="font-semibold text-slate-900 dark:text-white">
              {offlineState.localAiModel.name}
            </div>
            <div className="text-slate-600 dark:text-slate-400">
              {offlineState.localAiModel.status} ({offlineState.localAiModel.quantization})
            </div>
          </div>

          <div className="p-4 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="text-slate-500 dark:text-slate-400">Synchronization Status</div>
            <div className="font-semibold text-slate-900 dark:text-white">
              {offlineState.syncStatus.state}
            </div>
            <div className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
              Last Sync: {new Date(offlineState.syncStatus.lastSyncedAt).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Python FastAPI Integration & Source ZIP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 space-y-5">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-[#1E3A8A] dark:text-blue-400" />
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                Python FastAPI Backend Configuration
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch seamlessly between Demo Simulation and your local FastAPI OCR + RAG server
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveBackendConfig} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="api-base-url"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  FastAPI Base URL
                </label>
                <input
                  id="api-base-url"
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <span className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Execution Mode
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setModeInput('demo')}
                    className={`py-2 px-3 rounded-md text-xs font-semibold border transition-colors ${
                      modeInput === 'demo'
                        ? 'bg-[#0F294A] border-[#0F294A] text-white'
                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Demo Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => setModeInput('fastapi')}
                    className={`py-2 px-3 rounded-md text-xs font-semibold border transition-colors ${
                      modeInput === 'fastapi'
                        ? 'bg-[#15803D] border-[#15803D] text-white'
                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Live FastAPI
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-[#0F294A] hover:bg-[#1E3A8A] text-white text-xs font-semibold"
              >
                Apply Backend Config
              </button>
              <button
                type="button"
                disabled={testingHealth}
                onClick={handleTestHealth}
                className="px-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {testingHealth ? 'Testing Endpoint...' : 'Test Connection'}
              </button>
            </div>
          </form>

          {healthResult && (
            <div
              className={`p-3 rounded-md border text-xs flex items-center gap-2 ${
                healthResult.ok
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
              }`}
            >
              {healthResult.ok ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span>
                {healthResult.message} ({healthResult.latencyMs}ms)
              </span>
            </div>
          )}

          {/* Prepared Endpoints Table */}
          <div className="pt-2">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
              Prepared FastAPI Endpoint Contracts (src/config/apiConfig.ts)
            </div>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-md">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
                    <th className="py-2 px-3">Method</th>
                    <th className="py-2 px-3">Endpoint</th>
                    <th className="py-2 px-3">Responsibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {ENDPOINT_SPECIFICATIONS.map((ep) => (
                    <tr key={`${ep.method}-${ep.path}`}>
                      <td className="py-2 px-3 font-mono font-semibold text-[#1E3A8A] dark:text-blue-400">
                        {ep.method}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {ep.path}
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                        {ep.purpose}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Right Column: Profile, Theme, Source ZIP & Help */}
        <div className="lg:col-span-5 space-y-6">
          {/* Download Source ZIP */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <Code2 className="w-5 h-5 text-[#15803D] dark:text-emerald-400" />
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Download Editable Source Code (.zip)
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Package the complete React + Vite + Tailwind CSS frontend, FastAPI service layer,
              and configuration files into a ready-to-run VS Code project archive.
            </p>
            <button
              type="button"
              disabled={exportingZip}
              onClick={handleDownloadSourceZip}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#15803D] hover:bg-[#166534] disabled:opacity-60 text-white text-xs font-semibold transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>
                {exportingZip ? 'Generating ZIP Archive...' : 'Download Frontend Source (.zip)'}
              </span>
            </button>
          </section>

          {/* Employee Profile & UI Preferences */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-5 h-5 text-[#1E3A8A] dark:text-blue-400" />
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Employee Profile & Preferences
              </h2>
            </div>

            {user && (
              <div className="flex items-center gap-3 p-3 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-md object-cover shrink-0"
                />
                <div className="min-w-0 text-xs">
                  <div className="font-semibold text-slate-900 dark:text-white truncate">
                    {user.name}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 truncate">
                    {user.designation} · {user.district}
                  </div>
                  <div className="font-mono text-[11px] text-slate-500 mt-0.5">
                    ID: {user.employeeCode}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-medium text-slate-800 dark:text-slate-200">
                Interface Theme
              </span>
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200"
              >
                {theme === 'dark' ? (
                  <>
                    <Moon className="w-3.5 h-3.5" /> Dark Mode
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5" /> Light Mode
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-medium text-slate-800 dark:text-slate-200">
                Default OCR Language
              </span>
              <select
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value as LanguageMode)}
                className="px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs"
              >
                <option value="Automatic">Automatic (KN + EN)</option>
                <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                <option value="English">English</option>
              </select>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  High-Confidence Threshold
                </span>
                <span className="font-mono tabular-nums font-semibold">
                  {confidenceThreshold}%
                </span>
              </div>
              <input
                type="range"
                min={70}
                max={95}
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="w-full accent-[#0F294A]"
              />
            </div>
          </section>

          {/* Help & Support */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-sm">
              <HelpCircle className="w-4 h-4 text-[#1E3A8A] dark:text-blue-400" />
              <span>Help & Support</span>
            </div>
            <p className="leading-relaxed">
              For optimal Kannada (ಕನ್ನಡ) handwriting accuracy, scan forms at 300 DPI under even
              lighting. Fields scoring below 65% are highlighted in red during Split-Screen
              Review for mandatory officer confirmation.
            </p>
            <p className="font-mono text-[11px] text-slate-500">
              Helpdesk: egov-support@karnataka.gov.in · VS Code: npm install && npm run dev
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
