
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, ArrowRight, Users } from "lucide-react";
import { PRICING_PLANS } from "@/constants/pricing";

interface PricingCardsProps {
  onStartFreeTrial: () => void;
  onContactSales: () => void;
}

export const PricingCards = ({ onStartFreeTrial, onContactSales }: PricingCardsProps) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div className="grid lg:grid-cols-3 gap-8 lg:gap-6">
        {PRICING_PLANS.map((plan, index) => {
          const Icon = plan.icon;
          return (
            <Card key={plan.name} className={`relative ${plan.color} ${plan.popular ? 'scale-105 shadow-2xl border-purple-300 pt-8' : 'shadow-lg'} hover:shadow-xl transition-all duration-300`}>
              {plan.popular && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-purple-600 text-white px-6 py-2 text-sm font-bold shadow-lg">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Icon className="w-8 h-8 text-gray-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-2">
                  {plan.price !== "Custom" ? (
                    <>
                      <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-600">/{plan.period}</span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <Button 
                  onClick={plan.name === "Enterprise" ? onContactSales : onStartFreeTrial}
                  className={`w-full py-3 text-lg font-semibold rounded-xl ${plan.buttonStyle} text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105`}
                >
                  {plan.name === "Enterprise" ? (
                    <>
                      <Users className="w-5 h-5 mr-2" />
                      {plan.ctaText}
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      {plan.ctaText}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
                
                <div className="space-y-3">
                  <p className="font-semibold text-gray-900 text-sm uppercase tracking-wide">What's included:</p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};
