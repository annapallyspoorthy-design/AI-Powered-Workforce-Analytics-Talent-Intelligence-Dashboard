import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { AiAssistant } from './components/chatbot/AiAssistant';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Pages
import { LoginPage } from './pages/Auth/LoginPage';
import { EmployeePortalPage } from './pages/Portal/EmployeePortalPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { EmployeesPage } from './pages/Employees/EmployeesPage';
import { EmployeeProfilePage } from './pages/Employees/EmployeeProfilePage';
import { AnalyticsPage } from './pages/Analytics/AnalyticsPage';
import { ReportsPage } from './pages/Reports/ReportsPage';
import { EmailBroadcastPage } from './pages/Email/EmailBroadcastPage';
import { AttendancePage } from './pages/Attendance/AttendancePage';
import { ShiftsPage } from './pages/Shifts/ShiftsPage';
import { LeaveTimesheetsPage } from './pages/LeaveTimesheets/LeaveTimesheetsPage';
import { PayrollPage } from './pages/Payroll/PayrollPage';
import { WorkforcePlanningPage } from './pages/WorkforcePlanning/WorkforcePlanningPage';
import { PerformancePage } from './pages/Performance/PerformancePage';
import { IntegrationsSecurityPage } from './pages/IntegrationsSecurity/IntegrationsSecurityPage';

const RootRedirect: React.FC = () => {
  const { role } = useAuth();
  if (role === 'Employee') {
    return <Navigate to="/portal" replace />;
  }
  return <DashboardPage />;
};

const AppLayout: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const location = useLocation();

  if (location.pathname === '/login') {
    return <LoginPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-violet-500 selection:text-white transition-colors duration-300 relative overflow-x-hidden vibe-grid-bg">
      {/* Dynamic Ambient Background Orbs that adapt to Vibe Mode */}
      <div className="fixed -top-40 -right-40 w-96 h-96 vibe-orb-elem-1 rounded-full blur-3xl pointer-events-none vibe-aurora-orb-1 z-0" />
      <div className="fixed top-1/2 -left-40 w-96 h-96 vibe-orb-elem-2 rounded-full blur-3xl pointer-events-none vibe-aurora-orb-2 z-0" />
      <div className="fixed -bottom-40 right-1/4 w-96 h-96 vibe-orb-elem-3 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onToggleAssistant={() => setIsAssistantOpen(true)}
      />

      {/* Top Navbar */}
      <Navbar
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleAssistant={() => setIsAssistantOpen(!isAssistantOpen)}
      />

      {/* Main Content View Container */}
      <div
        className={`flex-1 transition-all duration-300 pt-20 pb-8 w-full relative z-10 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <main className="min-h-[calc(100vh-160px)]">
            <Routes>
              {/* Root Route: Dynamically routes HR to Executive Dashboard and Employee to Portal */}
              <Route path="/" element={<RootRedirect />} />

              {/* Employee Self-Service Exclusive Routes (HR cannot access) */}
              <Route
                path="/portal"
                element={
                  <ProtectedRoute allowedRoles={['Employee']}>
                    <EmployeePortalPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-portal"
                element={
                  <ProtectedRoute allowedRoles={['Employee']}>
                    <EmployeePortalPage />
                  </ProtectedRoute>
                }
              />

              {/* HR Admin Exclusive Routes (Employees cannot access) */}
              <Route
                path="/attendance"
                element={
                  <ProtectedRoute allowedRoles={['HR Admin']}>
                    <AttendancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shifts"
                element={
                  <ProtectedRoute allowedRoles={['HR Admin']}>
                    <ShiftsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leave-timesheets"
                element={
                  <ProtectedRoute allowedRoles={['HR Admin']}>
                    <LeaveTimesheetsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payroll"
                element={
                  <ProtectedRoute allowedRoles={['HR Admin']}>
                    <PayrollPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workforce-planning"
                element={
                  <ProtectedRoute allowedRoles={['HR Admin']}>
                    <WorkforcePlanningPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/performance"
                element={
                  <ProtectedRoute allowedRoles={['HR Admin']}>
                    <PerformancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/email"
                element={
                  <ProtectedRoute allowedRoles={['HR Admin']}>
                    <EmailBroadcastPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute allowedRoles={['HR Admin']}>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute allowedRoles={['HR Admin']}>
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/integrations"
                element={
                  <ProtectedRoute allowedRoles={['HR Admin']}>
                    <IntegrationsSecurityPage />
                  </ProtectedRoute>
                }
              />

              {/* Organization Directory & Detailed Profile (HR has full data about employees) */}
              <Route
                path="/employees"
                element={
                  <ProtectedRoute allowedRoles={['HR Admin', 'Employee']}>
                    <EmployeesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employees/:id"
                element={
                  <ProtectedRoute allowedRoles={['HR Admin', 'Employee']}>
                    <EmployeeProfilePage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </div>

      {/* AI Assistant Floating Widget */}
      <AiAssistant
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <AppLayout />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
