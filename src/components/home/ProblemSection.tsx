
import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, Target } from "lucide-react";

export const ProblemSection = () => {
  const problems = [
    {
      icon: Users,
      title: "Flooded with unqualified applicants",
      description: "Job boards bring quantity, not quality. You spend hours sifting through 200+ applications where 90% can't even do the basic requirements of the job.",
      gradient: "from-red-500/25 to-red-600/35",
      iconColor: "text-red-600",
      bgGradient: "from-red-500/15 via-transparent to-red-500/10",
      borderColor: "border-red-200/60",
      shadowColor: "shadow-red-500/10"
    },
    {
      icon: Clock,
      title: "Interviews are massive time sinks",
      description: "Hours spent interviewing people who looked good on paper but can't actually perform. Your time is worth $500+/hour, not screening resumes.",
      gradient: "from-yellow-500/25 to-yellow-600/35",
      iconColor: "text-yellow-600",
      bgGradient: "from-yellow-500/15 via-transparent to-yellow-500/10",
      borderColor: "border-yellow-200/60",
      shadowColor: "shadow-yellow-500/10"
    },
    {
      icon: Target,
      title: "No way to verify actual skills",
      description: "Resumes lie. Portfolios can be copied. Interviews can be gamed. You need to see real work quality before investing time in candidates.",
      gradient: "from-orange-500/25 to-orange-600/35",
      iconColor: "text-orange-600",
      bgGradient: "from-orange-500/15 via-transparent to-orange-500/10",
      borderColor: "border-orange-200/60",
      shadowColor: "shadow-orange-500/10"
    }
  ];

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/10 via-red-900/10 to-orange-900/10 backdrop-blur-3xl"></div>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-8 tracking-tight">
            The hiring nightmare every founder faces
          </h2>
          <p className="text-2xl text-slate-600 max-w-4xl mx-auto font-light">
            Traditional hiring is broken. You're drowning in unqualified applicants while the best candidates slip through the cracks.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <Card key={index} className={`backdrop-blur-xl bg-white/20 border ${problem.borderColor} shadow-2xl ${problem.shadowColor} rounded-3xl overflow-hidden`}>
              <CardContent className="p-10 text-center relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${problem.bgGradient} rounded-3xl`}></div>
                <div className="relative z-10">
                  <div className={`w-20 h-20 bg-gradient-to-br ${problem.gradient} backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg border border-white/30`}>
                    <problem.icon className={`w-10 h-10 ${problem.iconColor}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">{problem.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">{problem.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
