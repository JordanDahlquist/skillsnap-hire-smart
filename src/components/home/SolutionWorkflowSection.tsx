
import { Card } from "@/components/ui/card";
import { Brain, Target, TrendingUp, Filter, CheckCircle, BarChart3, MessageSquare, Sparkles, Shield } from "lucide-react";

export const SolutionWorkflowSection = () => {
  const steps = [
    {
      number: 1,
      title: "Create your perfect job in 2 minutes",
      description: "Just input basic requirements. Our AI analyzes thousands of successful job posts to create compelling descriptions that attract the right candidates and repel the wrong ones.",
      features: [
        { icon: Sparkles, text: "AI-optimized copy", color: "text-[#007af6]" },
        { icon: Shield, text: "Bias-free language", color: "text-green-500" }
      ],
      mockup: (
        <div className="space-y-4">
          <div className="h-4 bg-[#007af6] rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="h-3 bg-green-400 rounded w-full"></div>
            <div className="h-3 bg-blue-400 rounded w-full"></div>
          </div>
        </div>
      )
    },
    {
      number: 2,
      title: "AI generates role-specific skill tests",
      description: "No generic coding challenges. Our AI creates tests that mirror real work scenarios for your specific role. Only candidates who can actually do the job will pass.",
      features: [
        { icon: Target, text: "Role-specific challenges", color: "text-purple-600" },
        { icon: TrendingUp, text: "Predictive scoring", color: "text-green-500" }
      ],
      mockup: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-purple-600" />
            <span className="text-gray-900 font-semibold">AI Skill Test Generator</span>
          </div>
          <div className="h-4 bg-purple-400 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-4/5"></div>
          <div className="h-4 bg-gray-200 rounded w-3/5"></div>
          <div className="mt-6 p-4 bg-green-500/20 rounded border border-green-500/30">
            <div className="h-3 bg-green-500 rounded w-2/3"></div>
          </div>
        </div>
      )
    },
    {
      number: 3,
      title: "Get only qualified applicants",
      description: "Public job page with built-in testing. Candidates self-select out if they can't do the work. You only see applications from people who've proven they can deliver.",
      features: [
        { icon: Filter, text: "90% noise reduction", color: "text-blue-600" },
        { icon: CheckCircle, text: "Pre-validated skills", color: "text-green-500" }
      ],
      mockup: (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-900 font-semibold">Applications: 147</span>
            <span className="text-green-600 font-semibold">Qualified: 12</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-green-500/20 rounded border border-green-500/30">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="h-3 bg-green-500 rounded flex-1"></div>
              <span className="text-green-600 text-sm">95%</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-500/20 rounded border border-green-500/30">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="h-3 bg-green-500 rounded flex-1"></div>
              <span className="text-green-600 text-sm">89%</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-500/20 rounded border border-red-500/30">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="h-3 bg-red-500 rounded flex-1"></div>
              <span className="text-red-600 text-sm">23%</span>
            </div>
          </div>
        </div>
      )
    },
    {
      number: 4,
      title: "Manage and analyze with AI insights",
      description: "Powerful dashboard with smart filtering, bulk actions, and deep analytics. Track your hiring funnel, identify top performers, and make data-driven hiring decisions.",
      features: [
        { icon: BarChart3, text: "Performance analytics", color: "text-cyan-600" },
        { icon: MessageSquare, text: "Automated communication", color: "text-orange-600" }
      ],
      mockup: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-cyan-600" />
            <span className="text-gray-900 font-semibold">Hiring Dashboard</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="h-8 bg-gradient-to-t from-blue-600 to-blue-400 rounded mb-2"></div>
              <div className="h-2 bg-gray-300 rounded w-full"></div>
            </div>
            <div className="text-center">
              <div className="h-12 bg-gradient-to-t from-green-600 to-green-400 rounded mb-2"></div>
              <div className="h-2 bg-gray-300 rounded w-full"></div>
            </div>
            <div className="text-center">
              <div className="h-6 bg-gradient-to-t from-purple-600 to-purple-400 rounded mb-2"></div>
              <div className="h-2 bg-gray-300 rounded w-full"></div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-500/20 rounded">
            <div className="h-3 bg-blue-500 rounded w-4/5"></div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24">
      {/* Glass morphism container for better readability */}
      <div className="backdrop-blur-xl bg-white/25 border border-white/40 rounded-3xl shadow-2xl shadow-black/10 p-12 md:p-16 relative overflow-hidden">
        {/* Glass overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/15 to-white/5 rounded-3xl"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-8 tracking-tight">
              How Atract transforms your hiring
            </h2>
            <p className="text-2xl text-slate-600 max-w-4xl mx-auto font-light">
              One intelligent platform. Four powerful steps. Zero time wasted on unqualified candidates.
            </p>
          </div>

          <div className="space-y-24">
            {steps.map((step, index) => (
              <div key={index} className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 0 ? '' : 'lg:grid-flow-col-dense'}`}>
                <div className={index % 2 === 0 ? 'order-2 lg:order-1' : ''}>
                  <div className="relative">
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#007af6] rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {step.number}
                    </div>
                    <Card className="bg-white border border-gray-200 p-8 shadow-lg">
                      {step.mockup}
                    </Card>
                  </div>
                </div>
                <div className={index % 2 === 0 ? 'order-1 lg:order-2' : ''}>
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">{step.title}</h3>
                  <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                    {step.description}
                  </p>
                  <div className="flex items-center gap-4 text-gray-600">
                    {step.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <feature.icon className={`w-5 h-5 ${feature.color}`} />
                        <span>{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
