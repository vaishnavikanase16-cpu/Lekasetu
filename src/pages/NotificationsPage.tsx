import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0B2545]">
            {t('notif.title')}
          </h1>
          <p className="text-sm text-slate-600 mt-1">{t('notif.subtitle')}</p>
        </div>

        <button
          type="button"
          onClick={markAllNotificationsRead}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-indigo-200 bg-white hover:bg-[#F3F4FA] text-xs font-semibold text-[#0B2545] whitespace-nowrap"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>{t('notif.markAllRead')}</span>
        </button>
      </div>

      <section className="bg-white rounded-2xl border border-indigo-100 overflow-hidden shadow-xs">
        {notifications.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            {t('notif.empty')}
          </div>
        ) : (
          <div className="divide-y divide-indigo-50">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  !n.read ? 'bg-blue-50/40' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      !n.read
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-[#F3F4FA] text-slate-500'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0B2545]">
                      {n.titleKey}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">{n.message}</div>
                    <div className="text-[11px] font-mono text-slate-400 mt-1">
                      {new Date(n.timestamp).toLocaleString()}
                      {n.departmentId ? ` · ${t(`dept.${n.departmentId}`)}` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!n.read && (
                    <button
                      type="button"
                      onClick={() => markNotificationRead(n.id)}
                      className="px-3 py-1.5 rounded-lg border border-indigo-100 bg-white text-[11px] font-semibold text-slate-700 hover:bg-[#F3F4FA]"
                    >
                      Mark Read
                    </button>
                  )}
                  {n.documentId && (
                    <button
                      type="button"
                      onClick={() => {
                        markNotificationRead(n.id);
                        navigate(`/verification/${n.documentId}`);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0B2545] text-white text-[11px] font-semibold"
                    >
                      <span>{t('files.openFile')}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
