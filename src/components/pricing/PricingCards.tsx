
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, ArrowRight, Users } from "lucide-react";
import { PRICING_PLANS } from "@/constants/pricing";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface PricingCardsProps {
  onStartFreeTrial: () => void;
  onContactSales: () => void;
}

export const PricingCards = ({ onStartFreeTrial, onContactSales }: PricingCardsProps) => {
  const { user, isAuthenticated } = useAuth();
  const { subscription, hasActiveAccess } = useSubscription();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planType: string) => {
    if (!isAuthenticated || !user) {
      onStartFreeTrial();
      return;
    }

    if (planType === 'enterprise') {
      onContactSales();
      return;
    }

    setLoading(planType);

    try {
      const { data, error } = await supabase.functions.invoke('create-paddle-checkout', {
        body: {
          plan_type: planType,
          user_id: user.id,
        },
      });

      if (error) throw error;

      // Redirect to Paddle checkout
      window.location.href = data.checkout_url;

    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const getButtonText = (plan: any) => {
    if (!isAuthenticated) {
      return plan.name === "Enterprise" ? plan.ctaText : "Start 7-Day Free Trial";
    }

    if (subscription?.plan_type === plan.name.toLowerCase()) {
      return "Current Plan";
    }

    return plan.ctaText;
  };

  const isCurrentPlan = (planName: string) => {
    return subscription?.plan_type === planName.toLowerCase();
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div className="grid lg:grid-cols-3 gap-8 lg:gap-6">
        {PRICING_PLANS.map((plan, index) => {
          const Icon = plan.icon;
          const currentPlan = isCurrentPlan(plan.name);
          const isLoading = loading === plan.name.toLowerCase();
          
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
                  onClick={() => handleUpgrade(plan.name.toLowerCase())}
                  disabled={currentPlan || isLoading}
                  className={`w-full py-3 text-lg font-semibold rounded-xl ${
                    currentPlan 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : plan.buttonStyle
                  } text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : plan.name === "Enterprise" ? (
                    <>
                      <Users className="w-5 h-5 mr-2" />
                      {getButtonText(plan)}
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      {getButtonText(plan)}
                      {!currentPlan && <ArrowRight className="w-5 h-5 ml-2" />}
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
