
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
      className="flex w-full bg-white"
      style={{ height: `${availableHeight}px` }}
    >
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-gray-50 border-r border-gray-200
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <ConversationSidebar
          activeConversationId={activeConversationId}
          onConversationSelect={onConversationSelect}
          onNewConversation={onNewConversation}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-medium text-gray-900">Scout AI</h1>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>
        
        <MainChatArea conversationId={activeConversationId} />
      </div>
    </div>
  );
};
