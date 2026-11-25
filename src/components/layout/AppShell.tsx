import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FilePlus2,
  ScanLine,
  ShieldCheck,
  FolderKanban,
  Route as RouteIcon,
  MessageSquareText,
  Building2,
  BarChart3,
  Bell,
  ClipboardList,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  WifiOff,
  Wifi,
  ChevronRight,
  Menu,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { DepartmentId, UserRole } from '../../types';

const NAV_ITEMS = [
  { to: '/', key: 'nav.dashboard', icon: LayoutDashboard, end: true },
  { to: '/intake', key: 'nav.intake', icon: FilePlus2 },
  { to: '/scanner', key: 'nav.scanner', icon: ScanLine },
  { to: '/verification', key: 'nav.verification', icon: ShieldCheck },
  { to: '/files', key: 'nav.files', icon: FolderKanban },
  { to: '/tracking', key: 'nav.tracking', icon: RouteIcon },
  { to: '/nammadocs', key: 'nav.nammadocs', icon: MessageSquareText },
  { to: '/departments', key: 'nav.departments', icon: Building2 },
  { to: '/reports', key: 'nav.reports', icon: BarChart3 },
  { to: '/notifications', key: 'nav.notifications', icon: Bell },
  { to: '/audit', key: 'nav.audit', icon: ClipboardList },
  { to: '/settings', key: 'nav.settings', icon: Settings },
];

const ROUTE_LABEL_KEYS: Record<string, string> = {
  '/': 'nav.dashboard',
  '/intake': 'nav.intake',
  '/scanner': 'nav.scanner',
  '/verification': 'nav.verification',
  '/files': 'nav.files',
  '/tracking': 'nav.tracking',
  '/nammadocs': 'nav.nammadocs',
  '/departments': 'nav.departments',
  '/police': 'dept.police',
  '/reports': 'nav.reports',
  '/notifications': 'nav.notifications',
  '/audit': 'nav.audit',
  '/settings': 'nav.settings',
};

const KarnatakaEmblem: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <circle cx="24" cy="24" r="22" stroke="#FBBF24" strokeWidth="2" fill="#0B2545" />
    <path
      d="M24 9L28 16H34L29 21L31 29L24 25L17 29L19 21L14 16H20L24 9Z"
      fill="#FBBF24"
      fillOpacity="0.92"
    />
    <path
      d="M15 33C18 35.5 30 35.5 33 33"
      stroke="#93C5FD"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="24" cy="21" r="2.2" fill="#0B2545" />
  </svg>
);

