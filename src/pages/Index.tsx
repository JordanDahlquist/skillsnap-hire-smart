
import { useState, useEffect } from "react";
import { JobCreatorPanel } from "@/components/JobCreatorPanel";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { UnifiedHeader } from "@/components/UnifiedHeader";
import { useNavigate, useLocation } from "react-router-dom";
import { HeroSection } from "@/components/home/HeroSection";
import { DashboardPreview } from "@/components/home/DashboardPreview";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { ProblemSection } from "@/components/home/ProblemSection";
import { SolutionWorkflowSection } from "@/components/home/SolutionWorkflowSection";
import { SocialProofSection } from "@/components/home/SocialProofSection";
import { FinalCTASection } from "@/components/home/FinalCTASection";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, loading } = useAuth();

  // Redirect authenticated users to dashboard only when on home page
  useEffect(() => {
    if (!loading && user && location.pathname === '/') {
      navigate('/jobs');
    }
  }, [user, loading, navigate, location.pathname]);

  const handleCreateRole = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowCreateModal(true);
    }
  };

  const handleGetStarted = () => {
    if (!user) {
      navigate('/signup');
    } else {
      setShowCreateModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Content Layer */}
      <div className="relative z-10">
        {/* Unified Header */}
        <UnifiedHeader onCreateRole={handleCreateRole} showCreateButton={true} />

        {/* Hero Section */}
        <HeroSection onGetStarted={handleGetStarted} />

        {/* Dashboard Preview */}
        <DashboardPreview />

        {/* Features at a Glance */}
        <FeaturesSection />

        {/* Problem Section */}
        <ProblemSection />

        {/* Solution Workflow Section */}
        <SolutionWorkflowSection />

        {/* Social Proof Section */}
        <SocialProofSection />

        {/* Final CTA Section */}
        <FinalCTASection onGetStarted={handleGetStarted} />
      </div>

      <JobCreatorPanel open={showCreateModal} onOpenChange={setShowCreateModal} />
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
};

export default Index;
