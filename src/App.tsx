
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
import { EnhancedHeader } from "./components/EnhancedHeader";

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
          <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30">
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
                  <>
                    <EnhancedHeader 
                      breadcrumbs={[{ label: "My Jobs", isCurrentPage: true }]}
                    />
                    <div className="pt-16">
                      <MyJobs />
                    </div>
                  </>
                </AuthGuard>
              } />
              <Route path="/jobs/public" element={<PublicJobs />} />
              <Route path="/dashboard/:jobId" element={
                <AuthGuard>
                  <>
                    <EnhancedHeader 
                      breadcrumbs={[
                        { label: "My Jobs", href: "/jobs" },
                        { label: "Dashboard", isCurrentPage: true }
                      ]}
                      showCreateButton={false}
                    />
                    <div className="pt-16">
                      <Dashboard />
                    </div>
                  </>
                </AuthGuard>
              } />
              <Route path="/apply/:jobId" element={<JobApplicationPage />} />
              <Route path="/profile" element={
                <AuthGuard>
                  <>
                    <EnhancedHeader 
                      breadcrumbs={[{ label: "Profile Settings", isCurrentPage: true }]}
                      showCreateButton={false}
                    />
                    <div className="pt-16">
                      <ProfileSettings />
                    </div>
                  </>
                </AuthGuard>
              } />
              <Route path="/settings" element={
                <AuthGuard>
                  <>
                    <EnhancedHeader 
                      breadcrumbs={[{ label: "Settings", isCurrentPage: true }]}
                      showCreateButton={false}
                    />
                    <div className="pt-16">
                      <ProfileSettings />
                    </div>
                  </>
                </AuthGuard>
              } />
              <Route path="/linkedin/callback" element={<LinkedInCallback />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
