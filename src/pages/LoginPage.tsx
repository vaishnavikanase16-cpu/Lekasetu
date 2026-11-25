import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, Lock, Mail, ArrowRight, WifiOff, ShieldCheck } from 'lucide-react';
import { DEMO_OFFICERS } from '../data/mockData';
import { useApp } from '../context/AppContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsOfficer, loginWithCustomEmail, offlineState } = useApp();
  const [email, setEmail] = useState('arvind.deshpande@karnataka.gov.in');
  const [password, setPassword] = useState('SarkarOffline@2026');
  const [selectedOfficerId, setSelectedOfficerId] = useState(DEMO_OFFICERS[0].id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = DEMO_OFFICERS.find(
      (o) => o.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (matched) {
      loginAsOfficer(matched.id);
    } else {
      loginWithCustomEmail(email.trim(), 'District Digitization Officer', 'Revenue Department');
    }
    navigate('/');
  };

  const handleQuickDemoLogin = (officerId: string) => {
    setSelectedOfficerId(officerId);
    loginAsOfficer(officerId);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Subtle Top Tricolor Rule */}
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-[#EA580C]" />
        <div className="flex-1 bg-white dark:bg-slate-200" />
        <div className="flex-1 bg-[#16A34A]" />
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12">
        {/* Left Civic Brand Column */}
        <div className="lg:col-span-6 bg-[#0B1F3A] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-white/10 border border-white/15 flex items-center justify-center">
                <Landmark className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="font-display text-lg font-bold tracking-tight">SARKAR AI</div>
                <div className="text-xs text-slate-300">
                  Government Document Digitization Workstation
                </div>
              </div>
            </div>

            <div className="space-y-4 max-w-xl">
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-balance leading-tight">
                Offline Intelligent Government Document Processing System
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Designed for Taluk, Gram Panchayat, and District offices to digitize handwritten
                Kannada and English paper applications without requiring continuous internet
                connectivity.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 max-w-xl">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-xs font-semibold text-amber-300">Bilingual OCR Engine</div>
                <div className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Handwritten Kannada (ಕನ್ನಡ) and English script extraction with field-level
                  confidence scoring.
                </div>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-xs font-semibold text-emerald-300">Air-Gapped Security</div>
                <div className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Local SQLite storage and quantized AI inference keep citizen records inside
                  department premises.
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1.5">
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              {offlineState.offlineMode ? 'Offline Node Active' : 'Central Link Ready'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Demo Authentication Ready
            </span>
          </div>
        </div>

        {/* Right Login Form Column */}
        <div className="lg:col-span-6 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                Employee Sign In
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Authenticate with your department credentials or use a demo officer profile below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Government Email / Employee ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Workstation Passcode
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#0F294A] hover:bg-[#1E3A8A] text-white text-sm font-semibold transition-colors"
              >
                <span>Sign In to Workstation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Officers */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                One-Click Demo Officer Profiles
              </div>
              <div className="space-y-2">
                {DEMO_OFFICERS.map((officer) => (
                  <button
                    key={officer.id}
                    type="button"
                    onClick={() => handleQuickDemoLogin(officer.id)}
                    className={`w-full flex items-center justify-between gap-3 p-3 rounded-lg border text-left transition-colors ${
                      selectedOfficerId === officer.id
                        ? 'border-[#1E3A8A] bg-blue-50/50 dark:bg-blue-950/30 dark:border-blue-700'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={officer.avatarUrl}
                        alt={officer.name}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-md object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {officer.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {officer.designation} · {officer.district}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-[#1E3A8A] dark:text-blue-400 whitespace-nowrap shrink-0">
                      Enter
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
