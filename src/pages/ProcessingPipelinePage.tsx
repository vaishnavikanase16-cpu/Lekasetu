import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Loader2,
  CircleDot,
  ArrowRight,
  RotateCcw,
  UploadCloud,
  Cpu,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ASSET_PATHS, PIPELINE_STAGES_TEMPLATE } from '../data/mockData';
import { DocumentRecord, ProcessingStage } from '../types';

export const ProcessingPipelinePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeProcessingJob,
    startProcessingJob,
    finalizeProcessingJob,
    backendMode,
    user,
    notify,
  } = useApp();

  const [stages, setStages] = useState<ProcessingStage[]>(() =>
    PIPELINE_STAGES_TEMPLATE.map((s) => ({ ...s }))
  );
  const [isRunning, setIsRunning] = useState(false);
  const [completedDoc, setCompletedDoc] = useState<DocumentRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const startedJobIdRef = useRef<string | null>(null);

  const runPipelineForJob = async (job: NonNullable<typeof activeProcessingJob>) => {
    setIsRunning(true);
    setErrorMsg(null);
    setCompletedDoc(null);
    setStages(PIPELINE_STAGES_TEMPLATE.map((s) => ({ ...s, status: 'waiting' })));

    try {
      for (let i = 0; i < PIPELINE_STAGES_TEMPLATE.length; i++) {
        setStages((prev) =>
          prev.map((s, idx) => ({
            ...s,
            status: idx < i ? 'completed' : idx === i ? 'running' : 'waiting',
          }))
        );
        await new Promise((r) => setTimeout(r, PIPELINE_STAGES_TEMPLATE[i].estimatedMs));
      }

      const resultDoc = await finalizeProcessingJob(job);

      setStages((prev) => prev.map((s) => ({ ...s, status: 'completed' })));
      setCompletedDoc(resultDoc);
      notify(
        'Extraction Complete',
        `${resultDoc.applicationNumber} processed with ${resultDoc.overallConfidence}% average confidence.`,
        'success'
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed during document OCR processing.';
      setErrorMsg(message);
      setStages((prev) =>
        prev.map((s) => (s.status === 'running' ? { ...s, status: 'error' } : s))
      );
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (
      activeProcessingJob &&
      startedJobIdRef.current !== activeProcessingJob.jobId
    ) {
      startedJobIdRef.current = activeProcessingJob.jobId;
      runPipelineForJob(activeProcessingJob);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProcessingJob]);

  const handleRunDemoPipeline = () => {
    const job = startProcessingJob({
      file: null,
      previewUrl: ASSET_PATHS.REVENUE_SCAN,
      fileName: 'form7_ravi_kumar_hosakote.jpg',
      fileType: 'image/jpeg',
      departmentId: 'revenue',
      formType: 'Pahani / RTC Mutation (Form 7)',
      languageMode: 'Automatic',
      officerName: user?.name || 'District Officer',
    });
    startedJobIdRef.current = job.jobId;
    runPipelineForJob(job);
  };

  const completedCount = stages.filter((s) => s.status === 'completed').length;
  const progressPct = Math.round((completedCount / stages.length) * 100);
  const previewSrc = activeProcessingJob?.payload.previewUrl || ASSET_PATHS.REVENUE_SCAN;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            AI Document Processing Pipeline
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            7-stage offline Kannada & English handwriting recognition, verification, and schema
            generation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRunDemoPipeline}
            disabled={isRunning}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Run Sample Pipeline</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/upload')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#0F294A] hover:bg-[#1E3A8A] text-white text-xs font-semibold whitespace-nowrap"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>New Upload</span>
          </button>
        </div>
      </div>

      {/* Mode Notice */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
          <Cpu className="w-4 h-4 text-[#1E3A8A] dark:text-blue-400 shrink-0" />
          <span>
            Active Engine:{' '}
            <strong className="text-slate-900 dark:text-white">
              {backendMode === 'demo'
                ? 'Demo Local Simulation (Simulated Kannada + English OCR)'
                : 'Live Python FastAPI OCR Endpoint'}
            </strong>
          </span>
        </div>
        <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
          Progress: {progressPct}% ({completedCount}/7 stages)
        </span>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-800 dark:text-red-300 flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Scan Preview with Active Scanline */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-mono text-slate-700 dark:text-slate-300 truncate">
              {activeProcessingJob?.payload.fileName || 'form7_ravi_kumar_hosakote.jpg'}
            </span>
            <span className="font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {activeProcessingJob?.payload.languageMode || 'Automatic'}
            </span>
          </div>

          <div className="relative p-4 bg-slate-100 dark:bg-slate-950 flex items-center justify-center min-h-[460px] overflow-hidden">
            <img
              src={previewSrc}
              alt="Document being processed by SARKAR AI"
              referrerPolicy="no-referrer"
              className="max-h-[480px] w-auto object-contain rounded border border-slate-200 dark:border-slate-800 bg-white"
            />
            {isRunning && (
              <div className="pointer-events-none absolute inset-x-4 top-0 h-20 bg-gradient-to-b from-blue-600/0 via-blue-600/20 to-blue-600/0 border-b-2 border-blue-500 animate-scanline" />
            )}
          </div>
        </div>

        {/* Right: 7 Pipeline Stages */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              Execution Stages
            </h2>
            <div className="w-40 h-2 bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden">
              <div
                className="h-full bg-[#15803D] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className="py-3.5 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 shrink-0">
                    {stage.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : stage.status === 'running' ? (
                      <Loader2 className="w-4 h-4 text-[#1E3A8A] dark:text-blue-400 animate-spin" />
                    ) : stage.status === 'error' ? (
                      <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    ) : (
                      <CircleDot className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {stage.stepNumber}. {stage.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {stage.subtitle}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-1">
                      {stage.engineModule}
                      {stage.status === 'completed' && stage.metrics ? ` · ${stage.metrics}` : ''}
                    </div>
                  </div>
                </div>

                <div className="text-xs font-medium whitespace-nowrap shrink-0">
                  {stage.status === 'completed' ? (
                    <span className="text-emerald-700 dark:text-emerald-400">Done</span>
                  ) : stage.status === 'running' ? (
                    <span className="text-[#1E3A8A] dark:text-blue-400">Running</span>
                  ) : stage.status === 'error' ? (
                    <span className="text-red-600 dark:text-red-400">Failed</span>
                  ) : (
                    <span className="text-slate-400">Queued</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {completedDoc && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Structured Record Ready · {completedDoc.overallConfidence}% Avg Confidence
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {completedDoc.applicationNumber} · {completedDoc.fields.length} fields extracted
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/documents/${completedDoc.id}`)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#0F294A] hover:bg-[#1E3A8A] text-white text-xs font-semibold transition-colors whitespace-nowrap"
              >
                <span>Open Split-Screen Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
