
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthGuard } from "@/components/AuthGuard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import MyJobs from "./pages/MyJobs";
import PublicJobs from "./pages/PublicJobs";
import { LinkedInCallback } from "./pages/LinkedInCallback";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ProfileSettings from "./pages/ProfileSettings";
import { Dashboard } from "./components/Dashboard";
import { JobApplicationPage } from "./pages/JobApplicationPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry auth-related errors
        if (error?.message?.includes('JWT') || error?.message?.includes('auth')) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 30000,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <AuthGuard requireAuth={false}>
                <Index />
              </AuthGuard>
            } />
            <Route path="/auth" element={
              <AuthGuard requireAuth={false}>
                <Auth />
              </AuthGuard>
            } />
            <Route path="/jobs" element={
              <AuthGuard>
                <MyJobs />
              </AuthGuard>
            } />
            <Route path="/jobs/public" element={<PublicJobs />} />
            <Route path="/dashboard/:jobId" element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            } />
            <Route path="/apply/:jobId" element={<JobApplicationPage />} />
            <Route path="/profile" element={
              <AuthGuard>
                <ProfileSettings />
              </AuthGuard>
            } />
            <Route path="/settings" element={
              <AuthGuard>
                <ProfileSettings />
              </AuthGuard>
            } />
            <Route path="/linkedin/callback" element={<LinkedInCallback />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
