
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";

export const PricingHero = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
      <div className="text-center max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Badge variant="secondary" className="px-4 py-2 text-sm font-semibold">
            <Sparkles className="w-4 h-4 mr-2" />
            Save 20% with annual billing
          </Badge>
        </div>
        
        <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Choose Your
          <span className="text-[#007af6]"> Hiring Superpower</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          Transform your hiring process with AI. Start your free trial today and hire 5x faster with 90% fewer unqualified applicants.
        </p>

        <div className="flex items-center justify-center gap-8 mb-12 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            <span>14-day free trial</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
};
