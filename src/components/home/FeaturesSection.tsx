
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Zap, Filter, MessageSquare, BarChart3, Award } from "lucide-react";

export const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: "AI Job Creation",
      description: "Create compelling job posts in 2 minutes. Our AI understands your requirements and crafts perfect descriptions that attract quality candidates.",
      gradient: "from-blue-500/25 to-blue-600/35",
      iconColor: "text-blue-600",
      bgGradient: "from-white/25 via-transparent to-blue-500/10"
    },
    {
      icon: Zap,
      title: "Smart Skill Testing",
      description: "AI-generated, role-specific tests that actually measure what matters. No more interviews with unqualified candidates.",
      gradient: "from-purple-500/25 to-purple-600/35",
      iconColor: "text-purple-600",
      bgGradient: "from-white/25 via-transparent to-purple-500/10"
    },
    {
      icon: Filter,
      title: "Intelligent Filtering",
      description: "Advanced dashboard with smart filters, bulk actions, and AI-powered candidate scoring. Manage hundreds of applications effortlessly.",
      gradient: "from-emerald-500/25 to-emerald-600/35",
      iconColor: "text-emerald-600",
      bgGradient: "from-white/25 via-transparent to-emerald-500/10"
    },
    {
      icon: MessageSquare,
      title: "Scout AI",
      description: "AI-powered candidate sourcing and chat. Find passive candidates and engage them with intelligent, personalized conversations.",
      gradient: "from-orange-500/25 to-orange-600/35",
      iconColor: "text-orange-600",
      bgGradient: "from-white/25 via-transparent to-orange-500/10"
    },
    {
      icon: BarChart3,
      title: "Hiring Analytics",
      description: "Deep insights into your hiring funnel. Track performance, identify bottlenecks, and optimize your process with data-driven decisions.",
      gradient: "from-cyan-500/25 to-cyan-600/35",
      iconColor: "text-cyan-600",
      bgGradient: "from-white/25 via-transparent to-cyan-500/10"
    },
    {
      icon: Award,
      title: "Automated Communication",
      description: "Smart email templates, bulk communications, and automated follow-ups. Keep candidates engaged while saving hours of manual work.",
      gradient: "from-pink-500/25 to-pink-600/35",
      iconColor: "text-pink-600",
      bgGradient: "from-white/25 via-transparent to-pink-500/10"
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24">
      <div className="text-center mb-20">
        <h2 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-8 tracking-tight">
          Everything you need to hire better, faster
        </h2>
        <p className="text-2xl text-slate-600 max-w-4xl mx-auto font-light">
          From AI job creation to candidate analytics - Atract handles your entire hiring pipeline
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <Card key={index} className="backdrop-blur-xl bg-white/25 border border-white/40 shadow-2xl shadow-black/10 rounded-3xl overflow-hidden group hover:scale-105 transition-all duration-300 hover:shadow-3xl">
            <CardContent className="p-10 text-center relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-3xl`}></div>
              <div className="relative z-10">
                <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg border border-white/30`}>
                  <feature.icon className={`w-10 h-10 ${feature.iconColor}`} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed text-lg">{feature.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
