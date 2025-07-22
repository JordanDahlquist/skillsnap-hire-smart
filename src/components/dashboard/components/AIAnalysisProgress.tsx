
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
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <Card className={`w-full max-w-2xl bg-gradient-to-br ${currentPhaseInfo.bgColor} border-0 shadow-2xl`}>
        <CardContent className="p-12">
          <div className="text-center space-y-8">
            {/* Main Icon Animation */}
            <div className="relative">
              <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden">
                <PhaseIcon className={`w-16 h-16 ${currentPhaseInfo.color} ${currentPhase !== 'complete' ? 'animate-pulse' : ''}`} />
                
                {/* Sparkle effects for active phases */}
                {currentPhase !== 'complete' && (
                  <>
                    <Sparkles className="w-6 h-6 text-yellow-400 absolute top-4 right-6 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <Sparkles className="w-4 h-4 text-blue-400 absolute bottom-6 left-4 animate-bounce" style={{ animationDelay: '0.8s' }} />
                    <Sparkles className="w-5 h-5 text-purple-400 absolute top-8 left-8 animate-bounce" style={{ animationDelay: '1.2s' }} />
                  </>
                )}
              </div>
              
              {/* Spinning ring for active phases */}
              {currentPhase !== 'complete' && (
                <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" />
              )}
            </div>

            {/* Phase Title and Description */}
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-gray-900">
                {currentPhaseInfo.title}
              </h2>
              <p className="text-lg text-gray-600">
                {currentPhaseInfo.description}
              </p>
            </div>

            {/* Current Activity */}
            {currentApplicantName && currentPhase !== 'complete' && (
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-sm text-gray-600 mb-1">Currently analyzing:</p>
                <p className="font-semibold text-gray-900 text-lg">{currentApplicantName}</p>
              </div>
            )}

            {/* Progress Bar */}
            <div className="space-y-4">
              <Progress 
                value={displayedProgress} 
                className="h-4 bg-white/60" 
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>{currentApplication} of {totalApplications} processed</span>
                <span>{Math.round(displayedProgress)}% complete</span>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/40 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">Resumes Processed</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{parsedCount}</p>
              </div>
              
              <div className="bg-white/40 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-2 text-purple-600 mb-2">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Candidates Analyzed</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{currentApplication}</p>
              </div>
            </div>

            {/* Completion Message */}
            {currentPhase === 'complete' && (
              <div className="bg-emerald-100 border border-emerald-200 rounded-xl p-6">
                <div className="flex items-center justify-center gap-3 text-emerald-700">
                  <Check className="w-6 h-6" />
                  <span className="font-semibold text-lg">
                    Successfully analyzed {totalApplications} candidates with {parsedCount} resumes processed!
                  </span>
                </div>
                <p className="text-emerald-600 mt-2">Rankings have been updated and are ready to view.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
