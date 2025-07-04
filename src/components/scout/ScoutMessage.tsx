
import { Bot, User } from 'lucide-react';
import { ScoutJobCard } from './ScoutJobCard';
import { ScoutCandidateCard } from './ScoutCandidateCard';
import { parseMarkdown } from '@/utils/markdownParser';

interface Message {
  id: string;
  content: string;
  isAi: boolean;
  timestamp: Date;
  jobCards?: any[];
  candidateCards?: any[];
}

interface ScoutMessageProps {
  message: Message;
}

export const ScoutMessage = ({ message }: ScoutMessageProps) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Parse markdown content to HTML for AI messages
  const messageContent = message.isAi 
    ? parseMarkdown(message.content)
    : message.content;

  return (
    <div className={`flex gap-3 ${message.isAi ? 'flex-row' : 'flex-row-reverse'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        message.isAi ? 'bg-blue-100 text-blue-600' : 'bg-muted text-muted-foreground'
      }`}>
        {message.isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>
      
      <div className={`flex-1 max-w-[80%] ${message.isAi ? 'text-left' : 'text-right'}`}>
        <div className={`inline-block p-3 rounded-lg ${
          message.isAi 
            ? 'bg-card border border-border text-foreground' 
            : 'bg-blue-600 text-white'
        }`}>
          {message.isAi ? (
            <div 
              className="text-sm leading-relaxed prose prose-sm max-w-none prose-headings:mt-2 prose-headings:mb-1 prose-p:mb-2 prose-ul:mb-2 prose-ol:mb-2"
              dangerouslySetInnerHTML={{ __html: messageContent }}
            />
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
        
        {/* Job Cards */}
        {message.jobCards && message.jobCards.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.jobCards.map((job) => (
              <ScoutJobCard key={job.id} job={job} />
            ))}
          </div>
        )}
        
        {/* Candidate Cards */}
        {message.candidateCards && message.candidateCards.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.candidateCards.map((candidate) => (
              <ScoutCandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </div>
        )}
        
        <p className={`text-xs mt-1 ${
          message.isAi ? 'text-muted-foreground' : 'text-blue-200'
        }`}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
};
