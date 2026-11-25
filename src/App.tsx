import React from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { UploadStudioPage } from './pages/UploadStudioPage';
import { ProcessingPipelinePage } from './pages/ProcessingPipelinePage';
import { DocumentRecordsPage } from './pages/DocumentRecordsPage';
import { DocumentReviewPage } from './pages/DocumentReviewPage';
import { AssistantPage } from './pages/AssistantPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/upload" element={<UploadStudioPage />} />
            <Route path="/processing" element={<ProcessingPipelinePage />} />
            <Route path="/documents" element={<DocumentRecordsPage />} />
            <Route path="/documents/:id" element={<DocumentReviewPage />} />
            <Route path="/review" element={<DocumentReviewPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
