
import { useState } from "react";
import { JobCreatorPanel } from "@/components/JobCreatorPanel";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { UnifiedHeader } from "@/components/UnifiedHeader";
import { useNavigate } from "react-router-dom";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { ProblemSection } from "@/components/home/ProblemSection";
import { SolutionWorkflowSection } from "@/components/home/SolutionWorkflowSection";
import { SocialProofSection } from "@/components/home/SocialProofSection";
import { FinalCTASection } from "@/components/home/FinalCTASection";

const Index = () => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

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
    <div className="min-h-screen cosmos-flowers-background relative overflow-hidden">
      {/* Ambient Background Effects - Enhanced for cosmos flowers background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-pink-400/15 to-purple-400/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-300/10 to-pink-300/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10">
        {/* Unified Header */}
        <UnifiedHeader onCreateRole={handleCreateRole} showCreateButton={true} />

        {/* Hero Section */}
        <HeroSection onGetStarted={handleGetStarted} />

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
