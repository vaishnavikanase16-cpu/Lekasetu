import React, { useState } from 'react';
import {
  Database,
  FolderOpen,
  ScanLine,
  Cpu,
  HardDrive,
  Server,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { API_CONFIG } from '../config/apiConfig';
import { storageService } from '../services/storageService';
import { BackendMode } from '../types';

export const SettingsPage: React.FC = () => {
  const {
    documents,
    policeComplaints,
    backendMode,
    apiBaseUrl,
    updateBackendConfig,
    resetDemoData,
    canExport,
    activeProfile,
    addAuditEvent,
    notify,
  } = useApp();
  const { t } = useLanguage();

  const [urlInput, setUrlInput] = useState(apiBaseUrl);
  const [modeInput, setModeInput] = useState<BackendMode>(backendMode);
  const [healthStatus, setHealthStatus] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);

  const handleSaveBackend = (e: React.FormEvent) => {
    e.preventDefault();
    updateBackendConfig(urlInput.trim() || 'http://localhost:8000', modeInput);
  };

  const handleTestHealth = async () => {
    if (modeInput === 'demo') {
      setHealthStatus({
        ok: true,
        msg: 'Illustrative Demo Mode active (Python FastAPI standby).',
      });
      return;
    }
    try {
      const res = await fetch(
        `${urlInput.replace(/\/+$/, '')}${API_CONFIG.ENDPOINTS.HEALTH}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setHealthStatus({
        ok: true,
        msg: `Connected to Python FastAPI at ${urlInput}`,
      });
    } catch (err) {
      setHealthStatus({
        ok: false,
        msg:
          err instanceof Error
            ? `Cannot reach ${urlInput} (${err.message})`
            : 'FastAPI unreachable',
      });
    }
  };

  const handleDownloadBackup = () => {
    if (!canExport) {
      notify(t('settings.backupTitle'), t('common.permissionDenied'), 'warning');
      return;
    }
    storageService.exportFullBackupJson({
      documents,
      complaints: policeComplaints,
      exportedAt: new Date().toISOString(),
    });
    addAuditEvent({
      actor: activeProfile.name,
      role: activeProfile.role,
      action: 'Backup',
      targetRef: 'SQLite-JSON-Snapshot',
      departmentId: 'all',
      details: `Exported local SQLite backup (${documents.length} docs, ${policeComplaints.length} complaints).`,
    });
    notify(t('settings.exportBackup'), 'JSON snapshot downloaded', 'success');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#0B2545]">
          {t('settings.title')}
        </h1>
        <p className="text-sm text-slate-600 mt-1">{t('settings.subtitle')}</p>
      </div>

      {/* Offline-First Local Stack */}
      <section className="bg-white rounded-2xl border border-indigo-100 p-6 space-y-4 shadow-xs">
        <h2 className="font-display text-base font-bold text-[#0B2545]">
          {t('settings.offlineArch')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3.5 text-xs">
          <div className="p-4 rounded-xl bg-[#F8F9FD] border border-indigo-100 space-y-1.5">
            <Database className="w-4 h-4 text-[#2563EB]" />
            <div className="font-bold text-[#0B2545]">{t('settings.sqlite')}</div>
            <div className="text-slate-600 font-mono tabular-nums">
              {documents.length} docs · {policeComplaints.length} complaints
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F9FD] border border-indigo-100 space-y-1.5">
            <FolderOpen className="w-4 h-4 text-[#2563EB]" />
            <div className="font-bold text-[#0B2545]">{t('settings.localFolders')}</div>
            <div className="text-slate-600 font-mono">/var/lekhasetu/scans</div>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F9FD] border border-indigo-100 space-y-1.5">
            <ScanLine className="w-4 h-4 text-[#2563EB]" />
            <div className="font-bold text-[#0B2545]">{t('settings.localOcr')}</div>
            <div className="text-slate-600">PaddleOCR + Indic-TrOCR</div>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F9FD] border border-indigo-100 space-y-1.5">
            <Cpu className="w-4 h-4 text-[#2563EB]" />
            <div className="font-bold text-[#0B2545]">{t('settings.localEmbeddings')}</div>
            <div className="text-slate-600">Local FAISS / SQLite FTS5</div>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F9FD] border border-indigo-100 space-y-1.5">
            <HardDrive className="w-4 h-4 text-[#2563EB]" />
            <div className="font-bold text-[#0B2545]">{t('settings.localLlm')}</div>
            <div className="text-slate-600">Quantized 8B / Ollama Ready</div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* FastAPI Backend Config */}
        <section className="lg:col-span-7 bg-white rounded-2xl border border-indigo-100 p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-[#2563EB]" />
            <h2 className="font-display text-base font-bold text-[#0B2545]">
              {t('settings.backendConfig')}
            </h2>
          </div>

          <form onSubmit={handleSaveBackend} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="settings-api-url"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  {t('settings.apiUrl')}
                </label>
                <input
                  id="settings-api-url"
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-[#F3F4FA] border border-indigo-100"
                />
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mode
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setModeInput('demo')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
                      modeInput === 'demo'
                        ? 'bg-[#0B2545] text-white border-[#0B2545]'
                        : 'bg-[#F3F4FA] text-slate-700 border-indigo-100'
                    }`}
                  >
                    {t('settings.modeDemo')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModeInput('fastapi')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
                      modeInput === 'fastapi'
                        ? 'bg-[#2563EB] text-white border-[#2563EB]'
                        : 'bg-[#F3F4FA] text-slate-700 border-indigo-100'
                    }`}
                  >
                    {t('settings.modeLive')}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#0B2545] hover:bg-[#13315C] text-white text-xs font-semibold"
              >
                {t('settings.saveConfig')}
              </button>
              <button
                type="button"
                onClick={handleTestHealth}
                className="px-4 py-2 rounded-xl border border-indigo-200 bg-white hover:bg-[#F3F4FA] text-xs font-semibold text-[#0B2545]"
              >
                {t('settings.testHealth')}
              </button>
            </div>
          </form>

          {healthStatus && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                healthStatus.ok
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              {healthStatus.ok ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span>{healthStatus.msg}</span>
            </div>
          )}
        </section>

        {/* Backup & Reset */}
        <section className="lg:col-span-5 bg-white rounded-2xl border border-indigo-100 p-6 space-y-4 shadow-xs">
          <h2 className="font-display text-base font-bold text-[#0B2545]">
            {t('settings.backupTitle')}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t('settings.subtitle')}
          </p>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#13315C] text-white text-xs font-semibold"
            >
              <Download className="w-4 h-4" />
              <span>{t('settings.exportBackup')}</span>
            </button>

            <button
              type="button"
              onClick={resetDemoData}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-200 bg-white hover:bg-[#F3F4FA] text-xs font-semibold text-slate-800"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('settings.resetDemo')}</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
