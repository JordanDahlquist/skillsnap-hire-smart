import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MyJobs from "./pages/MyJobs";
import PublicJobs from "./pages/PublicJobs";
import Auth from "./pages/Auth";
import { JobApplication } from "./components/JobApplication";
import { Dashboard } from "./components/Dashboard";
import NotFound from "./pages/NotFound";
import { LinkedInCallback } from "./pages/LinkedInCallback";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background font-sans antialiased">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/jobs" element={<MyJobs />} />
              <Route path="/jobs/public" element={<PublicJobs />} />
              <Route path="/apply/:jobId" element={<JobApplication />} />
              <Route path="/dashboard/:jobId" element={<Dashboard />} />
              <Route path="/linkedin-callback" element={<LinkedInCallback />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
