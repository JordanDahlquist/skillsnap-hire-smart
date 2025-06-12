
import { Bot, User, Sparkles } from 'lucide-react';
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
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6" ref={messagesContainerRef}>
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <div className="glass-card p-8 max-w-md">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center mx-auto mb-6">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                Welcome to Scout AI
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Your intelligent hiring assistant is ready to help. Ask me anything about your hiring pipeline, candidates, or recruitment strategies.
              </p>
              <div className="flex items-center justify-center gap-2 mt-4 text-blue-500">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Powered by AI</span>
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-4 ${message.isAi ? '' : 'flex-row-reverse'}`}>
            {/* Avatar with Glass Effect */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center glass-card-no-hover ${
              message.isAi 
                ? 'bg-gradient-to-r from-blue-400 to-purple-400' 
                : 'bg-gradient-to-r from-gray-400 to-gray-500'
            }`}>
              {message.isAi ? <Bot className="w-6 h-6 text-white" /> : <User className="w-6 h-6 text-white" />}
            </div>
            
            {/* Message Content with Glass Bubble */}
            <div className={`flex-1 min-w-0 max-w-[80%] ${message.isAi ? '' : 'flex flex-col items-end'}`}>
              <div className="mb-2">
                <span className="text-sm font-semibold text-foreground">
                  {message.isAi ? 'Scout AI' : 'You'}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  {formatTime(message.timestamp)}
                </span>
              </div>
              
              <div className={`glass-card p-4 ${message.isAi ? 'bg-white/70' : 'bg-gradient-to-r from-blue-500/90 to-purple-500/90'}`}>
                <div className={`prose prose-sm max-w-none ${message.isAi ? 'text-foreground' : 'text-white'}`}>
                  {message.isAi ? (
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: parseMarkdown(message.content) 
                      }}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  )}
                </div>
              </div>
              
              {/* Job Cards with Glass Styling */}
              {message.jobCards && message.jobCards.length > 0 && (
                <div className="mt-4 space-y-3 w-full">
                  {message.jobCards.map((job) => (
                    <div key={job.id} className="glass-card hover:scale-[1.02] transition-all duration-300">
                      <ScoutJobCard job={job} />
                    </div>
                  ))}
                </div>
              )}
              
              {/* Candidate Cards with Glass Styling */}
              {message.candidateCards && message.candidateCards.length > 0 && (
                <div className="mt-4 space-y-3 w-full">
                  {message.candidateCards.map((candidate) => (
                    <div key={candidate.id} className="glass-card hover:scale-[1.02] transition-all duration-300">
                      <ScoutCandidateCard candidate={candidate} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center glass-card-no-hover">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="mb-2">
                <span className="text-sm font-semibold text-foreground">Scout AI</span>
              </div>
              <div className="glass-card p-4 bg-white/70">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">Thinking...</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