export const AppShell: React.FC = () => {
  const {
    activeProfile,
    switchRole,
    selectedDepartment,
    setSelectedDepartment,
    selectedOffice,
    setSelectedOffice,
    availableOffices,
    isOffline,
    toggleOfflineStatus,
    unreadNotificationCount,
    toasts,
    dismissToast,
  } = useApp();
  const { language, setLanguage, t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentRouteKey =
    ROUTE_LABEL_KEYS[location.pathname] ||
    (location.pathname.startsWith('/verification')
      ? 'nav.verification'
      : 'nav.dashboard');

  return (
    <div className="min-h-screen flex bg-[#F3F4FA] text-slate-900">
      {/* Mobile Sidebar Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Fixed Collapsible Navy-Blue Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-gradient-to-b from-[#0B2545] via-[#0F2C59] to-[#13315C] text-white shadow-xl transition-all duration-200 ${
          collapsed ? 'w-[76px]' : 'w-[268px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Top Karnataka Emblem & Branding */}
        <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <KarnatakaEmblem className="w-9 h-9 shrink-0" />
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-[10px] font-medium text-blue-200 tracking-wide truncate">
                  {t('brand.gov')}
                </div>
                <div className="font-display text-base font-bold text-white tracking-tight truncate">
                  {t('brand.name')}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            title={t('header.collapseSidebar')}
            aria-label={t('header.collapseSidebar')}
            className="hidden lg:inline-flex p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label={t('common.close')}
            className="lg:hidden p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!collapsed && (
          <div className="px-4 py-2.5 border-b border-white/10 bg-[#081C36]/50">
            <p className="text-[11px] text-blue-100/90 leading-snug">
              {t('brand.tagline')}
            </p>
          </div>
        )}

        {/* 12 Sidebar Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={collapsed ? t(item.key) : undefined}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : 'text-blue-100/85 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">{t(item.key)}</span>}
                </div>
                {!collapsed && item.to === '/notifications' && unreadNotificationCount > 0 && (
                  <span className="font-mono tabular-nums text-[11px] font-semibold bg-white/20 text-white px-1.5 py-0.5 rounded-md">
                    {unreadNotificationCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Officer Summary */}
        <div className="p-3 border-t border-white/10 bg-[#081C36]/70">
          <div className="flex items-center gap-2.5">
            <img
              src={activeProfile.avatarUrl}
              alt={activeProfile.name}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-lg object-cover border border-white/20 shrink-0"
            />
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  {language === 'kn' ? activeProfile.nameKn : activeProfile.name}
                </div>
                <div className="text-[11px] text-blue-200 truncate">
                  {t(`role.${activeProfile.role}`)}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          collapsed ? 'lg:pl-[76px]' : 'lg:pl-[268px]'
        }`}
      >
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-indigo-100 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 no-print">
          {/* Breadcrumbs + Mobile Trigger */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="lg:hidden p-2 rounded-lg border border-indigo-100 text-slate-700 hover:bg-indigo-50"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 whitespace-nowrap">
              <span className="font-semibold text-[#0B2545]">{t('brand.name')}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-slate-800 truncate">
                {t(currentRouteKey)}
              </span>
            </div>
          </div>

          {/* Right Controls: Dept, Office, Language, Online/Offline, Notifications, Role */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Department Selector */}
            <select
              aria-label={t('header.department')}
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value as DepartmentId)}
              className="px-2.5 py-1.5 rounded-lg bg-[#F3F4FA] border border-indigo-100 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="all">{t('dept.all')}</option>
              <option value="police">{t('dept.police')}</option>
              <option value="gram_panchayat">{t('dept.gram_panchayat')}</option>
              <option value="revenue">{t('dept.revenue')}</option>
              <option value="hospitals">{t('dept.hospitals')}</option>
              <option value="education">{t('dept.education')}</option>
              <option value="municipal">{t('dept.municipal')}</option>
            </select>

            {/* Police Station / Office Selector */}
            <select
              aria-label={t('header.office')}
              value={selectedOffice}
              onChange={(e) => setSelectedOffice(e.target.value)}
              className="hidden md:block max-w-[200px] px-2.5 py-1.5 rounded-lg bg-[#F3F4FA] border border-indigo-100 text-xs font-medium text-slate-800 truncate focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              {availableOffices.map((off) => (
                <option key={off} value={off}>
                  {off}
                </option>
              ))}
            </select>

            {/* Global Language Switcher: English | ಕನ್ನಡ */}
            <div
              role="group"
              aria-label={t('header.language')}
              className="inline-flex items-center p-0.5 rounded-lg bg-[#EEF1FA] border border-indigo-100"
            >
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  language === 'en'
                    ? 'bg-[#0B2545] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('kn')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  language === 'kn'
                    ? 'bg-[#0B2545] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ಕನ್ನಡ
              </button>
            </div>

            {/* Online / Offline Indicator */}
            <button
              type="button"
              onClick={toggleOfflineStatus}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
                isOffline
                  ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden xl:inline">{t('header.offlineStatus')}</span>
                  <span className="xl:hidden">Offline</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden xl:inline">{t('header.onlineStatus')}</span>
                  <span className="xl:hidden">Online</span>
                </>
              )}
            </button>

            {/* Notifications Button */}
            <button
              type="button"
              onClick={() => navigate('/notifications')}
              aria-label={t('header.notifications')}
              className="relative p-2 rounded-lg border border-indigo-100 bg-white hover:bg-[#F3F4FA] text-slate-700 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#2563EB] text-white text-[10px] font-mono font-bold flex items-center justify-center">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* User Role Selector */}
            <select
              aria-label={t('header.role')}
              value={activeProfile.role}
              onChange={(e) => switchRole(e.target.value as UserRole)}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-indigo-100 text-xs font-semibold text-[#0B2545] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="Administrator">{t('role.Administrator')}</option>
              <option value="Officer">{t('role.Officer')}</option>
              <option value="Reviewer">{t('role.Reviewer')}</option>
              <option value="Data Entry Operator">{t('role.Data Entry Operator')}</option>
            </select>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2.5rem)] no-print">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="bg-white border border-indigo-100 rounded-xl shadow-lg p-3.5 flex items-start gap-2.5"
            >
              {toast.tone === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : toast.tone === 'warning' || toast.tone === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-900">{toast.title}</div>
                <div className="text-xs text-slate-600 mt-0.5">{toast.message}</div>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label={t('common.close')}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
