
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Bug } from 'lucide-react';
import { InboxContent } from './InboxContent';
import { EmailDebugDashboard } from './EmailDebugDashboard';
import { useOptimizedInboxData } from '@/hooks/useOptimizedInboxData';

export const InboxPage = () => {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  
  const {
    threads,
    messages,
    isLoading,
    error,
    refetchThreads,
    markThreadAsRead,
    sendReply,
    isAutoRefreshEnabled,
    toggleAutoRefresh,
    lastRefreshTime,
    isAutoRefreshing,
    isTabVisible,
  } = useOptimizedInboxData();

  const handleSelectThread = (threadId: string) => {
    setSelectedThreadId(threadId);
  };

  const handleMarkAsRead = (threadId: string) => {
    markThreadAsRead(threadId);
  };

  const handleRefresh = () => {
    refetchThreads();
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Inbox</h1>
        <p className="text-muted-foreground">
          Send and receive emails with your candidates
        </p>
      </div>

      <Tabs defaultValue="inbox" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Inbox
          </TabsTrigger>
          <TabsTrigger value="debug" className="flex items-center gap-2">
            <Bug className="w-4 h-4" />
            Debug
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox">
          <InboxContent
            threads={threads}
            selectedThreadId={selectedThreadId}
            onSelectThread={handleSelectThread}
            onMarkAsRead={handleMarkAsRead}
            onRefresh={handleRefresh}
            isAutoRefreshEnabled={isAutoRefreshEnabled}
            toggleAutoRefresh={toggleAutoRefresh}
            lastRefreshTime={lastRefreshTime}
            isAutoRefreshing={isAutoRefreshing}
            isTabVisible={isTabVisible}
          />
        </TabsContent>

        <TabsContent value="debug">
          <EmailDebugDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};
