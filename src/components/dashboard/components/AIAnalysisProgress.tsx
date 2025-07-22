
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Brain, 
  Scale, 
  Target, 
  Check, 
  Sparkles,
  FileText,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface AIAnalysisProgressProps {
  totalApplications: number;
  currentApplication: number;
  currentPhase: 'parsing' | 'analyzing' | 'comparing' | 'ranking' | 'complete';
  currentApplicantName?: string;
  parsedCount?: number;
  isVisible: boolean;
  onComplete?: () => void;
}

const phases = {
  parsing: {
    icon: Search,
    title: 'Scanning Resumes',
    description: 'Processing and extracting candidate information',
    color: 'text-blue-600',
    bgColor: 'from-blue-50 to-indigo-50'
  },
  analyzing: {
    icon: Brain,
    title: 'Analyzing Experience & Skills',
    description: 'AI evaluation of qualifications and competencies',
    color: 'text-purple-600',
    bgColor: 'from-purple-50 to-pink-50'
  },
  comparing: {
    icon: Scale,
    title: 'Comparing Qualifications',
    description: 'Matching candidates against job requirements',
    color: 'text-orange-600',
    bgColor: 'from-orange-50 to-yellow-50'
  },
  ranking: {
    icon: Target,
    title: 'Ranking Candidates',
    description: 'Determining optimal candidate order',
    color: 'text-green-600',
    bgColor: 'from-green-50 to-emerald-50'
  },
  complete: {
    icon: Check,
    title: 'Analysis Complete!',
    description: 'All candidates have been evaluated and ranked',
    color: 'text-emerald-600',
    bgColor: 'from-emerald-50 to-green-50'
  }
};

export const AIAnalysisProgress = ({
  totalApplications,
  currentApplication,
  currentPhase,
  currentApplicantName,
  parsedCount = 0,
  isVisible,
  onComplete
}: AIAnalysisProgressProps) => {
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const actualProgress = (currentApplication / totalApplications) * 100;
  
  const currentPhaseInfo = phases[currentPhase];
  const PhaseIcon = currentPhaseInfo.icon;

  // Smooth progress animation
  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayedProgress(prev => {
        const diff = actualProgress - prev;
        if (Math.abs(diff) < 1) return actualProgress;
        return prev + diff * 0.1;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [actualProgress]);

  // Auto-complete after showing success
  useEffect(() => {
    if (currentPhase === 'complete' && onComplete) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentPhase, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-background/95 backdrop-blur border shadow-xl">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Main Icon */}
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <PhaseIcon className={`w-8 h-8 ${currentPhaseInfo.color} ${currentPhase !== 'complete' ? 'animate-pulse' : ''}`} />
            </div>

            {/* Phase Title and Description */}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                {currentPhaseInfo.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentPhaseInfo.description}
              </p>
            </div>

            {/* Current Activity */}
            {currentApplicantName && currentPhase !== 'complete' && (
              <div className="bg-muted/50 rounded-lg p-3 border">
                <p className="text-xs text-muted-foreground mb-1">Currently analyzing:</p>
                <p className="font-medium text-foreground">{currentApplicantName}</p>
              </div>
            )}

            {/* Progress Bar */}
            <div className="space-y-3">
              <Progress 
                value={displayedProgress} 
                className="h-2" 
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{currentApplication} of {totalApplications} processed</span>
                <span>{Math.round(displayedProgress)}% complete</span>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/30 rounded-lg p-3 border">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs font-medium">Resumes Processed</span>
                </div>
                <p className="text-xl font-bold text-foreground">{parsedCount}</p>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-3 border">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium">Candidates Analyzed</span>
                </div>
                <p className="text-xl font-bold text-foreground">{currentApplication}</p>
              </div>
            </div>

            {/* Completion Message */}
            {currentPhase === 'complete' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 text-green-700">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">
                    Successfully analyzed {totalApplications} candidates with {parsedCount} resumes processed!
                  </span>
                </div>
                <p className="text-green-600 text-sm mt-1 text-center">Rankings have been updated and are ready to view.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
