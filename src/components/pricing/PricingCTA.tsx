
import { Button } from "@/components/ui/button";
import { Rocket, ArrowRight } from "lucide-react";

interface PricingCTAProps {
  onStartFreeTrial: () => void;
}

export const PricingCTA = ({ onStartFreeTrial }: PricingCTAProps) => {
  return (
    <section className="bg-gradient-to-r from-[#007af6] to-purple-600 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">
          Ready to transform your hiring?
        </h2>
        <p className="text-xl text-blue-100 mb-8 leading-relaxed">
          Join 500+ companies already hiring smarter with Atract. Start your free trial today.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            onClick={onStartFreeTrial}
            size="lg" 
            className="bg-white text-[#007af6] hover:bg-gray-100 px-10 py-4 text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 rounded-xl"
          >
            <Rocket className="mr-3 w-6 h-6" />
            Start Free Trial
            <ArrowRight className="ml-3 w-6 h-6" />
          </Button>
        </div>
        
        <p className="text-blue-200 text-sm mt-6">
          14-day free trial • No credit card required • Cancel anytime
        </p>
      </div>
    </section>
  );
};
