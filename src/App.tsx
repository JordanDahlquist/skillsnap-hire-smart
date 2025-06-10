
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SimpleSignUp from "./pages/SimpleSignUp";
import ConfirmEmail from "./pages/ConfirmEmail";
import ProfileSettings from "./pages/ProfileSettings";
import ResetPassword from "./pages/ResetPassword";
import PublicJobs from "./pages/PublicJobs";
import { JobApplicationPage } from "./pages/JobApplicationPage";
import { OptimizedJobsPage } from "./components/jobs/OptimizedJobsPage";
import { DashboardPage } from "./components/dashboard/DashboardPage";
import Scout from "./pages/Scout";
import { Inbox } from "./pages/Inbox";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPolicy";
import { LinkedInCallback } from "./pages/LinkedInCallback";
import NotFound from "./pages/NotFound";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/signup" element={<SimpleSignUp />} />
            <Route path="/confirm-email" element={<ConfirmEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/jobs/public" element={<PublicJobs />} />
            <Route path="/jobs/apply/:jobId" element={<JobApplicationPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsOfService />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/linkedin/callback" element={<LinkedInCallback />} />
            
            {/* Protected routes */}
            <Route path="/jobs" element={<AuthGuard><OptimizedJobsPage /></AuthGuard>} />
            <Route path="/dashboard" element={<AuthGuard><Navigate to="/jobs" replace /></AuthGuard>} />
            <Route path="/dashboard/:jobId" element={<AuthGuard><DashboardPage /></AuthGuard>} />
            <Route path="/scout" element={<AuthGuard><Scout /></AuthGuard>} />
            <Route path="/inbox" element={<AuthGuard><Inbox /></AuthGuard>} />
            <Route path="/profile" element={<AuthGuard><ProfileSettings /></AuthGuard>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
