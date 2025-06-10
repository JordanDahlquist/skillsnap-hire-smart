
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown, Rocket, ArrowRight, Users, Building, Sparkles } from "lucide-react";
import { UnifiedHeader } from "@/components/UnifiedHeader";
import { useState } from "react";
import { JobCreatorPanel } from "@/components/JobCreatorPanel";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

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
    navigate('/auth');
  };

  const handleContactSales = () => {
    navigate('/contact');
  };

  const plans = [
    {
      name: "Starter",
      price: "29",
      period: "month",
      description: "Perfect for small teams and startups",
      icon: Rocket,
      color: "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50",
      buttonStyle: "bg-blue-600 hover:bg-blue-700",
      features: [
        "Up to 3 active job postings",
        "AI job description generator",
        "Basic skill tests",
        "100 applications per month",
        "Email support",
        "Basic analytics",
        "Public job page",
        "Applicant filtering"
      ],
      limitations: [],
      ctaText: "Start Free Trial"
    },
    {
      name: "Professional",
      price: "79",
      period: "month",
      description: "For growing companies that hire regularly",
      icon: Crown,
      color: "border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50",
      buttonStyle: "bg-purple-600 hover:bg-purple-700",
      popular: true,
      features: [
        "Up to 15 active job postings",
        "Advanced AI test generation",
        "Custom skill assessments",
        "500 applications per month",
        "Priority support",
        "Advanced analytics & reporting",
        "Scout AI candidate sourcing",
        "Bulk actions & automation",
        "Custom email templates",
        "Video interview scheduling",
        "API access",
        "Team collaboration tools"
      ],
      limitations: [],
      ctaText: "Start Free Trial"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations with complex needs",
      icon: Building,
      color: "border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50",
      buttonStyle: "bg-gray-900 hover:bg-gray-800",
      features: [
        "Unlimited job postings",
        "Custom AI model training",
        "Advanced integration options",
        "Unlimited applications",
        "Dedicated account manager",
        "Custom analytics dashboard",
        "White-label solutions",
        "Advanced security features",
        "Custom workflows",
        "SLA guarantee",
        "On-premise deployment option",
        "24/7 phone support"
      ],
      limitations: [],
      ctaText: "Contact Sales"
    }
  ];

  const features = [
    "AI-Powered Job Creation",
    "Smart Skill Testing",
    "Intelligent Filtering",
    "Scout AI Sourcing",
    "Advanced Analytics",
    "Automated Communication",
    "Video Interviews",
    "Team Collaboration"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <UnifiedHeader onCreateRole={handleCreateRole} />
      
      {/* Hero Section */}
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

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-6">
          {plans.map((plan, index) => {
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
                    onClick={plan.name === "Enterprise" ? handleContactSales : handleStartFreeTrial}
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

      {/* Feature Comparison */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Everything you need to revolutionize hiring
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Compare our plans and see how Atract can transform your hiring process
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Check className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{feature}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by 500+ companies worldwide
            </h2>
            <p className="text-gray-600">
              Join thousands of companies that have transformed their hiring with Atract
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#007af6] mb-2">5x</div>
              <div className="text-gray-600">Faster Hiring</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#007af6] mb-2">90%</div>
              <div className="text-gray-600">Fewer Bad Applicants</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#007af6] mb-2">15hrs</div>
              <div className="text-gray-600">Time Saved Per Hire</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#007af6] mb-2">95%</div>
              <div className="text-gray-600">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "How does the free trial work?",
                a: "Start with a 14-day free trial - no credit card required. You'll have full access to all features in your chosen plan."
              },
              {
                q: "Can I change plans at any time?",
                a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate the billing."
              },
              {
                q: "What kind of support do you offer?",
                a: "All plans include email support. Professional plans get priority support, and Enterprise gets dedicated account management."
              },
              {
                q: "How does the AI testing work?",
                a: "Our AI analyzes your job requirements and creates custom skill tests that mirror real work scenarios. This ensures only qualified candidates pass through."
              },
              {
                q: "Is there a setup fee?",
                a: "No setup fees, ever. You only pay the monthly subscription fee for your chosen plan."
              }
            ].map((faq, index) => (
              <Card key={index} className="border-gray-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">{faq.q}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
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
              onClick={handleCreateRole}
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

      <JobCreatorPanel open={showCreateModal} onOpenChange={setShowCreateModal} />
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
};

export default Pricing;
