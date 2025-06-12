
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { ConversationSidebar } from './ConversationSidebar';
import { MainChatArea } from './MainChatArea';
import { useViewportHeight } from '@/hooks/useViewportHeight';

interface NewChatLayoutProps {
  activeConversationId: string | null;
  onConversationSelect: (conversationId: string) => void;
  onNewConversation: () => void;
}

export const NewChatLayout = ({
  activeConversationId,
  onConversationSelect,
  onNewConversation
}: NewChatLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { availableHeight } = useViewportHeight();

  return (
    <div 
      className="flex w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden"
      style={{ height: `${availableHeight}px` }}
    >
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar with Glass Effect */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-80 
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full glass-card-no-hover border-r-0 rounded-l-none rounded-r-3xl lg:rounded-r-none lg:border-r">
          <ConversationSidebar
            activeConversationId={activeConversationId}
            onConversationSelect={onConversationSelect}
            onNewConversation={onNewConversation}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>
      </div>
      
      {/* Main Chat Area with Glass Background */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile Header with Glass Effect */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between p-4 glass-card-no-hover rounded-none border-x-0 border-t-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="glass-button p-2 rounded-xl hover:scale-105 transition-all duration-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-medium text-foreground">Scout AI</h1>
            <div className="w-9" />
          </div>
        </div>
        
        <MainChatArea conversationId={activeConversationId} />
      </div>
    </div>
  );
};
