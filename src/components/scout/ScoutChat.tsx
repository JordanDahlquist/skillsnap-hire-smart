
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot } from 'lucide-react';
import { toast } from 'sonner';
import { ScoutMessage } from './ScoutMessage';
import { logger } from '@/services/loggerService';

interface Message {
  id: string;
  content: string;
  isAi: boolean;
  timestamp: Date;
  jobCards?: any[];
  candidateCards?: any[];
}

interface ScoutChatProps {
  conversationId: string | null;
  onConversationUpdate?: () => void;
}

export const ScoutChat = ({ conversationId, onConversationUpdate }: ScoutChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Update conversation ID when prop changes
  useEffect(() => {
    setCurrentConversationId(conversationId);
  }, [conversationId]);

  // Load conversation history when conversation changes
  useEffect(() => {
    if (currentConversationId) {
      loadConversationHistory(currentConversationId);
    } else {
      // No conversation selected, show welcome message
      setMessages([{
        id: 'welcome',
        content: "Hi! I'm Scout, your AI hiring assistant. I can help you analyze candidates, review job performance, make hiring decisions, and answer questions about your recruitment pipeline. What would you like to know?",
        isAi: true,
        timestamp: new Date(),
        jobCards: [],
        candidateCards: []
      }]);
    }
  }, [currentConversationId, user]);

  const loadConversationHistory = async (convId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('scout_conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const loadedMessages: Message[] = data?.map(msg => ({
        id: msg.id,
        content: msg.message_content,
        isAi: msg.is_ai_response,
        timestamp: new Date(msg.created_at),
        jobCards: [], // Cards will be loaded when needed
        candidateCards: []
      })) || [];

      if (loadedMessages.length === 0) {
        // New conversation, add welcome message
        setMessages([{
          id: 'welcome',
          content: "Hi! I'm Scout, your AI hiring assistant. I can help you analyze candidates, review job performance, make hiring decisions, and answer questions about your recruitment pipeline. What would you like to know?",
          isAi: true,
          timestamp: new Date(),
          jobCards: [],
          candidateCards: []
        }]);
      } else {
        setMessages(loadedMessages);
      }
    } catch (error) {
      logger.error('Failed to load conversation history', { error });
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || !user) return;

    // Create new conversation if none selected
    let activeConversationId = currentConversationId;
    if (!activeConversationId) {
      activeConversationId = crypto.randomUUID();
      setCurrentConversationId(activeConversationId);
      // Clear welcome message for new conversation
      setMessages([]);
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: inputValue,
      isAi: false,
      timestamp: new Date(),
      jobCards: [],
      candidateCards: []
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      logger.info('Sending message to Scout AI', { message: inputValue });

      const { data, error } = await supabase.functions.invoke('scout-ai-chat', {
        body: {
          message: inputValue,
          conversation_id: activeConversationId
        }
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: data.message,
        isAi: true,
        timestamp: new Date(),
        jobCards: data.jobCards || [],
        candidateCards: data.candidateCards || []
      };

      setMessages(prev => [...prev, aiMessage]);
      logger.info('Received Scout AI response', { 
        hasJobCards: data.jobCards?.length > 0,
        hasCandidateCards: data.candidateCards?.length > 0
      });

      // Update conversation list in sidebar
      if (onConversationUpdate) {
        onConversationUpdate();
      }

    } catch (error) {
      logger.error('Failed to send message to Scout AI', { error });
      toast.error('Failed to send message. Please try again.');
      
      // Remove the user message if AI response failed
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Please log in to use Scout AI.</p>
      </div>
    );
  }

  return (
    <Card className="h-full flex flex-col border-0 shadow-none">
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <ScrollArea className="flex-1 min-h-0" ref={scrollAreaRef}>
          <div className="px-6 py-4 space-y-4" ref={messagesContainerRef}>
            {messages.map((message) => (
              <ScoutMessage 
                key={message.id} 
                message={message}
              />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Bot className="w-5 h-5" />
                <span className="text-sm">Scout is thinking...</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="border-t p-4 flex-shrink-0">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Scout anything about your hiring pipeline..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={!inputValue.trim() || isLoading}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
