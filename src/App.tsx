
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthGuard } from "@/components/AuthGuard";
import { createOptimizedQueryClient } from "@/config/queryClient";

// Lazy load components for code splitting
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const OptimizedJobsPage = lazy(() => import("./components/jobs/OptimizedJobsPage").then(module => ({ default: module.OptimizedJobsPage })));
const PublicJobs = lazy(() => import("./pages/PublicJobs"));
const LinkedInCallback = lazy(() => import("./pages/LinkedInCallback").then(module => ({ default: module.LinkedInCallback })));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const ProfileSettings = lazy(() => import("./pages/ProfileSettings"));
const Dashboard = lazy(() => import("./components/Dashboard").then(module => ({ default: module.Dashboard })));
const JobApplicationPage = lazy(() => import("./pages/JobApplicationPage").then(module => ({ default: module.JobApplicationPage })));

const queryClient = createOptimizedQueryClient();

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p className="mt-4 text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
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
                  <OptimizedJobsPage />
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
              <Route path="/linkedin/callback" element={<LinkedInCallback />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
