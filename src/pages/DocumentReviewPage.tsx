import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  CheckCircle2,
  Save,
  Download,
  Bot,
  ArrowLeft,
  AlertTriangle,
  Plus,
  FileJson,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ConfidenceIndicator } from '../components/common/ConfidenceIndicator';
import {
  exportDocumentAsCSV,
  exportDocumentAsJSON,
} from '../services/documentService';
import { ExtractedField } from '../types';

export const DocumentReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    documents,
    updateDocumentRecord,
    openAssistantForDoc,
    addHistoryEvent,
    user,
    backendMode,
    notify,
  } = useApp();

  const doc = useMemo(
    () => documents.find((d) => d.id === id) || documents[0],
    [documents, id]
  );

  const [fields, setFields] = useState<ExtractedField[]>(doc?.fields || []);
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Add custom field state
  const [showAddField, setShowAddField] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');

  useEffect(() => {
    if (doc) {
      setFields(doc.fields);
      setHasUnsavedEdits(false);
      setZoom(100);
      setRotation(0);
    }
  }, [doc]);

  if (!doc) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-10 text-center space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-400">No document found.</p>
        <button
          type="button"
          onClick={() => navigate('/documents')}
          className="px-4 py-2 rounded-md bg-[#0F294A] text-white text-xs font-semibold"
        >
          Back to Document Records
        </button>
      </div>
    );
  }

  const handleFieldChange = (key: string, nextVal: string) => {
    setFields((prev) =>
      prev.map((f) =>
        f.key === key
          ? {
              ...f,
              value: nextVal,
              confidence: nextVal.trim() === '' ? 15 : Math.max(f.confidence, 92),
              lastEditedBy: user?.name || 'Officer',
            }
          : f
      )
    );
    setHasUnsavedEdits(true);
  };

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldLabel.trim()) return;
    const key = newFieldLabel
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_');
    setFields((prev) => [
      ...prev,
      {
        key,
        label: newFieldLabel.trim(),
        value: newFieldValue.trim(),
        confidence: 100,
        lastEditedBy: user?.name || 'Officer',
      },
    ]);
    setNewFieldLabel('');
    setNewFieldValue('');
    setShowAddField(false);
    setHasUnsavedEdits(true);
  };

  const handleSave = async (verify: boolean) => {
    setIsSaving(true);
    const avgScore = Math.round(
      fields.reduce((acc, f) => acc + f.confidence, 0) / Math.max(fields.length, 1)
    );
    const nextStatus = verify
      ? 'Verified'
      : avgScore < 70
        ? 'Low Confidence'
        : 'Pending Review';

    await updateDocumentRecord(
      doc.id,
      fields,
      nextStatus,
      verify
        ? `Verified all ${fields.length} fields and committed digital record.`
        : 'Saved manual field edits as pending review.'
    );
    setIsSaving(false);
    setHasUnsavedEdits(false);
    notify(
      verify ? 'Record Verified & Saved' : 'Changes Saved',
      `${doc.applicationNumber} updated in local repository.`,
      'success'
    );
  };

  const handleExportCSV = () => {
    exportDocumentAsCSV({ ...doc, fields });
    addHistoryEvent({
      documentId: doc.id,
      applicationNumber: doc.applicationNumber,
      departmentName: doc.departmentName,
      action: 'Exported',
      actor: user?.name || 'Officer',
      details: 'Exported structured fields as UTF-8 CSV.',
      mode: backendMode === 'fastapi' ? 'FastAPI Live' : 'Demo Simulation',
    });
    notify('CSV Exported', `${doc.applicationNumber}.csv downloaded.`, 'success');
  };

  const handleExportJSON = () => {
    exportDocumentAsJSON({ ...doc, fields });
    addHistoryEvent({
      documentId: doc.id,
      applicationNumber: doc.applicationNumber,
      departmentName: doc.departmentName,
      action: 'Exported',
      actor: user?.name || 'Officer',
      details: 'Exported structured record as JSON.',
      mode: backendMode === 'fastapi' ? 'FastAPI Live' : 'Demo Simulation',
    });
    notify('JSON Exported', `${doc.applicationNumber}.json downloaded.`, 'success');
  };

  const liveAvgConfidence = Math.round(
    fields.reduce((acc, f) => acc + f.confidence, 0) / Math.max(fields.length, 1)
  );
  const lowFieldsCount = fields.filter((f) => f.confidence < 65).length;

  return (
    <div className="space-y-5">
      {/* Top Action Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <button
              type="button"
              onClick={() => navigate('/documents')}
              className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Records
            </button>
            <span aria-hidden="true">/</span>
            <span className="font-mono">{doc.applicationNumber}</span>
            <span aria-hidden="true">/</span>
            <span>{doc.processingMode}</span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {doc.title}
          </h1>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {doc.departmentName} · {doc.language} · Status:{' '}
            <strong
              className={
                doc.status === 'Verified'
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : doc.status === 'Low Confidence'
                    ? 'text-red-700 dark:text-red-400'
                    : 'text-amber-700 dark:text-amber-400'
              }
            >
              {doc.status}
            </strong>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => openAssistantForDoc(doc.id)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
          >
            <Bot className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-blue-400" />
            <span>Ask SARKAR AI</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave(false)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{hasUnsavedEdits ? 'Save Edits*' : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verify & Save Record</span>
          </button>
        </div>
      </div>

      {/* Split-Screen Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANE: Original Scanned Document Preview with Zoom & Rotate */}
        <section className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden lg:sticky lg:top-20">
          <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-950/60">
            <span className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
              {doc.fileName}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(50, z - 15))}
                title="Zoom Out"
                aria-label="Zoom Out"
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono tabular-nums px-2 text-slate-700 dark:text-slate-300">
                {zoom}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(220, z + 15))}
                title="Zoom In"
                aria-label="Zoom In"
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <span className="mx-1 text-slate-300 dark:text-slate-700">|</span>

              <button
                type="button"
                onClick={() => setRotation((r) => (r - 90) % 360)}
                title="Rotate Left 90°"
                aria-label="Rotate Left 90 degrees"
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                title="Rotate Right 90°"
                aria-label="Rotate Right 90 degrees"
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoom(100);
                  setRotation(0);
                }}
                className="ml-1 px-2 py-1 rounded text-[11px] font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="h-[640px] overflow-auto bg-slate-200/70 dark:bg-slate-950 p-6 flex items-center justify-center">
            {doc.fileType === 'application/pdf' ? (
              <iframe
                src={doc.imageUrl}
                title={doc.fileName}
                className="w-full h-full rounded border border-slate-300 dark:border-slate-700 bg-white"
              />
            ) : (
              <img
                src={doc.imageUrl}
                alt={`Scanned document ${doc.applicationNumber}`}
                referrerPolicy="no-referrer"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                }}
                className="max-w-full max-h-full object-contain rounded shadow-md bg-white transition-transform duration-150"
              />
            )}
          </div>
        </section>

        {/* RIGHT PANE: Editable Extracted Fields + Field-wise Confidence */}
        <section className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Extracted Structured Data
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Overall Confidence:{' '}
                <strong className="font-mono tabular-nums text-slate-900 dark:text-white">
                  {liveAvgConfidence}%
                </strong>
                {lowFieldsCount > 0 && (
                  <span className="ml-2 text-red-700 dark:text-red-400 font-medium">
                    · {lowFieldsCount} field(s) need verification
                  </span>
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddField((v) => !v)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Plus className="w-3.5 h-3.5" /> Add Field
            </button>
          </div>

          {/* Confidence Legend */}
          <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-4 text-[11px] text-slate-600 dark:text-slate-400">
            <span>Confidence Scale:</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">
              Green (85–100%) High
            </span>
            <span className="text-amber-700 dark:text-amber-400 font-medium">
              Yellow (65–84%) Medium
            </span>
            <span className="text-red-700 dark:text-red-400 font-medium">
              Red (&lt;65%) Low
            </span>
          </div>

          {showAddField && (
            <form
              onSubmit={handleAddField}
              className="p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-2"
            >
              <input
                type="text"
                value={newFieldLabel}
                onChange={(e) => setNewFieldLabel(e.target.value)}
                placeholder="Field name (e.g., Taluk Name)"
                className="flex-1 px-3 py-1.5 text-xs rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
              <input
                type="text"
                value={newFieldValue}
                onChange={(e) => setNewFieldValue(e.target.value)}
                placeholder="Value"
                className="flex-1 px-3 py-1.5 text-xs rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-md bg-[#0F294A] text-white text-xs font-semibold"
              >
                Add
              </button>
            </form>
          )}

          {/* Editable Field List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {fields.map((field) => {
              const isLow = field.confidence < 65;
              const isBlank = !field.value || field.value.trim() === '';

              return (
                <div
                  key={field.key}
                  className={`p-4 space-y-2 ${
                    isLow || isBlank ? 'bg-red-50/40 dark:bg-red-950/15' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor={`field-${field.key}`}
                      className="text-xs font-semibold text-slate-800 dark:text-slate-200"
                    >
                      {field.label}
                      {field.labelKn && (
                        <span className="ml-1.5 font-normal text-slate-500 dark:text-slate-400">
                          ({field.labelKn})
                        </span>
                      )}
                      {field.required && (
                        <span className="ml-1 text-red-600 dark:text-red-400">*</span>
                      )}
                    </label>
                    <ConfidenceIndicator score={field.confidence} showBar />
                  </div>

                  <input
                    id={`field-${field.key}`}
                    type="text"
                    value={field.value}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                    className={`w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-slate-950 border text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] ${
                      isLow || isBlank
                        ? 'border-red-300 dark:border-red-800'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />

                  {(field.ocrNote || field.lastEditedBy) && (
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      {field.ocrNote && (
                        <span className="inline-flex items-center gap-1 text-amber-800 dark:text-amber-300">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          {field.ocrNote}
                        </span>
                      )}
                      {field.lastEditedBy && (
                        <span className="text-slate-500 dark:text-slate-400 ml-auto">
                          Edited by {field.lastEditedBy}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              All edits are stored in the local offline database and queued for central sync.
            </span>
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A] dark:text-blue-400 hover:underline"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Verified CSV</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
