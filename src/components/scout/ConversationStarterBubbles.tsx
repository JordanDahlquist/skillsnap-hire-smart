
import { useEffect, useState } from 'react';
import { AnimatedBubble } from './AnimatedBubble';
import { ScoutVideoCharacter } from './ScoutVideoCharacter';
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

    // First starter - always the same generic question
    starters.push({
      text: "Help me find the best candidate option for a specific role.",
      icon: <Star className="w-4 h-4" />,
      message: "Help me find the best candidate option for a specific role. I'd like to identify top candidates based on their qualifications and fit.",
      size: 'md' as const
    });

    // Dynamic job-specific starters if user has multiple jobs
    if (jobsData.length > 1) {
      starters.push({
        text: `Can you help me compare candidates across all my active job postings?`,
        icon: <Users className="w-4 h-4" />,
        message: `Compare the best candidates across all my active job postings and help me identify the strongest ones`,
        size: 'md' as const
      });
    }

    // Core helpful starters with natural questions
    const coreStarters = [
      {
        text: "What's the current status of my hiring pipeline?",
        icon: <BarChart3 className="w-4 h-4" />,
        message: "Give me a comprehensive summary of my current hiring pipeline with key metrics and insights",
        size: 'md' as const
      },
      {
        text: "Which candidates have been waiting for my review the longest?",
        icon: <Clock className="w-4 h-4" />,
        message: "Show me all candidates that are pending review and need my attention, prioritized by how long they've been waiting",
        size: 'md' as const
      },
      {
        text: "Can you help me find candidates with specific technical skills?",
        icon: <Search className="w-4 h-4" />,
        message: "Help me find candidates with specific technical skills or experience from my current applicant pool",
        size: 'md' as const
      },
      {
        text: "What improvements can I make to attract better candidates?",
        icon: <TrendingUp className="w-4 h-4" />,
        message: "Analyze my hiring process and job postings, then suggest improvements to attract higher quality candidates",
        size: 'md' as const
      },
      {
        text: "Who are my most promising candidates that I should fast-track?",
        icon: <Zap className="w-4 h-4" />,
        message: "Identify the most promising candidates across all my jobs who should be fast-tracked through the hiring process",
        size: 'md' as const
      }
    ];

    // Combine and limit
    const allStarters = [...starters, ...coreStarters].slice(0, 6);
    return allStarters;
  };

  if (!isVisible) {
    return null;
  }

  const starters = getContextualStarters();

  return (
    <div className="flex flex-col h-full justify-center px-6 py-8 bg-white">
      {/* Animated Character */}
      <ScoutVideoCharacter />
      
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Hi there! 👋 I'm Scout AI
        </h2>
        <p className="text-gray-600 max-w-lg mx-auto leading-relaxed">
          Your intelligent hiring assistant. Click any question below to get started, or ask me anything about your candidates and jobs.
        </p>
      </div>

      {/* Starter Questions - Vertical Layout */}
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex flex-col space-y-3 mb-8">
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
