import { Switch, Route, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext.jsx";
import { useAuth } from "./hooks/useAuth.js";

import Login from "./pages/Login.jsx";
import VerifyOtp from "./pages/VerifyOtp.jsx";
import Register from "./pages/Register.jsx";
import NotFound from "./pages/NotFound.jsx";

import StudentLayout from "./components/layout/StudentLayout.jsx";
import StudentDashboard from "./pages/student/Dashboard.jsx";
import StudentProfile from "./pages/student/Profile.jsx";
import StudentJobs from "./pages/student/Jobs.jsx";
import JobDetail from "./pages/student/JobDetail.jsx";
import StudentApplications from "./pages/student/Applications.jsx";
import SavedJobs from "./pages/student/SavedJobs.jsx";
import StudentNotifications from "./pages/student/Notifications.jsx";

import CompanyLayout from "./components/layout/CompanyLayout.jsx";
import CompanyDashboard from "./pages/company/Dashboard.jsx";
import CompanyProfile from "./pages/company/Profile.jsx";
import CreateJob from "./pages/company/CreateJob.jsx";
import Applicants from "./pages/company/Applicants.jsx";
import Subscription from "./pages/company/Subscription.jsx";

import AdminLayout from "./components/layout/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminStudents from "./pages/admin/Students.jsx";
import AdminCompanies from "./pages/admin/Companies.jsx";
import AdminJobs from "./pages/admin/Jobs.jsx";
import BulkImport from "./pages/admin/BulkImport.jsx";
import AdminPayments from "./pages/admin/Payments.jsx";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
  if (!user) return <Redirect to="/login" />;
  if (role && user.role !== role) return <Redirect to={`/${user.role}/dashboard`} />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Redirect to={`/${user.role}/dashboard`} />;
  return children;
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        {() => <Redirect to="/login" />}
      </Route>

      <Route path="/login">
        {() => <PublicRoute><Login /></PublicRoute>}
      </Route>
      <Route path="/verify-otp">
        {() => <PublicRoute><VerifyOtp /></PublicRoute>}
      </Route>
      <Route path="/register">
        {() => <PublicRoute><Register /></PublicRoute>}
      </Route>

      {/* Student Routes */}
      <Route path="/student/dashboard">
        {() => <ProtectedRoute role="student"><StudentLayout><StudentDashboard /></StudentLayout></ProtectedRoute>}
      </Route>
      <Route path="/student/profile">
        {() => <ProtectedRoute role="student"><StudentLayout><StudentProfile /></StudentLayout></ProtectedRoute>}
      </Route>
      <Route path="/student/jobs">
        {() => <ProtectedRoute role="student"><StudentLayout><StudentJobs /></StudentLayout></ProtectedRoute>}
      </Route>
      <Route path="/student/jobs/:id">
        {(params) => <ProtectedRoute role="student"><StudentLayout><JobDetail id={params.id} /></StudentLayout></ProtectedRoute>}
      </Route>
      <Route path="/student/applications">
        {() => <ProtectedRoute role="student"><StudentLayout><StudentApplications /></StudentLayout></ProtectedRoute>}
      </Route>
      <Route path="/student/saved-jobs">
        {() => <ProtectedRoute role="student"><StudentLayout><SavedJobs /></StudentLayout></ProtectedRoute>}
      </Route>
      <Route path="/student/notifications">
        {() => <ProtectedRoute role="student"><StudentLayout><StudentNotifications /></StudentLayout></ProtectedRoute>}
      </Route>

      {/* Company Routes */}
      <Route path="/company/dashboard">
        {() => <ProtectedRoute role="company"><CompanyLayout><CompanyDashboard /></CompanyLayout></ProtectedRoute>}
      </Route>
      <Route path="/company/profile">
        {() => <ProtectedRoute role="company"><CompanyLayout><CompanyProfile /></CompanyLayout></ProtectedRoute>}
      </Route>
      <Route path="/company/jobs/create">
        {() => <ProtectedRoute role="company"><CompanyLayout><CreateJob /></CompanyLayout></ProtectedRoute>}
      </Route>
      <Route path="/company/applicants">
        {() => <ProtectedRoute role="company"><CompanyLayout><Applicants /></CompanyLayout></ProtectedRoute>}
      </Route>
      <Route path="/company/subscription">
        {() => <ProtectedRoute role="company"><CompanyLayout><Subscription /></CompanyLayout></ProtectedRoute>}
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/dashboard">
        {() => <ProtectedRoute role="admin"><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>}
      </Route>
      <Route path="/admin/students">
        {() => <ProtectedRoute role="admin"><AdminLayout><AdminStudents /></AdminLayout></ProtectedRoute>}
      </Route>
      <Route path="/admin/companies">
        {() => <ProtectedRoute role="admin"><AdminLayout><AdminCompanies /></AdminLayout></ProtectedRoute>}
      </Route>
      <Route path="/admin/jobs">
        {() => <ProtectedRoute role="admin"><AdminLayout><AdminJobs /></AdminLayout></ProtectedRoute>}
      </Route>
      <Route path="/admin/bulk-import">
        {() => <ProtectedRoute role="admin"><AdminLayout><BulkImport /></AdminLayout></ProtectedRoute>}
      </Route>
      <Route path="/admin/payments">
        {() => <ProtectedRoute role="admin"><AdminLayout><AdminPayments /></AdminLayout></ProtectedRoute>}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </QueryClientProvider>
  );
}
