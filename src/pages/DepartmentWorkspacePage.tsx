import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  Landmark,
  HeartPulse,
  GraduationCap,
  Building,
  ArrowRight,
  UploadCloud,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { PoliceWorkspacePage } from './PoliceWorkspacePage';

const DEPT_ICONS: Record<string, React.FC<{ className?: string }>> = {
  ShieldCheck,
  Building2,
  Landmark,
  HeartPulse,
  GraduationCap,
  Building,
};

export const DepartmentWorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const { departments, documents, setSelectedDepartment } = useApp();
  const { t } = useLanguage();
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'overview' | 'police_entry'>(
    'overview'
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0B2545]">
            {t('depts.title')}
          </h1>
          <p className="text-sm text-slate-600 mt-1">{t('depts.subtitle')}</p>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-white border border-indigo-100">
          <button
            type="button"
            onClick={() => setActiveWorkspaceTab('overview')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeWorkspaceTab === 'overview'
                ? 'bg-[#0B2545] text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('depts.title')} (6)
          </button>
          <button
            type="button"
            onClick={() => setActiveWorkspaceTab('police_entry')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeWorkspaceTab === 'police_entry'
                ? 'bg-[#0B2545] text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('dept.police')} · {t('police.title').split('–')[1] || 'Complaint Entry'}
          </button>
        </div>
      </div>

      {activeWorkspaceTab === 'police_entry' ? (
        <PoliceWorkspacePage />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {departments.map((dept) => {
            const Icon = DEPT_ICONS[dept.iconName] || Building2;
            const deptCount = documents.filter(
              (d) => d.departmentId === dept.id
            ).length;

            return (
              <article
                key={dept.id}
                className="bg-white rounded-2xl border border-indigo-100 p-5 flex flex-col justify-between gap-4 shadow-xs"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0"
                        style={{ backgroundColor: dept.accentHex }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-display text-base font-bold text-[#0B2545] truncate">
                          {t(dept.nameKey)}
                        </h2>
                        <div className="text-xs font-mono text-slate-500">
                          {deptCount} local records
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold text-slate-700 mb-1.5">
                      {t('depts.categories')}
                    </div>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {dept.categories.map((cat) => (
                        <li key={cat} className="truncate">
                          · {cat}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold text-slate-700 mb-1.5">
                      {t('depts.fields')}
                    </div>
                    <div className="text-xs text-slate-600 leading-relaxed">
                      {dept.configurableFields.join(' · ')}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-indigo-50 flex flex-wrap items-center justify-between gap-2">
                  {dept.id === 'police' ? (
                    <button
                      type="button"
                      onClick={() => setActiveWorkspaceTab('police_entry')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold"
                    >
                      <span>{t('police.submitReview').split(' ')[0]} / Entry</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDepartment(dept.id);
                        navigate('/files');
                      }}
                      className="text-xs font-semibold text-[#2563EB] hover:underline"
                    >
                      {t('depts.viewFiles')}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => navigate(`/intake?dept=${dept.id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B2545] hover:bg-[#13315C] text-white text-xs font-semibold"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{t('depts.openIntake')}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
