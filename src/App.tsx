import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "@/components/ui/toaster"
import Auth from "./pages/Auth";
import SignUp from "./pages/SignUp";
import ResetPassword from "./pages/ResetPassword";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import { AuthGuard } from "./components/AuthGuard";
import { DashboardPage } from "./components/dashboard/DashboardPage";
import { JobApplicationPage } from "./pages/JobApplicationPage";
import PublicJobs from "./pages/PublicJobs";
import ProfileSettings from "./pages/ProfileSettings";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { LinkedInCallback } from "./pages/LinkedInCallback";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OptimizedJobsPage } from "./components/jobs/OptimizedJobsPage";
import Scout from "./pages/Scout";
import { Inbox } from "./pages/Inbox";

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/jobs" element={
              <AuthGuard>
                <OptimizedJobsPage />
              </AuthGuard>
            } />
            <Route path="/jobs/:jobId" element={
              <AuthGuard>
                <DashboardPage />
              </AuthGuard>
            } />
            <Route path="/dashboard/:jobId" element={
              <AuthGuard>
                <DashboardPage />
              </AuthGuard>
            } />
            <Route path="/scout" element={
              <AuthGuard>
                <Scout />
              </AuthGuard>
            } />
            <Route path="/inbox" element={
              <AuthGuard>
                <Inbox />
              </AuthGuard>
            } />
            <Route path="/analytics" element={<Navigate to="/jobs" replace />} />
            <Route path="/apply/:jobId" element={<JobApplicationPage />} />
            <Route path="/public-jobs" element={<PublicJobs />} />
            <Route path="/profile" element={
              <AuthGuard>
                <ProfileSettings />
              </AuthGuard>
            } />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/linkedin/callback" element={<LinkedInCallback />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster />
      </QueryClientProvider>
    </Router>
  );
}

export default App;
