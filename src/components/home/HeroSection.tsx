
import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn, Rocket, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-24 pb-32">
      <div className="text-center max-w-6xl mx-auto">
        {/* Hero Content */}
        <div className="backdrop-blur-xl bg-white/25 border border-white/40 rounded-3xl shadow-2xl shadow-black/10 p-12 md:p-16 relative overflow-hidden">
          {/* Glass overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/15 to-white/5 rounded-3xl"></div>
          
          <div className="relative z-10">
            <h1 className="text-6xl lg:text-8xl font-bold text-slate-900 mb-10 leading-tight tracking-tight">
              AI-Powered Hiring That
              <span className="block bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent mt-4">
                Actually Works
              </span>
            </h1>
            
            <p className="text-2xl lg:text-3xl text-slate-700 mb-8 leading-relaxed max-w-5xl mx-auto font-light">
              Create jobs in 2 minutes. Get AI-generated skill tests. Filter out 90% of bad applicants automatically. 
              Hire top talent in days, not weeks.
            </p>
            
            <div className="flex items-center justify-center gap-12 mb-12 text-lg text-slate-600">
              <div className="flex items-center gap-3 backdrop-blur-sm bg-white/50 px-6 py-3 rounded-2xl border border-white/50">
                <CheckCircle className="w-6 h-6 text-emerald-500 drop-shadow-sm" />
                <span className="font-medium">5x faster hiring</span>
              </div>
              <div className="flex items-center gap-3 backdrop-blur-sm bg-white/50 px-6 py-3 rounded-2xl border border-white/50">
                <CheckCircle className="w-6 h-6 text-emerald-500 drop-shadow-sm" />
                <span className="font-medium">90% fewer bad applicants</span>
              </div>
              <div className="flex items-center gap-3 backdrop-blur-sm bg-white/50 px-6 py-3 rounded-2xl border border-white/50">
                <CheckCircle className="w-6 h-6 text-emerald-500 drop-shadow-sm" />
                <span className="font-medium">Zero manual screening</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                onClick={onGetStarted} 
                size="lg" 
                className="group liquid-glass-button liquid-ripple-effect backdrop-blur-xl bg-gradient-to-br from-blue-500/40 via-cyan-500/35 to-indigo-600/40 hover:from-blue-500/50 hover:via-cyan-500/45 hover:to-indigo-600/50 text-white px-16 py-8 text-2xl font-bold shadow-3xl border-2 border-white/30 hover:border-white/40 rounded-4xl transition-all duration-500 hover:scale-105 hover:shadow-[0_40px_80px_-12px_rgba(59,130,246,0.4),0_0_0_1px_rgba(255,255,255,0.2)_inset] active:scale-95"
              >
                <Rocket className="mr-4 w-8 h-8 group-hover:rotate-12 transition-transform duration-300" />
                Start Hiring Smarter
                <ArrowRight className="ml-4 w-8 h-8 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              
              {!user && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/auth')} 
                  size="lg" 
                  className="backdrop-blur-xl bg-white/30 border-2 border-white/50 text-slate-700 hover:bg-white/40 hover:text-slate-900 px-16 py-8 text-xl font-semibold rounded-4xl transition-all duration-500 hover:scale-105 shadow-2xl hover:shadow-3xl"
                >
                  <LogIn className="mr-4 w-7 h-7" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
