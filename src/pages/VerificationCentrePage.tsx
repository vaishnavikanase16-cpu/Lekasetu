import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Save,
  ShieldCheck,
  Undo2,
  AlertTriangle,
  Info,
  History,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { ReviewStateBadge } from '../components/common/ReviewStateBadge';
import { ExtractedField } from '../types';

export const VerificationCentrePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    documents,
    saveFieldCorrections,
    verifyDocument,
    returnDocumentForCorrection,
    canVerify,
    notify,
  } = useApp();
  const { t } = useLanguage();

  const [selectedId, setSelectedId] = useState<string>(
    id || documents[0]?.id || ''
  );

  useEffect(() => {
    if (id) setSelectedId(id);
  }, [id]);

  const doc = useMemo(
    () => documents.find((d) => d.id === selectedId) || documents[0],
    [documents, selectedId]
  );

  const [fields, setFields] = useState<ExtractedField[]>(doc?.fields || []);
  const [recognizedText, setRecognizedText] = useState(doc?.recognizedText || '');
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [returnReason, setReturnReason] = useState('');
  const [showReturnBox, setShowReturnBox] = useState(false);

  useEffect(() => {
    if (doc) {
      setFields(doc.fields);
      setRecognizedText(doc.recognizedText);
      setZoom(100);
      setRotation(0);
      setShowReturnBox(false);
    }
  }, [doc]);

  if (!doc) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center text-sm text-slate-500">
        {t('common.noResults')}
      </div>
    );
  }

  const hasMissingRequired = fields.some(
    (f) =>
      f.reviewState === 'MissingOrInvalid' || (f.required && !f.value.trim())
  );

  const handleFieldChange = (key: string, nextVal: string) => {
    setFields((prev) =>
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

  const handleSaveCorrections = () => {
    saveFieldCorrections(doc.id, fields, recognizedText);
    notify(t('verif.saveCorrections'), doc.referenceNumber, 'success');
  };

  const handleVerifyApprove = () => {
    if (!canVerify) {
      notify(t('verif.title'), t('common.permissionDenied'), 'warning');
      return;
    }
    saveFieldCorrections(doc.id, fields, recognizedText);
    verifyDocument(doc.id, fields);
    notify(t('verif.verifyApprove'), doc.referenceNumber, 'success');
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    returnDocumentForCorrection(doc.id, returnReason.trim());
    setReturnReason('');
    setShowReturnBox(false);
    notify(t('verif.returnCorrection'), doc.referenceNumber, 'warning');
  };

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0B2545]">
            {t('verif.title')}
          </h1>
          <p className="text-sm text-slate-600 mt-1">{t('verif.subtitle')}</p>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="verif-doc-select"
            className="text-xs font-semibold text-slate-600 whitespace-nowrap"
          >
            {t('verif.selectDoc')}:
          </label>
          <select
            id="verif-doc-select"
            value={doc.id}
            onChange={(e) => setSelectedId(e.target.value)}
            className="px-3 py-2 text-xs font-mono rounded-xl bg-white border border-indigo-200 text-slate-900 max-w-xs"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.referenceNumber} · {d.workflowStage}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Smart Verification Assistant Notice */}
      <div className="bg-white rounded-xl border border-indigo-100 px-4 py-3 flex items-center gap-2.5 text-xs text-slate-700">
        <Info className="w-4 h-4 text-[#2563EB] shrink-0" />
        <span>{t('verif.aiAssistBanner')}</span>
      </div>

      {hasMissingRequired && (
        <div className="bg-red-50 rounded-xl border border-red-200 px-4 py-3 flex items-center gap-2.5 text-xs text-red-800 font-medium">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{t('verif.missingAlert')}</span>
        </div>
      )}

      {/* Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Original Document Viewer */}
        <section className="lg:col-span-6 bg-white rounded-2xl border border-indigo-100 overflow-hidden shadow-xs lg:sticky lg:top-20">
          <div className="px-4 py-3 border-b border-indigo-100 bg-[#F8F9FD] flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-mono font-semibold text-[#0B2545] truncate">
              {doc.referenceNumber} · {doc.fileName}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(60, z - 15))}
                title={t('verif.zoomOut')}
                className="p-1.5 rounded-lg border border-indigo-100 bg-white text-slate-700 hover:bg-indigo-50"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono tabular-nums text-xs px-1.5 text-slate-600">
                {zoom}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(220, z + 15))}
                title={t('verif.zoomIn')}
                className="p-1.5 rounded-lg border border-indigo-100 bg-white text-slate-700 hover:bg-indigo-50"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                title={t('verif.rotate')}
                className="p-1.5 rounded-lg border border-indigo-100 bg-white text-slate-700 hover:bg-indigo-50"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoom(100);
                  setRotation(0);
                }}
                className="px-2 py-1 rounded-lg border border-indigo-100 bg-white text-[11px] font-medium text-slate-600 hover:bg-indigo-50"
              >
                {t('verif.resetView')}
              </button>
            </div>
          </div>

          <div className="h-[600px] overflow-auto bg-[#EEF1FA] p-5 flex items-center justify-center">
            <img
              src={doc.imageUrl}
              alt={doc.referenceNumber}
              referrerPolicy="no-referrer"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              }}
              className="max-w-full max-h-full object-contain rounded-xl bg-white shadow-md transition-transform duration-150"
            />
          </div>
        </section>

        {/* Right: Editable Text, Fields & Correction History */}
        <section className="lg:col-span-6 space-y-5">
          <div className="bg-white rounded-2xl border border-indigo-100 p-5 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-indigo-50">
              <div>
                <div className="text-xs font-semibold text-[#2563EB]">
                  {t(`dept.${doc.departmentId}`)} · {t(`stage.${doc.workflowStage}`)}
                </div>
                <h2 className="font-display text-base font-bold text-[#0B2545]">
                  {doc.title}
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {doc.ocrSource}
              </span>
            </div>

            {/* Editable Extracted Text */}
            <div className="space-y-1.5">
              <label
                htmlFor="verif-raw-text"
                className="block text-xs font-bold text-[#0B2545]"
              >
                {t('verif.origText')}
              </label>
              <textarea
                id="verif-raw-text"
                rows={4}
                value={recognizedText}
                onChange={(e) => setRecognizedText(e.target.value)}
                className="w-full p-3 text-xs font-mono rounded-xl bg-[#F3F4FA] border border-indigo-100 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            {/* Structured Editable Fields */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-[#0B2545]">
                {t('verif.structuredFields')}
              </div>

              {fields.map((field) => (
                <div
                  key={field.key}
                  className={`p-3 rounded-xl border space-y-1.5 ${
                    field.reviewState === 'HighConfidence'
                      ? 'bg-emerald-50/25 border-emerald-200'
                      : field.reviewState === 'NeedsHumanReview'
                        ? 'bg-amber-50/50 border-amber-200'
                        : 'bg-red-50/50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor={`vf-${field.key}`}
                      className="text-xs font-semibold text-slate-800"
                    >
                      {field.customLabel || t(field.labelKey)}
                      {field.required && <span className="text-red-600 ml-1">*</span>}
                    </label>
                    <ReviewStateBadge
                      state={field.reviewState}
                      modelConfidence={field.modelConfidence}
                    />
                  </div>
                  <input
                    id={`vf-${field.key}`}
                    type="text"
                    value={field.value}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-indigo-100 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                  {field.issueNoteKey && (
                    <div className="text-[11px] text-amber-800">
                      {field.issueNoteKey}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Officer Action Buttons */}
            <div className="pt-3 border-t border-indigo-100 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleSaveCorrections}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-indigo-200 bg-white hover:bg-[#F3F4FA] text-xs font-semibold text-[#0B2545]"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{t('verif.saveCorrections')}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowReturnBox((v) => !v)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-xs font-semibold text-amber-800"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>{t('verif.returnCorrection')}</span>
              </button>

              <button
                type="button"
                onClick={handleVerifyApprove}
                className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B2545] hover:bg-[#13315C] text-white text-xs font-semibold"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('verif.verifyApprove')}</span>
              </button>
            </div>

            {showReturnBox && (
              <form
                onSubmit={handleReturnSubmit}
                className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row gap-2"
              >
                <input
                  type="text"
                  required
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder={t('verif.reasonPlaceholder')}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-white border border-amber-200 text-slate-900"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-amber-700 text-white text-xs font-semibold"
                >
                  {t('common.confirm')}
                </button>
              </form>
            )}
          </div>

          {/* Correction History */}
          <div className="bg-white rounded-2xl border border-indigo-100 p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0B2545]">
              <History className="w-4 h-4 text-[#2563EB]" />
              <span>{t('verif.correctionHistory')}</span>
            </div>

            {doc.correctionHistory.length === 0 ? (
              <p className="text-xs text-slate-500">{t('verif.noCorrections')}</p>
            ) : (
              <div className="divide-y divide-indigo-50 text-xs">
                {doc.correctionHistory.map((ch) => (
                  <div key={ch.id} className="py-2.5 space-y-0.5">
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <span>
                        {ch.actionType} · {ch.fieldKey}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {new Date(ch.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      {ch.officerName}: <span className="line-through">{ch.previousValue || '[Blank]'}</span> →{' '}
                      <strong className="text-[#0B2545]">{ch.updatedValue}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
