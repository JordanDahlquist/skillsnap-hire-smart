
import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn, Rocket, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface FinalCTASectionProps {
  onGetStarted: () => void;
}

export const FinalCTASection = ({ onGetStarted }: FinalCTASectionProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24">
      <div className="text-center backdrop-blur-xl bg-white/25 border border-white/40 rounded-3xl shadow-2xl shadow-black/10 p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/15 to-white/5 rounded-3xl"></div>
        
        <div className="relative z-10">
          <h2 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-8 tracking-tight">
            Ready to revolutionize your hiring?
          </h2>
          <p className="text-2xl lg:text-3xl text-slate-700 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
            Join 500+ companies that have transformed their hiring with AI. 
            Create your first role and start getting qualified candidates in minutes.
          </p>
          
          <div className="flex items-center justify-center gap-12 mb-12">
            <div className="flex items-center gap-3 backdrop-blur-sm bg-white/50 px-6 py-3 rounded-2xl border border-white/50">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
              <span className="text-slate-600 font-medium">Free to start</span>
            </div>
            <div className="flex items-center gap-3 backdrop-blur-sm bg-white/50 px-6 py-3 rounded-2xl border border-white/50">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
              <span className="text-slate-600 font-medium">2-minute setup</span>
            </div>
            <div className="flex items-center gap-3 backdrop-blur-sm bg-white/50 px-6 py-3 rounded-2xl border border-white/50">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
              <span className="text-slate-600 font-medium">No credit card required</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <Button 
              onClick={onGetStarted} 
              size="lg" 
              className="group liquid-glass-button liquid-ripple-effect backdrop-blur-xl bg-gradient-to-br from-blue-500/40 via-cyan-500/35 to-indigo-600/40 hover:from-blue-500/50 hover:via-cyan-500/45 hover:to-indigo-600/50 text-white px-20 py-10 text-2xl font-bold shadow-3xl border-2 border-white/30 hover:border-white/40 rounded-4xl transition-all duration-500 hover:scale-105 hover:shadow-[0_40px_80px_-12px_rgba(59,130,246,0.4),0_0_0_1px_rgba(255,255,255,0.2)_inset] active:scale-95"
            >
              <Rocket className="mr-4 w-8 h-8 group-hover:rotate-12 transition-transform duration-300" />
              Start Your First Hire
              <ArrowRight className="ml-4 w-8 h-8 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            
            {!user && (
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth')} 
                size="lg" 
                className="backdrop-blur-xl bg-white/30 border-2 border-white/50 text-slate-700 hover:bg-white/40 hover:text-slate-900 px-20 py-10 text-xl font-semibold rounded-4xl transition-all duration-500 hover:scale-105 shadow-2xl hover:shadow-3xl"
              >
                <LogIn className="mr-4 w-7 h-7" />
                Sign In
              </Button>
            )}
          </div>
          
          <p className="text-slate-500 text-lg mt-12 font-light">
            Trusted by 500+ companies • Average setup time: 2 minutes • 95% customer satisfaction
          </p>
        </div>
      </div>
    </section>
  );
};
