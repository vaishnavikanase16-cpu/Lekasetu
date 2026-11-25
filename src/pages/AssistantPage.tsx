import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, FileWarning } from 'lucide-react';
import { SarkarAssistantPanel } from '../components/assistant/SarkarAssistantWidget';
import { useApp } from '../context/AppContext';

export const AssistantPage: React.FC = () => {
  const navigate = useNavigate();
  const { documents, setAssistantDocId, assistantDocId } = useApp();

  const flaggedDocs = documents.filter(
    (d) => d.status === 'Low Confidence' || d.fields.some((f) => !f.value || f.confidence < 75)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          SARKAR AI Assistant
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Context-aware assistant for explaining extracted fields, identifying missing entries,
          and interpreting Kannada/English OCR confidence scores.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <SarkarAssistantPanel embedded />
        </div>

        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <FileWarning className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Flagged Records for Inspection</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click a flagged record to inspect its missing fields or low-confidence reasons in
              the assistant.
            </p>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {flaggedDocs.map((doc) => {
                const missing = doc.fields.filter((f) => !f.value.trim()).length;
                const low = doc.fields.filter((f) => f.confidence < 70).length;
                const isSelected = assistantDocId === doc.id;

                return (
                  <div key={doc.id} className="py-3 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setAssistantDocId(doc.id)}
                        className={`text-left text-xs font-mono font-semibold hover:underline ${
                          isSelected
                            ? 'text-[#1E3A8A] dark:text-blue-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {doc.applicationNumber}
                      </button>
                      <span className="font-mono tabular-nums text-[11px] text-slate-500">
                        {doc.overallConfidence}%
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {doc.departmentName} · {missing} blank · {low} low conf
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/documents/${doc.id}`)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1E3A8A] dark:text-blue-400 hover:underline"
                    >
                      Review Scan <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
              <AlertCircle className="w-4 h-4 text-[#1E3A8A] dark:text-blue-400" />
              <span>RAG Backend Readiness</span>
            </div>
            <p className="leading-relaxed">
              Currently powered by deterministic local form diagnostics (Demo Mode). When your
              Python FastAPI RAG server is connected in Settings, queries automatically route to
              your vector store of Karnataka government circulars and form manuals.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
