
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";

interface Application {
  status: string;
  ai_rating: number | null;
  created_at: string;
  experience: string | null;
}

interface Job {
  created_at: string;
  status: string;
}

interface PerformanceMetricsProps {
  applications: Application[];
  job: Job;
}

export const PerformanceMetrics = ({ applications, job }: PerformanceMetricsProps) => {
  // Calculate key metrics
  const totalApplications = applications.length;
  const approvedApplications = applications.filter(app => app.status === 'approved').length;
  const highQualityApps = applications.filter(app => (app.ai_rating || 0) >= 4).length;

  // Time-based calculations
  const jobAge = Math.floor((new Date().getTime() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24));
  const jobAgeHours = Math.floor((new Date().getTime() - new Date(job.created_at).getTime()) / (1000 * 60 * 60));
  const applicationsPerDay = jobAge > 0 ? (totalApplications / jobAge).toFixed(1) : totalApplications.toString();
  
  // Check if job is too new for meaningful analysis (less than 24 hours)
  const isTooNewForAnalysis = jobAgeHours < 24;
  
  // Mock performance benchmarks
  const benchmarkAppsPerDay = 3.2;
  const benchmarkApprovalRate = 25;
  const benchmarkQualityScore = 65;

  // Calculate performance scores
  const velocityScore = jobAge > 0 ? Math.min(100, Math.round((parseFloat(applicationsPerDay) / benchmarkAppsPerDay) * 100)) : 0;
  const approvalRate = totalApplications > 0 ? Math.round((approvedApplications / totalApplications) * 100) : 0;
  const qualityScore = totalApplications > 0 ? Math.round((highQualityApps / totalApplications) * 100) : 0;

  // Overall job health score
  let healthScore;
  if (isTooNewForAnalysis) {
    healthScore = 70; // Neutral score for new jobs
  } else {
    healthScore = Math.round((velocityScore + Math.min(100, (approvalRate / benchmarkApprovalRate) * 100) + Math.min(100, (qualityScore / benchmarkQualityScore) * 100)) / 3);
  }

  const getHealthBadge = (score: number) => {
    if (isTooNewForAnalysis) return { text: "Monitoring", color: "bg-primary/10 text-primary" };
    if (score >= 80) return { text: "Excellent", color: "bg-primary/10 text-primary" };
    if (score >= 60) return { text: "Good", color: "bg-primary/20 text-primary" };
    return { text: "Needs Attention", color: "bg-destructive/10 text-destructive" };
  };

  return (
    <Card className="h-32">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Job Performance
          </div>
          <Badge className={getHealthBadge(healthScore).color}>
            {getHealthBadge(healthScore).text}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        {isTooNewForAnalysis ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Collecting Data</p>
              <p className="text-xs text-muted-foreground">
                Analysis available in {24 - jobAgeHours} hours
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-xl font-bold text-primary">{healthScore}</p>
                <p className="text-xs text-muted-foreground">Score</p>
              </div>
              <div className="flex-1">
                <Progress value={healthScore} className="h-2" />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-muted/50 rounded">
                <p className="text-sm font-bold text-foreground">{velocityScore}</p>
                <p className="text-xs text-muted-foreground">Velocity</p>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded">
                <p className="text-sm font-bold text-foreground">{approvalRate}%</p>
                <p className="text-xs text-muted-foreground">Approval</p>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded">
                <p className="text-sm font-bold text-foreground">{qualityScore}%</p>
                <p className="text-xs text-muted-foreground">Quality</p>
              </div>
            </div>
          </div>
        )}
        
        {healthScore >= 80 && !isTooNewForAnalysis && (
          <div className="flex items-center gap-2 mt-2 p-2 bg-primary/5 rounded">
            <CheckCircle className="w-3 h-3 text-primary" />
            <p className="text-xs text-primary font-medium">Excellent performance!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
