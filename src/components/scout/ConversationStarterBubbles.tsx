
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
    }, 300);
  };

  const getContextualStarters = () => {
    const starters = [];

    // Dynamic job-specific starters
    if (jobsData.length > 0) {
      const topJob = jobsData[0];
      starters.push({
        text: `Show me top candidates for ${topJob.title}`,
        icon: <Star className="w-4 h-4" />,
        message: `Show me the top candidates for ${topJob.title}`
      });

      if (jobsData.length > 1) {
        starters.push({
          text: `Compare candidates across my active jobs`,
          icon: <Users className="w-4 h-4" />,
          message: `Compare the best candidates across all my active job postings`
        });
      }
    }

    // Generic but useful starters
    const genericStarters = [
      {
        text: "Give me a hiring pipeline summary",
        icon: <BarChart3 className="w-4 h-4" />,
        message: "Give me a comprehensive summary of my current hiring pipeline with key metrics and insights"
      },
      {
        text: "Which candidates need my review?",
        icon: <Clock className="w-4 h-4" />,
        message: "Show me all candidates that are pending review and need my attention"
      },
      {
        text: "Find candidates with specific skills",
        icon: <Search className="w-4 h-4" />,
        message: "Help me find candidates with specific technical skills or experience"
      },
      {
        text: "Suggest hiring improvements",
        icon: <TrendingUp className="w-4 h-4" />,
        message: "Analyze my hiring process and suggest improvements to attract better candidates"
      },
      {
        text: "Quick wins for this week",
        icon: <Zap className="w-4 h-4" />,
        message: "What are the quick wins I can achieve in my hiring process this week?"
      }
    ];

    // Combine and limit to 5-6 total
    const allStarters = [...starters, ...genericStarters].slice(0, 6);
    return allStarters;
  };

  if (!isVisible) {
    return null;
  }

  const starters = getContextualStarters();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
          Hi there! 👋 I'm Scout AI
        </h3>
        <p className="text-gray-600 max-w-md">
          Your intelligent hiring assistant. Click any bubble below to get started, or ask me anything about your candidates and jobs.
        </p>
      </div>

      {/* Bubbles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
        {starters.map((starter, index) => (
          <AnimatedBubble
            key={index}
            text={starter.text}
            delay={index + 1}
            onClick={() => handleBubbleClick(starter.message)}
            icon={starter.icon}
            size={index < 2 ? 'md' : 'sm'}
          />
        ))}
      </div>

      {/* Subtle hint */}
      <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '2s' }}>
        <p className="text-sm text-gray-500">
          Or type your own question below ↓
        </p>
      </div>
    </div>
  );
};
