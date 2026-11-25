import React from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AppProvider } from './context/AppContext';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentIntakePage } from './pages/DocumentIntakePage';
import { ScannerPage } from './pages/ScannerPage';
import { VerificationCentrePage } from './pages/VerificationCentrePage';
import { FileManagementPage } from './pages/FileManagementPage';
import { AskNammaDocsPage } from './pages/AskNammaDocsPage';
import { DepartmentWorkspacePage } from './pages/DepartmentWorkspacePage';
import { PoliceWorkspacePage } from './pages/PoliceWorkspacePage';
import { ReportsAnalyticsPage } from './pages/ReportsAnalyticsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <HashRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/intake" element={<DocumentIntakePage />} />
              <Route path="/scanner" element={<ScannerPage />} />
              <Route path="/verification" element={<VerificationCentrePage />} />
              <Route path="/verification/:id" element={<VerificationCentrePage />} />
              <Route path="/files" element={<FileManagementPage />} />
              <Route path="/tracking" element={<FileManagementPage trackingMode />} />
              <Route path="/nammadocs" element={<AskNammaDocsPage />} />
              <Route path="/departments" element={<DepartmentWorkspacePage />} />
              <Route path="/police" element={<PoliceWorkspacePage />} />
              <Route path="/reports" element={<ReportsAnalyticsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/audit" element={<AuditLogsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </AppProvider>
    </LanguageProvider>
  );
}
