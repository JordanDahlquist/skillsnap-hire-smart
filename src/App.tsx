
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AdminRoute } from "@/components/admin/AdminRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SignUp from "./pages/SignUp";
import SimpleSignUp from "./pages/SimpleSignUp";
import ResetPassword from "./pages/ResetPassword";
import ConfirmEmail from "./pages/ConfirmEmail";
import { LinkedInCallback } from "./pages/LinkedInCallback";
import Scout from "./pages/Scout";
import { Inbox } from "./pages/Inbox";
import { JobApplicationPage } from "./pages/JobApplicationPage";
import { CandidateDetailPage } from "./pages/CandidateDetailPage";
import PublicJobs from "./pages/PublicJobs";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import ProfileSettings from "./pages/ProfileSettings";
import NotFound from "./pages/NotFound";
import AdminPanel from "./pages/AdminPanel";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminContentPage from "./pages/admin/AdminContentPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminActivityPage from "./pages/admin/AdminActivityPage";
import AdminSystemPage from "./pages/admin/AdminSystemPage";
import { DashboardPage } from "./components/dashboard/DashboardPage";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ErrorBoundary>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/simple-signup" element={<SimpleSignUp />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/confirm" element={<ConfirmEmail />} />
                <Route path="/linkedin/callback" element={<LinkedInCallback />} />
                <Route path="/jobs" element={<DashboardPage />} />
                <Route path="/jobs/:jobId" element={<DashboardPage />} />
                <Route path="/scout" element={<Scout />} />
                <Route path="/inbox" element={<Inbox />} />
                <Route path="/apply/:jobId" element={<JobApplicationPage />} />
                <Route path="/candidate/:applicationId" element={<CandidateDetailPage />} />
                <Route path="/public-jobs" element={<PublicJobs />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/refund" element={<RefundPolicy />} />
                <Route path="/profile" element={<ProfileSettings />} />
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                } />
                <Route path="/admin/users" element={
                  <AdminRoute>
                    <AdminUsersPage />
                  </AdminRoute>
                } />
                <Route path="/admin/content" element={
                  <AdminRoute>
                    <AdminContentPage />
                  </AdminRoute>
                } />
                <Route path="/admin/analytics" element={
                  <AdminRoute>
                    <AdminAnalyticsPage />
                  </AdminRoute>
                } />
                <Route path="/admin/activity" element={
                  <AdminRoute>
                    <AdminActivityPage />
                  </AdminRoute>
                } />
                <Route path="/admin/system" element={
                  <AdminRoute>
                    <AdminSystemPage />
                  </AdminRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
          <Toaster />
        </ErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
