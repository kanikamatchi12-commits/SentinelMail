import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { DemoProvider } from './context/DemoContext.tsx';
import { TopNavbar } from './components/TopNavbar.tsx';
import { DemoInvestigationModal } from './components/DemoInvestigationModal.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { WelcomePage } from './pages/WelcomePage.tsx';
import { AnalyzePage } from './pages/AnalyzePage.tsx';
import { ProcessingPage } from './pages/ProcessingPage.tsx';
import { ThreatAnalysisPage } from './pages/ThreatAnalysisPage.tsx';
import { GeoLocationPage } from './pages/GeoLocationPage.tsx';
import { ForensicEvidencePage } from './pages/ForensicEvidencePage.tsx';
import { ThreatAlertPage } from './pages/ThreatAlertPage.tsx';
import { FinalReportPage } from './pages/FinalReportPage.tsx';
import { AlertsPage } from './pages/AlertsPage.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { HistoryPage } from './pages/HistoryPage.tsx';
import { AnalyticsPage } from './pages/AnalyticsPage.tsx';
import { ComparePage } from './pages/ComparePage.tsx';
import { ProjectIntelligencePage } from './pages/ProjectIntelligencePage.tsx';
import { GeoTracePage } from './pages/GeoTracePage.tsx';

// Layout wrapper for authenticated analyst workstation views
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // If on login route, render full screen without top nav
  if (location.pathname === '/login') {
    return <>{children}</>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen w-full bg-[#F7F9FC] text-[#172033] font-sans flex flex-col selection:bg-[#165DFF]/15 selection:text-[#165DFF]">
      <TopNavbar />
      <DemoInvestigationModal />
      <main className="flex-1 w-full relative">{children}</main>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DemoProvider>
          <AppLayout>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              {/* Page 1: Welcome (Entry Point) */}
              <Route path="/" element={<WelcomePage />} />
              <Route path="/welcome" element={<WelcomePage />} />

              {/* Page 2: Submit Email */}
              <Route path="/analyze" element={<AnalyzePage />} />

              {/* Page 3: Processing (Step Transition) */}
              <Route path="/processing/:caseId" element={<ProcessingPage />} />
              <Route path="/processing" element={<ProcessingPage />} />

              {/* Page 4: Threat Analysis */}
              <Route path="/analysis/:caseId/threat" element={<ThreatAnalysisPage />} />

              {/* Page 5: GeoLocation Analysis */}
              <Route path="/analysis/:caseId/geolocation" element={<GeoLocationPage />} />

              {/* Page 6: Forensic Evidence */}
              <Route path="/analysis/:caseId/forensics" element={<ForensicEvidencePage />} />

              {/* Page 7: Threat Alert */}
              <Route path="/analysis/:caseId/alert" element={<ThreatAlertPage />} />

              {/* Page 8: Final Report */}
              <Route path="/analysis/:caseId/report" element={<FinalReportPage />} />
              <Route path="/analysis/:caseId" element={<FinalReportPage />} />
              <Route path="/analysis/:id" element={<FinalReportPage />} />

              {/* Incident Alert Broadcasts Hub */}
              <Route path="/alerts" element={<AlertsPage />} />

              {/* Triage Inbox */}
              <Route path="/inbox" element={<HomePage />} />

              {/* Case Files */}
              <Route path="/cases" element={<HistoryPage />} />
              <Route path="/cases/:id" element={<FinalReportPage />} />

              {/* GeoTrace */}
              <Route path="/geotrace" element={<GeoTracePage />} />
              <Route path="/geotrace/:id" element={<GeoTracePage />} />

              {/* Threat Insights */}
              <Route path="/insights" element={<AnalyticsPage />} />
              <Route path="/analytics" element={<Navigate to="/insights" replace />} />

              {/* Auxiliary Utilities */}
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/methodology" element={<ProjectIntelligencePage />} />

              {/* Backward compatibility aliases */}
              <Route path="/dashboard" element={<Navigate to="/inbox" replace />} />
              <Route path="/investigate/new" element={<Navigate to="/analyze" replace />} />
              <Route path="/investigations" element={<Navigate to="/cases" replace />} />
              <Route path="/investigations/:id" element={<FinalReportPage />} />
              <Route path="/report/:id" element={<FinalReportPage />} />
              <Route path="/history" element={<Navigate to="/cases" replace />} />
              <Route path="/project" element={<Navigate to="/methodology" replace />} />
              <Route path="/about" element={<Navigate to="/methodology" replace />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </DemoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
