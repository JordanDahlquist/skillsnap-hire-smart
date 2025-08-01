
import React, { useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createOptimizedQueryClient } from "@/config/queryClient";
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"

import { ThemeProvider } from "@/contexts/ThemeContext"
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import ConfirmEmail from "./pages/ConfirmEmail";
import ResetPassword from "./pages/ResetPassword";
import { OptimizedJobsPage } from "./components/jobs/OptimizedJobsPage";
import { DashboardPage } from "./components/dashboard/DashboardPage";
import { CandidateDetailPage } from "./pages/CandidateDetailPage";
import { JobApplicationPage } from "./pages/JobApplicationPage";
import PublicJobs from "./pages/PublicJobs";
import ProfileSettings from "./pages/ProfileSettings";
import Scout from "./pages/Scout";
import { Inbox } from "./pages/Inbox";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import NotFound from "./pages/NotFound";
import { LinkedInCallback } from "./pages/LinkedInCallback";
import { AuthGuard } from "./components/AuthGuard";
import AdminPanel from "./pages/AdminPanel";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminUserDetailPage from "./pages/admin/AdminUserDetailPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminContentPage from "./pages/admin/AdminContentPage";
import AdminSystemPage from "./pages/admin/AdminSystemPage";
import AdminActivityPage from "./pages/admin/AdminActivityPage";
import { AdminRoute } from "./components/admin/AdminRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Help from "./pages/Help";

const queryClient = createOptimizedQueryClient();

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  try {
    return (
      <BrowserRouter>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <Toaster />
            <SonnerToaster />
            <ScrollToTop />
            <ErrorBoundary>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/confirm" element={<ConfirmEmail />} />
              <Route path="/confirm-email" element={<ConfirmEmail />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/jobs" element={<AuthGuard><OptimizedJobsPage /></AuthGuard>} />
              <Route path="/jobs/:jobId" element={<AuthGuard><DashboardPage /></AuthGuard>} />
              <Route path="/jobs/:jobId/candidate/:applicationId" element={<AuthGuard><CandidateDetailPage /></AuthGuard>} />
              <Route path="/job/:jobId/apply" element={<JobApplicationPage />} />
              <Route path="/public-jobs" element={<PublicJobs />} />
              <Route path="/profile" element={<AuthGuard><ProfileSettings /></AuthGuard>} />
              <Route path="/help" element={<AuthGuard><Help /></AuthGuard>} />
              <Route path="/scout" element={<AuthGuard><Scout /></AuthGuard>} />
              <Route path="/inbox" element={<AuthGuard><Inbox /></AuthGuard>} />
              <Route path="/admin" element={<AuthGuard><AdminRoute><AdminPanel /></AdminRoute></AuthGuard>} />
              <Route path="/admin/users" element={<AuthGuard><AdminRoute><AdminUsersPage /></AdminRoute></AuthGuard>} />
              <Route path="/admin/users/:userId" element={<AuthGuard><AdminRoute><AdminUserDetailPage /></AdminRoute></AuthGuard>} />
              <Route path="/admin/analytics" element={<AuthGuard><AdminRoute><AdminAnalyticsPage /></AdminRoute></AuthGuard>} />
              <Route path="/admin/content" element={<AuthGuard><AdminRoute><AdminContentPage /></AdminRoute></AuthGuard>} />
              <Route path="/admin/system" element={<AuthGuard><AdminRoute><AdminSystemPage /></AdminRoute></AuthGuard>} />
              <Route path="/admin/activity" element={<AuthGuard><AdminRoute><AdminActivityPage /></AdminRoute></AuthGuard>} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/refund" element={<RefundPolicy />} />
              <Route path="/linkedin/callback" element={<LinkedInCallback />} />
              <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </QueryClientProvider>
        </ThemeProvider>
      </BrowserRouter>
    );
  } catch (error) {
    console.error('App crashed:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-muted-foreground mb-4">Please refresh the page to try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
}

export default App;
