
import { useState } from "react";
import { UnifiedHeader } from "@/components/UnifiedHeader";
import { JobCreatorPanel } from "@/components/JobCreatorPanel";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { PricingHero } from "@/components/pricing/PricingHero";
import { PricingCards } from "@/components/pricing/PricingCards";
import { FeatureComparison } from "@/components/pricing/FeatureComparison";
import { SocialProof } from "@/components/pricing/SocialProof";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import { PricingCTA } from "@/components/pricing/PricingCTA";

const Pricing = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCreateRole = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowCreateModal(true);
    }
  };

  const handleStartFreeTrial = () => {
    navigate('/signup');
  };

  const handleContactSales = () => {
    navigate('/contact');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <UnifiedHeader onCreateRole={handleCreateRole} />
      
      <PricingHero />
      <PricingCards 
        onStartFreeTrial={handleStartFreeTrial}
        onContactSales={handleContactSales}
      />
      <FeatureComparison />
      <SocialProof />
      <PricingFAQ />
      <PricingCTA onStartFreeTrial={handleStartFreeTrial} />

      <JobCreatorPanel open={showCreateModal} onOpenChange={setShowCreateModal} />
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
};

export default Pricing;
