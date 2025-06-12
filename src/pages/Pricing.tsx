
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
    <div className="min-h-screen cosmos-flowers-background">
      <UnifiedHeader />
      <main className="relative">
        {/* Ambient lighting effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-300/5 to-purple-300/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        </div>

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
