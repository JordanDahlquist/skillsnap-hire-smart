
import { useNavigate } from "react-router-dom";
import { PricingHero } from "@/components/pricing/PricingHero";
import { PricingCards } from "@/components/pricing/PricingCards";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import { PricingCTA } from "@/components/pricing/PricingCTA";
import { FeatureComparison } from "@/components/pricing/FeatureComparison";
import { SocialProof } from "@/components/pricing/SocialProof";
import { UnifiedHeader } from "@/components/UnifiedHeader";
import { Footer } from "@/components/Footer";

const Pricing = () => {
  const navigate = useNavigate();

  const handleStartFreeTrial = () => {
    navigate('/signup');
  };

  const handleContactSales = () => {
    navigate('/contact');
  };

  return (
    <div className="min-h-screen bg-white">
      <UnifiedHeader />
      <main>
        <PricingHero />
        <PricingCards 
          onStartFreeTrial={handleStartFreeTrial}
          onContactSales={handleContactSales}
        />
        <SocialProof />
        <FeatureComparison />
        <PricingFAQ />
        <PricingCTA 
          onStartFreeTrial={handleStartFreeTrial}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
