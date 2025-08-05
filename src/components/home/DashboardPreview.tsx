import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Briefcase, Users, TrendingUp, Clock, CheckCircle, Calendar } from "lucide-react";

export const DashboardPreview = () => {
  return (
    <section className="bg-muted/30 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            See Your Hiring Dashboard in Action
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get a complete overview of your recruitment pipeline with real-time insights and AI-powered recommendations.
          </p>
        </div>
        
        {/* Dashboard Screenshot */}
        <div className="bg-white rounded-lg shadow-xl border border-border overflow-hidden">
          <img 
            src="/lovable-uploads/d12e161a-1aed-488d-a5f6-e41f9bfd3cf0.png" 
            alt="Atract AI-powered hiring dashboard showing candidate profiles, AI briefings, and recruitment analytics"
            className="w-full h-auto max-w-full"
          />
        </div>
      </div>
    </section>
  );
};