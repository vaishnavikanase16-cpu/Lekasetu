import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Send,
  FileText,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { LEKHA_ASSETS } from '../data/mockData';
import { ragService } from '../services/ragService';
import { RagQueryResult } from '../types';

interface RagMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  result?: RagQueryResult;
  timestamp: string;
}

const SUGGESTED_EN = [
  'Find all applications from Belagavi this month',
  'Show complaints with missing addresses',
  'Find application KA2025/1047',
  'Summarize the selected documents',
  'Find pending verification records',
];

const SUGGESTED_KN = [
  'ಈ ತಿಂಗಳು ಬೆಳಗಾವಿಯಿಂದ ಬಂದ ಎಲ್ಲಾ ಅರ್ಜಿಗಳನ್ನು ಹುಡುಕಿ',
  'ವಿಳಾಸ ಕಾಣೆಯಾಗಿರುವ ದೂರುಗಳನ್ನು ತೋರಿಸಿ',
  'KA2025/1047 ಅರ್ಜಿಯನ್ನು ಹುಡುಕಿ',
  'ಪರಿಶೀಲನೆ ಬಾಕಿ ಇರುವ ದಾಖಲೆಗಳನ್ನು ಹುಡುಕಿ',
];

export const AskNammaDocsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { documents, policeComplaints, selectedDepartment } = useApp();
  const { language, t } = useLanguage();

  const [queryInput, setQueryInput] = useState('');
  const [messages, setMessages] = useState<RagMessage[]>([]);

  const executeQuery = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;

    const now = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg: RagMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: now,
    };

    const res = ragService.queryLocalRecords(
      trimmed,
      documents,
      policeComplaints,
      selectedDepartment,
      language
    );

    const botMsg: RagMessage = {
      id: `b-${Date.now() + 1}`,
      sender: 'assistant',
      text: res.answer,
      result: res,
      timestamp: now,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setQueryInput('');
  };

  useEffect(() => {
    const initialQ = searchParams.get('q');
    if (initialQ) {
      executeQuery(initialQ);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const suggestions = language === 'kn' ? SUGGESTED_KN : SUGGESTED_EN;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0B2545]">
            {t('rag.title')}
          </h1>
          <p className="text-sm text-slate-600 mt-1">{t('rag.subtitle')}</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3 py-2 rounded-xl border border-indigo-100">
          <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
          <span>
            {t('rag.scopeNotice')}: <strong>{t(`dept.${selectedDepartment}`)}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Conversation Column */}
        <section className="lg:col-span-8 bg-white rounded-2xl border border-indigo-100 shadow-xs flex flex-col h-[620px] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-indigo-100 bg-gradient-to-r from-[#0B2545] to-[#13315C] text-white flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={LEKHA_ASSETS.NAMMADOCS_BOT}
                alt="Ask NammaDocs"
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-xl object-cover border border-white/20"
              />
              <div>
                <div className="text-sm font-bold">{t('nav.nammadocs')}</div>
                <div className="text-[11px] text-blue-200">{t('rag.archNote')}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMessages([])}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('rag.clearChat')}</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F8F9FD]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-3">
                <img
                  src={LEKHA_ASSETS.NAMMADOCS_BOT}
                  alt="NammaDocs"
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-2xl object-cover border border-indigo-100"
                />
                <div className="text-sm font-bold text-[#0B2545]">
                  {t('dash.askPreviewTitle')}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('rag.subtitle')}
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-[#0B2545] text-white'
                        : 'bg-white border border-indigo-100 text-slate-800 shadow-xs'
                    }`}
                  >
                    {msg.text}

                    {/* Grounded Source Citations */}
                    {msg.result &&
                      (msg.result.matchedDocuments.length > 0 ||
                        msg.result.matchedComplaints.length > 0) && (
                        <div className="mt-3 pt-3 border-t border-indigo-100 space-y-2">
                          <div className="text-[11px] font-bold text-[#0B2545]">
                            {t('rag.sourcesUsed')} (
                            {msg.result.matchedDocuments.length +
                              msg.result.matchedComplaints.length}
                            ) · {msg.result.architectureNote}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {msg.result.matchedDocuments.map((doc) => (
                              <button
                                key={doc.id}
                                type="button"
                                onClick={() => navigate(`/verification/${doc.id}`)}
                                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#F3F4FA] hover:bg-blue-50 border border-indigo-100 text-left transition-colors"
                              >
                                <div className="min-w-0">
                                  <div className="font-mono font-bold text-[#0B2545] truncate">
                                    {doc.referenceNumber}
                                  </div>
                                  <div className="text-[11px] text-slate-600 truncate">
                                    {doc.applicantName} · {doc.district}
                                  </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                              </button>
                            ))}

                            {msg.result.matchedComplaints.map((pc) => (
                              <button
                                key={pc.id}
                                type="button"
                                onClick={() => navigate('/departments')}
                                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#F3F4FA] hover:bg-blue-50 border border-indigo-100 text-left transition-colors"
                              >
                                <div className="min-w-0">
                                  <div className="font-mono font-bold text-[#0B2545] truncate">
                                    {pc.internalRefNumber}
                                  </div>
                                  <div className="text-[11px] text-slate-600 truncate">
                                    {pc.complainantName} · {pc.policeStation}
                                  </div>
                                </div>
                                <FileText className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                  <span className="mt-1 text-[10px] font-mono text-slate-400">
                    {msg.timestamp}
                  </span>
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeQuery(queryInput);
            }}
            className="p-3.5 border-t border-indigo-100 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder={t('rag.placeholder')}
              className="flex-1 min-w-0 px-3.5 py-2.5 text-xs rounded-xl bg-[#F3F4FA] border border-indigo-100 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#13315C] text-white text-xs font-semibold whitespace-nowrap shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('rag.send')}</span>
            </button>
          </form>
        </section>

        {/* Right: Suggested Queries & Summarize Action */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-indigo-100 p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0B2545]">
              <Sparkles className="w-4 h-4 text-[#2563EB]" />
              <span>{t('rag.suggested')}</span>
            </div>

            <div className="space-y-2">
              {suggestions.map((sq) => (
                <button
                  key={sq}
                  type="button"
                  onClick={() => executeQuery(sq)}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl bg-[#F3F4FA] hover:bg-blue-50 border border-indigo-100 text-xs font-medium text-slate-800 transition-colors"
                >
                  {sq}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                executeQuery(
                  language === 'kn'
                    ? 'ಆಯ್ಕೆಮಾಡಿದ ದಾಖಲೆಗಳನ್ನು ಸಾರಾಂಶಿಸಿ'
                    : 'Summarize the selected documents'
                )
              }
              className="w-full px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors"
            >
              {t('rag.summarizeSelected')}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
