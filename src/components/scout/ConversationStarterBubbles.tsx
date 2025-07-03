
import { useEffect, useState } from 'react';
import { AnimatedBubble } from './AnimatedBubble';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Star, 
  TrendingUp, 
  Users, 
  Clock, 
  Target,
  BarChart3,
  Search,
  Zap
} from 'lucide-react';

interface ConversationStarterBubblesProps {
  onSendMessage: (message: string) => void;
}

interface JobData {
  id: string;
  title: string;
  applications: any[];
}

export const ConversationStarterBubbles = ({ onSendMessage }: ConversationStarterBubblesProps) => {
  const { user } = useAuth();
  const [jobsData, setJobsData] = useState<JobData[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchJobsData = async () => {
      if (!user) return;

      try {
        const { data: jobs } = await supabase
          .from('jobs')
          .select(`
            id,
            title,
            applications(count)
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .limit(3);

        if (jobs) {
          setJobsData(jobs);
        }
      } catch (error) {
        console.log('Error fetching jobs data:', error);
      }
    };

    fetchJobsData();
  }, [user]);

  const handleBubbleClick = (message: string) => {
    setIsVisible(false);
    setTimeout(() => {
      onSendMessage(message);
    }, 200);
  };

  const getContextualStarters = () => {
    const starters = [];

    // Dynamic job-specific starters
    if (jobsData.length > 0) {
      const topJob = jobsData[0];
      starters.push({
        text: `Top candidates for ${topJob.title}`,
        icon: <Star className="w-4 h-4" />,
        message: `Show me the top candidates for ${topJob.title}`,
        size: 'md' as const
      });

      if (jobsData.length > 1) {
        starters.push({
          text: `Compare candidates across jobs`,
          icon: <Users className="w-4 h-4" />,
          message: `Compare the best candidates across all my active job postings`,
          size: 'md' as const
        });
      }
    }

    // Core helpful starters
    const coreStarters = [
      {
        text: "Pipeline summary",
        icon: <BarChart3 className="w-4 h-4" />,
        message: "Give me a comprehensive summary of my current hiring pipeline with key metrics and insights",
        size: 'sm' as const
      },
      {
        text: "Candidates needing review",
        icon: <Clock className="w-4 h-4" />,
        message: "Show me all candidates that are pending review and need my attention",
        size: 'sm' as const
      },
      {
        text: "Find specific skills",
        icon: <Search className="w-4 h-4" />,
        message: "Help me find candidates with specific technical skills or experience",
        size: 'sm' as const
      },
      {
        text: "Hiring improvements",
        icon: <TrendingUp className="w-4 h-4" />,
        message: "Analyze my hiring process and suggest improvements to attract better candidates",
        size: 'sm' as const
      }
    ];

    // Combine and limit
    const allStarters = [...starters, ...coreStarters].slice(0, 8);
    return allStarters;
  };

  if (!isVisible) {
    return null;
  }

  const starters = getContextualStarters();

  return (
    <div className="flex flex-col h-full justify-center px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Hi there! 👋 I'm Scout AI
        </h2>
        <p className="text-gray-600 max-w-lg mx-auto leading-relaxed">
          Your intelligent hiring assistant. Click any suggestion below to get started, or ask me anything about your candidates and jobs.
        </p>
      </div>

      {/* Starter Buttons */}
      <div className="max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {starters.map((starter, index) => (
            <AnimatedBubble
              key={index}
              text={starter.text}
              delay={index + 1}
              onClick={() => handleBubbleClick(starter.message)}
              icon={starter.icon}
              size={starter.size}
            />
          ))}
        </div>
      </div>

      {/* Bottom hint */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Or type your own question below ↓
        </p>
      </div>
    </div>
  );
};
