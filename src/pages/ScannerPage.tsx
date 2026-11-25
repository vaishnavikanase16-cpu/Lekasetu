import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ScanLine,
  CheckCircle2,
  Loader2,
  CircleDot,
  Save,
  ShieldCheck,
  Play,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { LEKHA_ASSETS } from '../data/mockData';
import { IntakePayload } from '../services/ocrService';
import { ExtractedField, LekhaDocument } from '../types';
import { ReviewStateBadge } from '../components/common/ReviewStateBadge';

const DEMO_SAMPLES: Array<{ label: string; payload: Omit<IntakePayload, 'assignedTo'> }> = [
  {
    label: 'Belagavi Police Complaint (KN + EN)',
    payload: {
      file: null,
      previewUrl: LEKHA_ASSETS.POLICE_SCAN,
      fileName: 'mallikarjun_patil_camp_ps_belagavi.jpg',
      fileType: 'image/jpeg',
      departmentId: 'police',
      category: 'Internal Citizen Complaint',
      officeName: 'Camp Police Station, Belagavi',
      inputLanguage: 'Both',
    },
  },
  {
    label: 'Revenue Form 7 (Hosakote)',
    payload: {
      file: null,
      previewUrl: LEKHA_ASSETS.REVENUE_SCAN,
      fileName: 'form7_ravi_kumar_hosakote.jpg',
      fileType: 'image/jpeg',
      departmentId: 'revenue',
      category: 'Pahani / RTC Mutation (Form 7)',
      officeName: 'Hosakote Taluk Office, Bengaluru Rural',
      inputLanguage: 'Both',
    },
  },
];

const PROCESSING_STAGE_KEYS = [
  'scanner.stagePreprocess',
  'scanner.stageNoise',
  'scanner.stageHandwriting',
  'scanner.stageOcr',
  'scanner.stageFields',
  'scanner.stageVerifyPrep',
];

