
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export const PricingHero = () => {
  return (
    <section className="text-center py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto">
        <Badge className="mb-6 bg-blue-100 text-blue-800 px-4 py-2 text-sm font-medium">
          <Sparkles className="w-4 h-4 mr-2" />
          7-Day Free Trial • No Credit Card Required
        </Badge>
        
        <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Transform Your Hiring with{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI-Powered Recruiting
          </span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          Join 500+ companies using Atract to find, assess, and hire top talent faster. 
          Start your free trial today and experience the future of recruitment.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">10x</div>
            <div className="text-gray-600">Faster candidate screening</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">85%</div>
            <div className="text-gray-600">Reduction in time-to-hire</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">50%</div>
            <div className="text-gray-600">Improvement in hire quality</div>
          </div>
        </div>
      </div>
    </section>
  );
};
