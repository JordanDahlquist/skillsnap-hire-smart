
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
    <section className="bg-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
          Transform Your Hiring with{" "}
          <span className="text-primary">AI-Powered Recruiting</span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
          Join 500+ companies using Atract to find, assess, and hire top talent faster. 
          Start your free trial today and experience the future of recruitment.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            onClick={onGetStarted} 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg font-semibold"
          >
            Try it free
          </Button>
          
          {!user && (
            <Button 
              variant="outline" 
              onClick={() => navigate('/auth')} 
              size="lg" 
              className="border-border text-foreground hover:bg-muted px-8 py-3 text-lg font-semibold"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};
