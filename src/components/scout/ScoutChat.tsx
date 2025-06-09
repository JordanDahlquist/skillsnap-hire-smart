
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User } from 'lucide-react';
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

export const ScoutChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId] = useState(() => crypto.randomUUID());
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversation history on mount
  useEffect(() => {
    loadConversationHistory();
  }, [conversationId]);

  const loadConversationHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('scout_conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('conversation_id', conversationId)
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

      setMessages(loadedMessages);
      
      // Add welcome message if no conversation history
      if (loadedMessages.length === 0) {
        setMessages([{
          id: 'welcome',
          content: "Hi! I'm Scout, your AI hiring assistant. I can help you analyze candidates, review job performance, make hiring decisions, and answer questions about your recruitment pipeline. What would you like to know?",
          isAi: true,
          timestamp: new Date(),
          jobCards: [],
          candidateCards: []
        }]);
      }
    } catch (error) {
      logger.error('Failed to load conversation history', { error });
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || !user) return;

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
          conversation_id: conversationId
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
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to use Scout AI.</p>
      </div>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Scout AI</h2>
          <span className="text-sm text-gray-500">Your Hiring Assistant</span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <ScoutMessage 
                key={message.id} 
                message={message}
              />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-500">
                <Bot className="w-5 h-5" />
                <span className="text-sm">Scout is thinking...</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="border-t p-4">
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
