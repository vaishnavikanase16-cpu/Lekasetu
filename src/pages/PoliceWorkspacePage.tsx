import React, { useState } from 'react';
import {
  ShieldAlert,
  Save,
  Send,
  Eye,
  Printer,
  X,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { OFFICES_BY_DEPARTMENT } from '../data/mockData';
import { InputLanguageMode, PoliceComplaintRecord } from '../types';

function generateInternalRef(): string {
  const num = Math.floor(1000 + Math.random() * 8999);
  return `INT-POL-KA-2026-${num}`;
}

export const PoliceWorkspacePage: React.FC = () => {
  const { policeComplaints, addPoliceComplaint, notify } = useApp();
  const { t } = useLanguage();

  const [internalRefNumber, setInternalRefNumber] = useState(generateInternalRef);
  const [policeStation, setPoliceStation] = useState(
    OFFICES_BY_DEPARTMENT.police[0]
  );
  const [entryDateTime, setEntryDateTime] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [complainantName, setComplainantName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [incidentDate, setIncidentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [incidentLocation, setIncidentLocation] = useState('');
  const [inputMode, setInputMode] = useState<InputLanguageMode>('Both');
  const [narrativeEn, setNarrativeEn] = useState('');
  const [narrativeKn, setNarrativeKn] = useState('');
  const [supportingDocsText, setSupportingDocsText] = useState('');

  const [previewRecord, setPreviewRecord] =
    useState<Omit<PoliceComplaintRecord, 'id' | 'submittedAt' | 'createdBy'> | null>(
      null
    );
  const [ackRecord, setAckRecord] = useState<PoliceComplaintRecord | null>(null);

  const buildPayload = (
    status: PoliceComplaintRecord['status']
  ): Omit<PoliceComplaintRecord, 'id' | 'submittedAt' | 'createdBy'> => ({
    internalRefNumber,
    policeStation,
    complainantName: complainantName.trim() || 'Unspecified Complainant',
    contactNumber: contactNumber.trim(),
    address: address.trim(),
    incidentDate,
    incidentLocation: incidentLocation.trim(),
    inputMode,
    narrativeEn: narrativeEn.trim(),
    narrativeKn: narrativeKn.trim(),
    supportingDocs: supportingDocsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    status,
  });

  const handleSave = (status: PoliceComplaintRecord['status']) => {
    if (!complainantName.trim()) {
      notify(t('police.title'), t('police.complainantName'), 'warning');
      return;
    }
    const saved = addPoliceComplaint(buildPayload(status));
    setAckRecord(saved);
    notify(
      status === 'Draft' ? t('police.saveDraft') : t('police.submitReview'),
      saved.internalRefNumber,
      'success'
    );
    setInternalRefNumber(generateInternalRef());
    setComplainantName('');
    setContactNumber('');
    setAddress('');
    setIncidentLocation('');
    setNarrativeEn('');
    setNarrativeKn('');
    setSupportingDocsText('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#0B2545]">
          {t('police.title')}
        </h1>
        <p className="text-sm text-slate-600 mt-1">{t('police.subtitle')}</p>
      </div>

      {/* Statutory Disclaimer */}
      <div className="bg-amber-50 rounded-xl border border-amber-200 px-4 py-3 flex items-start gap-2.5 text-xs text-amber-900">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <span className="font-medium">{t('police.disclaimer')}</span>
      </div>

      {/* Complaint Entry Form */}
      <section className="bg-white rounded-2xl border border-indigo-100 p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="pc-ref"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {t('police.refNumber')}
            </label>
            <input
              id="pc-ref"
              type="text"
              readOnly
              value={internalRefNumber}
              className="w-full px-3 py-2 text-xs font-mono font-semibold rounded-xl bg-[#EEF1FA] border border-indigo-100 text-[#0B2545]"
            />
          </div>

          <div>
            <label
              htmlFor="pc-station"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {t('police.station')}
            </label>
            <select
              id="pc-station"
              value={policeStation}
              onChange={(e) => setPoliceStation(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#F3F4FA] border border-indigo-100 text-slate-900"
            >
              {OFFICES_BY_DEPARTMENT.police.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="pc-dt"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {t('police.dateTime')}
            </label>
            <input
              id="pc-dt"
              type="datetime-local"
              value={entryDateTime}
              onChange={(e) => setEntryDateTime(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-[#F3F4FA] border border-indigo-100 text-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="pc-name"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {t('police.complainantName')} *
            </label>
            <input
              id="pc-name"
              type="text"
              value={complainantName}
              onChange={(e) => setComplainantName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#F3F4FA] border border-indigo-100 text-slate-900"
            />
          </div>

          <div>
            <label
              htmlFor="pc-phone"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {t('police.contactNumber')}
            </label>
            <input
              id="pc-phone"
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-[#F3F4FA] border border-indigo-100 text-slate-900"
            />
          </div>

          <div>
            <label
              htmlFor="pc-inc-date"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {t('police.incidentDate')}
            </label>
            <input
              id="pc-inc-date"
              type="date"
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-[#F3F4FA] border border-indigo-100 text-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="pc-address"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {t('police.address')}
            </label>
            <input
              id="pc-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#F3F4FA] border border-indigo-100 text-slate-900"
            />
          </div>

          <div>
            <label
              htmlFor="pc-loc"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {t('police.incidentLocation')}
            </label>
            <input
              id="pc-loc"
              type="text"
              value={incidentLocation}
              onChange={(e) => setIncidentLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#F3F4FA] border border-indigo-100 text-slate-900"
            />
          </div>
        </div>

        {/* 3 Input Modes: Kannada / English / Both */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700">
              {t('police.inputMode')}
            </span>
            <div className="inline-flex p-0.5 rounded-xl bg-[#EEF1FA] border border-indigo-100">
              {(
                [
                  { val: 'Kannada', label: t('intake.langKn') },
                  { val: 'English', label: t('intake.langEn') },
                  { val: 'Both', label: t('intake.langBoth') },
                ] as const
              ).map((m) => (
                <button
                  key={m.val}
                  type="button"
                  onClick={() => setInputMode(m.val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    inputMode === m.val
                      ? 'bg-[#0B2545] text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div
            className={`grid gap-4 ${
              inputMode === 'Both' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
            }`}
          >
            {(inputMode === 'Kannada' || inputMode === 'Both') && (
              <div>
                <label
                  htmlFor="pc-nar-kn"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  {t('police.narrativeKn')}
                </label>
                <textarea
                  id="pc-nar-kn"
                  rows={5}
                  value={narrativeKn}
                  onChange={(e) => setNarrativeKn(e.target.value)}
                  placeholder="ಕನ್ನಡದಲ್ಲಿ ದೂರಿನ ವಿವರವನ್ನು ನಮೂದಿಸಿ..."
                  className="w-full p-3 text-xs rounded-xl bg-[#F3F4FA] border border-indigo-100 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
            )}

            {(inputMode === 'English' || inputMode === 'Both') && (
              <div>
                <label
                  htmlFor="pc-nar-en"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  {t('police.narrativeEn')}
                </label>
                <textarea
                  id="pc-nar-en"
                  rows={5}
                  value={narrativeEn}
                  onChange={(e) => setNarrativeEn(e.target.value)}
                  placeholder="Enter complaint narrative in English..."
                  className="w-full p-3 text-xs rounded-xl bg-[#F3F4FA] border border-indigo-100 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="pc-docs"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            {t('police.supportingDocs')}
          </label>
          <input
            id="pc-docs"
            type="text"
            value={supportingDocsText}
            onChange={(e) => setSupportingDocsText(e.target.value)}
            placeholder="e.g., ID_Proof.jpg, Handwritten_Letter.pdf"
            className="w-full px-3 py-2 text-xs rounded-xl bg-[#F3F4FA] border border-indigo-100 text-slate-900"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-indigo-100 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleSave('Draft')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-indigo-200 bg-white hover:bg-[#F3F4FA] text-xs font-semibold text-[#0B2545]"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{t('police.saveDraft')}</span>
          </button>

          <button
            type="button"
            onClick={() => setPreviewRecord(buildPayload('Draft'))}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-indigo-200 bg-white hover:bg-[#F3F4FA] text-xs font-semibold text-[#0B2545]"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t('police.preview')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (ackRecord) {
                window.print();
              } else {
                const temp: PoliceComplaintRecord = {
                  ...buildPayload('Draft'),
                  id: 'preview-ack',
                  submittedAt: new Date().toISOString(),
                  createdBy: 'Officer',
                };
                setAckRecord(temp);
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-indigo-200 bg-white hover:bg-[#F3F4FA] text-xs font-semibold text-[#0B2545]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t('police.printAck')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave('Submitted for Officer Review')}
            className="ml-auto inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0B2545] hover:bg-[#13315C] text-white text-xs font-semibold"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t('police.submitReview')}</span>
          </button>
        </div>
      </section>

      {/* Saved Internal Complaints List */}
      <section className="bg-white rounded-2xl border border-indigo-100 overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-indigo-100 font-display text-sm font-bold text-[#0B2545]">
          {t('police.savedList')}
        </div>
        <div className="divide-y divide-indigo-50 text-xs">
          {policeComplaints.map((c) => (
            <div
              key={c.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="font-mono font-bold text-[#0B2545]">
                  {c.internalRefNumber} ·{' '}
                  <span className="font-sans font-semibold">{c.complainantName}</span>
                </div>
                <div className="text-slate-600">
                  {c.policeStation} · {c.incidentLocation || 'Location not specified'}
                  {!c.address && (
                    <span className="ml-2 text-red-700 font-semibold">
                      · Address Missing
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-medium text-[#2563EB]">{c.status}</span>
                <button
                  type="button"
                  onClick={() => setAckRecord(c)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-[#F3F4FA] font-semibold text-[#0B2545]"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{t('police.printAck')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Preview / Acknowledgement Modal */}
      {(previewRecord || ackRecord) && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-indigo-100 max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-[#0B2545]">
                {ackRecord ? t('police.ackTitle') : t('police.preview')}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setPreviewRecord(null);
                  setAckRecord(null);
                }}
                aria-label={t('common.close')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(() => {
              const item = ackRecord || previewRecord!;
              return (
                <div className="space-y-2.5 text-xs border-y border-indigo-100 py-4">
                  <div>
                    <strong>{t('police.refNumber')}:</strong>{' '}
                    <span className="font-mono">{item.internalRefNumber}</span>
                  </div>
                  <div>
                    <strong>{t('police.station')}:</strong> {item.policeStation}
                  </div>
                  <div>
                    <strong>{t('police.complainantName')}:</strong> {item.complainantName}
                  </div>
                  <div>
                    <strong>{t('police.address')}:</strong>{' '}
                    {item.address || '[Missing]'}
                  </div>
                  <div>
                    <strong>{t('police.incidentLocation')}:</strong>{' '}
                    {item.incidentLocation || '—'}
                  </div>
                  {item.narrativeEn && (
                    <div className="p-2.5 rounded-lg bg-[#F3F4FA]">
                      <strong>EN:</strong> {item.narrativeEn}
                    </div>
                  )}
                  {item.narrativeKn && (
                    <div className="p-2.5 rounded-lg bg-[#F3F4FA]">
                      <strong>KN:</strong> {item.narrativeKn}
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="flex justify-end gap-2 no-print">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B2545] text-white text-xs font-semibold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('police.printAck')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