export const ScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    pendingIntake,
    setPendingIntake,
    runScannerTransformation,
    saveFieldCorrections,
    verifyDocument,
    activeProfile,
    backendMode,
    notify,
  } = useApp();
  const { t } = useLanguage();

  const [selectedSampleIdx, setSelectedSampleIdx] = useState(0);
  const [activePayload, setActivePayload] = useState<IntakePayload>(
    pendingIntake || {
      ...DEMO_SAMPLES[0].payload,
      assignedTo: activeProfile.name,
    }
  );

  const [currentStep, setCurrentStep] = useState<number>(2);
  const [activeStageIdx, setActiveStageIdx] = useState<number>(-1);
  const [isScanning, setIsScanning] = useState(false);
  const [transformedDoc, setTransformedDoc] = useState<LekhaDocument | null>(null);
  const [editableText, setEditableText] = useState('');
  const [editableFields, setEditableFields] = useState<ExtractedField[]>([]);
  const autoStartedRef = useRef(false);

  const runLiveWorkflow = async (payloadToRun: IntakePayload) => {
    setIsScanning(true);
    setTransformedDoc(null);
    setCurrentStep(3);

    // Step 3 & 4: Animated optical scan + 6 internal OCR stages
    for (let i = 0; i < PROCESSING_STAGE_KEYS.length; i++) {
      setActiveStageIdx(i);
      if (i === 1) setCurrentStep(4);
      await new Promise((r) => setTimeout(r, 520));
    }

    setActiveStageIdx(PROCESSING_STAGE_KEYS.length);
    setCurrentStep(5);

    try {
      const result = await runScannerTransformation(payloadToRun);
      setTransformedDoc(result);
      setEditableText(result.recognizedText);
      setEditableFields(result.fields);
      setCurrentStep(7);
      notify(t('nav.scanner'), `${result.referenceNumber}`, 'success');
    } catch (err) {
      notify(
        t('nav.scanner'),
        err instanceof Error ? err.message : 'OCR error',
        'error'
      );
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (pendingIntake && !autoStartedRef.current) {
      autoStartedRef.current = true;
      setActivePayload(pendingIntake);
      setPendingIntake(null);
      runLiveWorkflow(pendingIntake);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingIntake]);

  const handleFieldEdit = (key: string, nextVal: string) => {
    setEditableFields((prev) =>
      prev.map((f) =>
        f.key === key
          ? {
              ...f,
              value: nextVal,
              reviewState: nextVal.trim() === '' ? 'MissingOrInvalid' : 'HighConfidence',
            }
          : f
      )
    );
  };

  const handleSaveVerified = () => {
    if (!transformedDoc) return;
    saveFieldCorrections(transformedDoc.id, editableFields, editableText);
    verifyDocument(transformedDoc.id, editableFields);
    setCurrentStep(8);
    notify(
      t('scanner.saveVerified'),
      `${transformedDoc.referenceNumber}`,
      'success'
    );
  };

  const stepLabels = [
    t('scanner.step1'),
    t('scanner.step2'),
    t('scanner.step3'),
    t('scanner.step4'),
    t('scanner.step5'),
    t('scanner.step6'),
    t('scanner.step7'),
    t('scanner.step8'),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0B2545]">
            {t('scanner.title')}
          </h1>
          <p className="text-sm text-slate-600 mt-1">{t('scanner.subtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            aria-label={t('scanner.selectSample')}
            value={selectedSampleIdx}
            onChange={(e) => {
              const idx = Number(e.target.value);
              setSelectedSampleIdx(idx);
              const nextPayload = {
                ...DEMO_SAMPLES[idx].payload,
                assignedTo: activeProfile.name,
              };
              setActivePayload(nextPayload);
              setTransformedDoc(null);
              setCurrentStep(2);
              setActiveStageIdx(-1);
            }}
            className="px-3 py-2 text-xs rounded-xl bg-white border border-indigo-200 text-slate-800 font-medium"
          >
            {DEMO_SAMPLES.map((s, idx) => (
              <option key={s.label} value={idx}>
                {s.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={isScanning}
            onClick={() => runLiveWorkflow(activePayload)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B2545] hover:bg-[#13315C] disabled:opacity-60 text-white text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{t('scanner.startDemo')}</span>
          </button>
        </div>
      </div>

      {/* Simulation Notice */}
      <div className="bg-white rounded-xl border border-indigo-100 px-4 py-3 flex items-center gap-2.5 text-xs text-slate-700">
        <Info className="w-4 h-4 text-[#2563EB] shrink-0" />
        <span>
          {backendMode === 'demo' ? t('scanner.simNotice') : t('scanner.liveNotice')}
        </span>
      </div>

      {/* 8-Step Progress Bar */}
      <section className="bg-white rounded-2xl border border-indigo-100 p-4 shadow-xs">
        <div className="text-xs font-bold text-[#0B2545] mb-3">
          {t('scanner.stepProgress')}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2">
          {stepLabels.map((lbl, idx) => {
            const stepNum = idx + 1;
            const done = currentStep > stepNum || (stepNum === 8 && currentStep === 8);
            const active = currentStep === stepNum && currentStep !== 8;
            return (
              <div
                key={lbl}
                className={`px-2.5 py-2 rounded-xl border text-[11px] font-medium leading-snug ${
                  done
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : active
                      ? 'bg-blue-50 border-[#2563EB] text-[#0B2545] font-semibold'
                      : 'bg-[#F8F9FD] border-indigo-100 text-slate-500'
                }`}
              >
                {lbl}
              </div>
            );
          })}
        </div>
      </section>

      {/* Split Workspace: Original Document (Left) | Live OCR & Fields (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Original Document with Animated Scan Line */}
        <section className="lg:col-span-5 bg-white rounded-2xl border border-indigo-100 overflow-hidden shadow-xs">
          <div className="px-4 py-3 border-b border-indigo-100 bg-[#F8F9FD] flex items-center justify-between text-xs">
            <span className="font-bold text-[#0B2545]">{t('scanner.originalPane')}</span>
            <span className="font-mono text-slate-500 truncate max-w-[180px]">
              {activePayload.fileName}
            </span>
          </div>

          <div className="relative p-4 bg-[#EEF1FA] min-h-[500px] flex items-center justify-center overflow-hidden">
            <img
              src={activePayload.previewUrl}
              alt={activePayload.fileName}
              referrerPolicy="no-referrer"
              className="max-h-[500px] w-auto object-contain rounded-xl border border-indigo-200 bg-white shadow-sm"
            />
            {isScanning && (
              <div className="pointer-events-none absolute inset-x-4 top-4 h-12 bg-gradient-to-b from-blue-600/0 via-blue-500/30 to-blue-500/0 border-b-2 border-[#2563EB] animate-scan-beam" />
            )}
          </div>
        </section>

        {/* Right: Processing Stages + Recognized Text + Editable Extracted Fields */}
        <section className="lg:col-span-7 bg-white rounded-2xl border border-indigo-100 p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-base font-bold text-[#0B2545]">
              {t('scanner.recognizedPane')}
            </h2>
            {transformedDoc && (
              <span className="font-mono text-xs font-semibold text-[#2563EB]">
                {transformedDoc.referenceNumber}
              </span>
            )}
          </div>

          {/* 6 OCR Processing Sub-Stages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PROCESSING_STAGE_KEYS.map((stageKey, idx) => {
              const isDone = activeStageIdx > idx;
              const isCurr = isScanning && activeStageIdx === idx;
              return (
                <div
                  key={stageKey}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs ${
                    isDone
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                      : isCurr
                        ? 'bg-blue-50 border-[#2563EB] text-[#0B2545] font-semibold'
                        : 'bg-[#F8F9FD] border-indigo-100 text-slate-500'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : isCurr ? (
                    <Loader2 className="w-4 h-4 text-[#2563EB] animate-spin shrink-0" />
                  ) : (
                    <CircleDot className="w-4 h-4 text-slate-300 shrink-0" />
                  )}
                  <span className="truncate">{t(stageKey)}</span>
                </div>
              );
            })}
          </div>

          {/* Step 5: Recognized Raw Text */}
          {transformedDoc && (
            <div className="space-y-2">
              <label
                htmlFor="scanner-raw-text"
                className="block text-xs font-bold text-[#0B2545]"
              >
                {t('scanner.recognizedRaw')}
              </label>
              <textarea
                id="scanner-raw-text"
                rows={4}
                value={editableText}
                onChange={(e) => setEditableText(e.target.value)}
                className="w-full p-3 text-xs font-mono rounded-xl bg-[#F3F4FA] border border-indigo-100 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
          )}

          {/* Step 6 & 7: Extracted Editable Fields with Green/Yellow/Red Indicators */}
          {transformedDoc ? (
            <div className="space-y-3">
              <div className="text-xs font-bold text-[#0B2545]">
                {t('scanner.extractedFields')}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {editableFields.map((field) => (
                  <div
                    key={field.key}
                    className={`p-3 rounded-xl border space-y-1.5 ${
                      field.reviewState === 'HighConfidence'
                        ? 'bg-emerald-50/30 border-emerald-200'
                        : field.reviewState === 'NeedsHumanReview'
                          ? 'bg-amber-50/50 border-amber-200'
                          : 'bg-red-50/50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <label
                        htmlFor={`scan-f-${field.key}`}
                        className="text-[11px] font-semibold text-slate-700"
                      >
                        {t(field.labelKey)}
                      </label>
                      <ReviewStateBadge
                        state={field.reviewState}
                        modelConfidence={field.modelConfidence}
                      />
                    </div>
                    <input
                      id={`scan-f-${field.key}`}
                      type="text"
                      value={field.value}
                      onChange={(e) => handleFieldEdit(field.key, e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-indigo-100 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                    {field.issueNoteKey && (
                      <div className="text-[10px] text-amber-800">{field.issueNoteKey}</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 8: Save Verified Document */}
              <div className="pt-3 border-t border-indigo-100 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/verification/${transformedDoc.id}`)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-indigo-200 bg-white hover:bg-[#F3F4FA] text-xs font-semibold text-[#0B2545]"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t('scanner.sendToVerif')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveVerified}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B2545] hover:bg-[#13315C] text-white text-xs font-semibold"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{t('scanner.saveVerified')}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-[#F8F9FD] border border-indigo-100 text-center space-y-3">
              <ScanLine className="w-8 h-8 text-[#2563EB] mx-auto" />
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                {t('scanner.subtitle')}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
