import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Landmark,
  ShieldCheck,
  Building2,
  Sprout,
  GraduationCap,
  HeartPulse,
  HandHeart,
  Bus,
  Users,
  Building,
  ArrowRight,
  Search,
  UploadCloud,
  X,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Department } from '../types';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Landmark,
  ShieldCheck,
  Building2,
  Sprout,
  GraduationCap,
  HeartPulse,
  HandHeart,
  Bus,
  Users,
  Building,
};

export const DepartmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { departments, documents, setSelectedDepartmentFilter } = useApp();
  const [search, setSearch] = useState('');
  const [activeDept, setActiveDept] = useState<Department | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return departments;
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.nameKn.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.formCategories.some((c) => c.toLowerCase().includes(q))
    );
  }, [departments, search]);

  const handleViewRecords = (deptId: string) => {
    setSelectedDepartmentFilter(deptId);
    navigate('/documents');
  };

  const handleUploadForDept = (deptId: string) => {
    navigate(`/upload?dept=${encodeURIComponent(deptId)}`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Government Departments
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            10 state & local departments configured with bilingual Kannada and English form schemas.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search departments or form types..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
          />
        </div>
      </div>

      {/* 10 Department Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-10 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No departments matched "{search}".
          </p>
          <button
            type="button"
            onClick={() => setSearch('')}
            className="mt-3 text-xs font-semibold text-[#1E3A8A] dark:text-blue-400 hover:underline"
          >
            Reset search filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((dept) => {
            const Icon = ICON_MAP[dept.iconName] || Building2;
            const localCount = documents.filter((d) => d.departmentId === dept.id).length;

            return (
              <article
                key={dept.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-md flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: dept.accentColor }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white leading-snug">
                          {dept.name}
                        </h2>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {dept.nameKn} · {dept.shortCode}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {dept.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Supported Form Categories
                    </div>
                    <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      {dept.formCategories.map((cat) => (
                        <li key={cat} className="truncate">
                          · {cat}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                    {(dept.totalProcessed + localCount).toLocaleString()} docs · {dept.avgConfidence}%
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveDept(dept)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#0F294A] hover:bg-[#1E3A8A] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Department Explore Drawer / Modal */}
      {activeDept && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-xl w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  {activeDept.shortCode} · {activeDept.nameKn}
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {activeDept.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveDept(null)}
                aria-label="Close department details"
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {activeDept.description}
            </p>

            <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Processed</div>
                <div className="font-mono tabular-nums text-lg font-bold text-slate-900 dark:text-white">
                  {activeDept.totalProcessed}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Avg Confidence</div>
                <div className="font-mono tabular-nums text-lg font-bold text-emerald-700 dark:text-emerald-400">
                  {activeDept.avgConfidence}%
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Pending Review</div>
                <div className="font-mono tabular-nums text-lg font-bold text-amber-700 dark:text-amber-400">
                  {activeDept.pendingCount}
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Select a Form Template to Upload & Digitize
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeDept.formCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      navigate(
                        `/upload?dept=${encodeURIComponent(activeDept.id)}&form=${encodeURIComponent(cat)}`
                      )
                    }
                    className="flex items-center gap-2 p-2.5 rounded-md border border-slate-200 dark:border-slate-700 hover:border-[#1E3A8A] dark:hover:border-blue-500 text-left text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-blue-400 shrink-0" />
                    <span className="truncate">{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const id = activeDept.id;
                  setActiveDept(null);
                  handleViewRecords(id);
                }}
                className="px-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                View Department Records
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = activeDept.id;
                  setActiveDept(null);
                  handleUploadForDept(id);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#0F294A] hover:bg-[#1E3A8A] text-white text-xs font-semibold"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload to {activeDept.shortCode}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
