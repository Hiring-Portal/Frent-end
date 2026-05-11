import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import StudentDashboard from "@/pages/student/Dashboard";
import StudentJobs from "@/pages/student/Jobs";
import StudentProfile from "@/pages/student/Profile";
import StudentApplications from "@/pages/student/Applications";
import StudentSavedJobs from "@/pages/student/SavedJobs";
import StudentNotifications from "@/pages/student/Notifications";
import JobDetail from "@/pages/student/JobDetail";
import ChangePassword from "@/pages/student/ChangePassword";
import StudentLayout from "@/components/layout/StudentLayout";

const queryClient = new QueryClient();

function Home() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Replit Agent is building...</h1>
        <p className="mt-2 text-sm text-gray-600">Your app will appear here once it's ready.</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/student/dashboard">
        <StudentLayout>
          <StudentDashboard />
        </StudentLayout>
      </Route>
      <Route path="/student/jobs">
        <StudentLayout>
          <StudentJobs />
        </StudentLayout>
      </Route>
      <Route path="/student/profile">
        <StudentLayout>
          <StudentProfile />
        </StudentLayout>
      </Route>
      <Route path="/student/applications">
        <StudentLayout>
          <StudentApplications />
        </StudentLayout>
      </Route>
      <Route path="/student/saved-jobs">
        <StudentLayout>
          <StudentSavedJobs />
        </StudentLayout>
      </Route>
      <Route path="/student/notifications">
        <StudentLayout>
          <StudentNotifications />
        </StudentLayout>
      </Route>
      <Route path="/jobs/:id" component={JobDetail} />
      <Route path="/student/change-password">
        <StudentLayout>
          <ChangePassword />
        </StudentLayout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
