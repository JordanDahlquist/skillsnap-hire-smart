
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SignUp from "./pages/SignUp";
import SimpleSignUp from "./pages/SimpleSignUp";
import ResetPassword from "./pages/ResetPassword";
import ConfirmEmail from "./pages/ConfirmEmail";
import PublicJobs from "./pages/PublicJobs";
import { JobApplicationPage } from "./pages/JobApplicationPage";
import { OptimizedJobsPage } from "./components/jobs/OptimizedJobsPage";
import { DashboardPage } from "./components/dashboard/DashboardPage";
import { CandidateDetailPage } from "./pages/CandidateDetailPage";
import Scout from "./pages/Scout";
import { Inbox } from "./pages/Inbox";
import ProfileSettings from "./pages/ProfileSettings";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import { LinkedInCallback } from "./pages/LinkedInCallback";
import NotFound from "./pages/NotFound";

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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/simple-signup" element={<SimpleSignUp />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/confirm-email" element={<ConfirmEmail />} />
                <Route path="/public-jobs" element={<PublicJobs />} />
                <Route path="/apply/:jobId" element={<JobApplicationPage />} />
                <Route path="/jobs" element={<OptimizedJobsPage />} />
                <Route path="/dashboard/:jobId" element={<DashboardPage />} />
                <Route path="/dashboard/:jobId/candidate/:applicationId" element={<CandidateDetailPage />} />
                <Route path="/scout" element={<Scout />} />
                <Route path="/inbox" element={<Inbox />} />
                <Route path="/profile" element={<ProfileSettings />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/refund" element={<RefundPolicy />} />
                <Route path="/auth/linkedin/callback" element={<LinkedInCallback />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
