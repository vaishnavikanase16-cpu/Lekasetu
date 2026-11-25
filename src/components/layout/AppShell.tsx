import React, { useState } from 'react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  UploadCloud,
  Cpu,
  FolderKanban,
  Bot,
  BarChart3,
  History,
  Settings,
  Sun,
  Moon,
  WifiOff,
  Wifi,
  LogOut,
  Menu,
  X,
  Landmark,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SarkarAssistantWidget } from '../assistant/SarkarAssistantWidget';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/departments', label: 'Departments', icon: Building2 },
  { to: '/upload', label: 'Upload Document', icon: UploadCloud },
  { to: '/processing', label: 'AI Processing', icon: Cpu },
  { to: '/documents', label: 'Document Records', icon: FolderKanban },
  { to: '/assistant', label: 'AI Assistant', icon: Bot },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/history', label: 'History', icon: History },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'Dashboard';
  if (pathname.startsWith('/departments')) return 'Government Departments';
  if (pathname.startsWith('/upload')) return 'Document Upload Studio';
  if (pathname.startsWith('/processing')) return 'AI Document Processing';
  if (pathname.startsWith('/documents/')) return 'Extracted Data Review';
  if (pathname.startsWith('/documents')) return 'Document Records';
  if (pathname.startsWith('/assistant')) return 'SARKAR AI Assistant';
  if (pathname.startsWith('/analytics')) return 'Analytics';
  if (pathname.startsWith('/history')) return 'Processing History';
  if (pathname.startsWith('/settings')) return 'Settings & Offline Engine';
  return 'SARKAR AI';
}

export const AppShell: React.FC = () => {
  const {
    user,
    logout,
    theme,
    toggleTheme,
    offlineState,
    toggleOfflineMode,
    backendMode,
    toasts,
    dismissToast,
  } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const pageTitle = getPageTitle(location.pathname);

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Mobile Sidebar Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0B1F3A] text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Tricolor subtle top hairline */}
        <div className="h-1 w-full flex">
          <div className="flex-1 bg-[#EA580C]" />
          <div className="flex-1 bg-white/90" />
          <div className="flex-1 bg-[#16A34A]" />
        </div>

        {/* Brand Block */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-md bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
              <Landmark className="w-5 h-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-base font-bold tracking-tight text-white whitespace-nowrap">
                SARKAR AI
              </div>
              <div className="text-[11px] text-slate-300 truncate">
                GovTech Document OS
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-white/10"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/8'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Offline Node Summary */}
        <div className="px-4 py-3.5 border-t border-white/10 bg-[#08172C] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-200">
              {offlineState.offlineMode ? 'OFFLINE MODE' : 'SYNC LINK READY'}
            </span>
            <span className="font-mono text-[11px] text-emerald-400">
              {backendMode === 'demo' ? 'Demo' : 'FastAPI'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            {offlineState.ocrEngine.name} · {offlineState.localDatabase.cachedRecords} local records
          </p>
        </div>

        {/* Employee Profile Card */}
        {user && (
          <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={user.avatarUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-md object-cover border border-white/20 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">{user.name}</div>
                <div className="text-[11px] text-slate-400 truncate">{user.district}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign Out"
              aria-label="Sign Out"
              className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                <span>SARKAR AI</span>
                <span aria-hidden="true">/</span>
                <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                  {pageTitle}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={toggleOfflineMode}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                offlineState.offlineMode
                  ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                  : 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
              }`}
            >
              {offlineState.offlineMode ? (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>OFFLINE MODE</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span>SYNC READY</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => navigate('/upload')}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#0F294A] hover:bg-[#1E3A8A] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Form</span>
            </button>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Floating SARKAR AI Assistant (hidden when on dedicated /assistant route) */}
      {!location.pathname.startsWith('/assistant') && <SarkarAssistantWidget />}

      {/* Toast Stack */}
      {toasts.length > 0 && (
        <div className="fixed top-20 right-5 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2.5rem)]">
          {toasts.map((t) => (
            <div
              key={t.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3.5 flex items-start gap-2.5"
            >
              {t.tone === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : t.tone === 'warning' || t.tone === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {t.title}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {t.message}
                </div>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                aria-label="Dismiss notification"
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
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
