
import { Bot, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
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

interface MessagesListProps {
  messages: Message[];
  isLoading: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
}

export const MessagesList = ({ 
  messages, 
  isLoading, 
  scrollAreaRef, 
  messagesContainerRef 
}: MessagesListProps) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <ScrollArea className="h-full" ref={scrollAreaRef}>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6" ref={messagesContainerRef}>
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium text-foreground mb-2">
              Welcome to Scout AI
            </h3>
            <p className="text-muted-foreground max-w-md">
              Your intelligent hiring assistant is ready to help. Ask me anything about your hiring pipeline, candidates, or recruitment strategies.
            </p>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className="flex gap-4">
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              message.isAi ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              {message.isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            
            {/* Message Content */}
            <div className="flex-1 min-w-0">
              <div className="mb-1">
                <span className="text-sm font-medium text-foreground">
                  {message.isAi ? 'Scout AI' : 'You'}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  {formatTime(message.timestamp)}
                </span>
              </div>
              
              <div className="prose prose-sm max-w-none text-foreground">
                {message.isAi ? (
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: parseMarkdown(message.content) 
                    }}
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
              
              {/* Job Cards */}
              {message.jobCards && message.jobCards.length > 0 && (
                <div className="mt-4 space-y-2">
                  {message.jobCards.map((job) => (
                    <ScoutJobCard key={job.id} job={job} />
                  ))}
                </div>
              )}
              
              {/* Candidate Cards */}
              {message.candidateCards && message.candidateCards.length > 0 && (
                <div className="mt-4 space-y-2">
                  {message.candidateCards.map((candidate) => (
                    <ScoutCandidateCard key={candidate.id} candidate={candidate} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="mb-1">
                <span className="text-sm font-medium text-foreground">Scout AI</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-sm">Thinking...</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
