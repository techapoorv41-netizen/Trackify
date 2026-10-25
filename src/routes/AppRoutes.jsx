import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@/utils/constants';
import AppLayout from '@/components/layout/AppLayout';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';

const Landing = lazy(() => import('@/pages/public/Landing'));
const Login = lazy(() => import('@/pages/public/Login'));
const ForgotPassword = lazy(() => import('@/pages/public/ForgotPassword'));
const NotFound = lazy(() => import('@/pages/shared/NotFound'));

const InstituteDashboard = lazy(() => import('@/pages/institute/InstituteDashboard'));
const NewApplication = lazy(() => import('@/pages/institute/NewApplication'));
const MyApplications = lazy(() => import('@/pages/institute/MyApplications'));
const ApplicationDetails = lazy(() => import('@/pages/institute/ApplicationDetails'));
const InstituteDocuments = lazy(() => import('@/pages/institute/InstituteDocuments'));
const InstituteCompliance = lazy(() => import('@/pages/institute/InstituteCompliance'));

const OfficerDashboard = lazy(() => import('@/pages/officer/OfficerDashboard'));
const ReviewQueue = lazy(() => import('@/pages/officer/ReviewQueue'));
const ReviewWorkspace = lazy(() => import('@/pages/officer/ReviewWorkspace'));
const OfficerCompliance = lazy(() => import('@/pages/officer/OfficerCompliance'));

const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('@/pages/admin/UserManagement'));
const InstituteManagement = lazy(() => import('@/pages/admin/InstituteManagement'));
const WorkflowConfig = lazy(() => import('@/pages/admin/WorkflowConfig'));
const RuleManagement = lazy(() => import('@/pages/admin/RuleManagement'));
const AlertManagement = lazy(() => import('@/pages/admin/AlertManagement'));
const DeadlineReminders = lazy(() => import('@/pages/admin/DeadlineReminders'));
const AuditLogs = lazy(() => import('@/pages/admin/AuditLogs'));

const Reports = lazy(() => import('@/pages/shared/Reports'));
const NotificationsPage = lazy(() => import('@/pages/shared/NotificationsPage'));
const Profile = lazy(() => import('@/pages/shared/Profile'));
const Settings = lazy(() => import('@/pages/shared/Settings'));

function RequireAuth({ children }) {
  const { session } = useAuth();
  const location = useLocation();
  if (!session) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
}

function RoleGate({ roles, children }) {
  const { session } = useAuth();
  if (!roles.includes(session.role)) return <Navigate to={ROLES[session.role].home} replace />;
  return children;
}

const gate = (roles, element) => <RoleGate roles={roles}>{element}</RoleGate>;
const ALL = ['institute', 'officer', 'admin'];

export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl p-8"><LoadingSkeleton /></div>}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
          <Route path="/institute/dashboard" element={gate(['institute'], <InstituteDashboard />)} />
          <Route path="/institute/applications" element={gate(['institute'], <MyApplications />)} />
          <Route path="/institute/applications/new" element={gate(['institute'], <NewApplication />)} />
          <Route path="/institute/applications/:id" element={gate(['institute'], <ApplicationDetails />)} />
          <Route path="/institute/documents" element={gate(['institute'], <InstituteDocuments />)} />
          <Route path="/institute/compliance" element={gate(['institute'], <InstituteCompliance />)} />

          <Route path="/officer/dashboard" element={gate(['officer'], <OfficerDashboard />)} />
          <Route path="/officer/applications" element={gate(['officer', 'admin'], <ReviewQueue />)} />
          <Route path="/officer/applications/:id" element={gate(['officer', 'admin'], <ReviewWorkspace />)} />
          <Route path="/officer/compliance" element={gate(['officer', 'admin'], <OfficerCompliance />)} />

          <Route path="/admin/dashboard" element={gate(['admin'], <AdminDashboard />)} />
          <Route path="/admin/users" element={gate(['admin'], <UserManagement />)} />
          <Route path="/admin/institutes" element={gate(['admin'], <InstituteManagement />)} />
          <Route path="/admin/workflows" element={gate(['admin'], <WorkflowConfig />)} />
          <Route path="/admin/rules" element={gate(['admin'], <RuleManagement />)} />
          <Route path="/admin/alerts" element={gate(['admin'], <AlertManagement />)} />
          <Route path="/admin/reminders" element={gate(['admin'], <DeadlineReminders />)} />
          <Route path="/admin/audit-logs" element={gate(['admin'], <AuditLogs />)} />

          <Route path="/reports" element={gate(ALL, <Reports />)} />
          <Route path="/notifications" element={gate(ALL, <NotificationsPage />)} />
          <Route path="/profile" element={gate(ALL, <Profile />)} />
          <Route path="/settings" element={gate(ALL, <Settings />)} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
