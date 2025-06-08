
import { useState } from "react";
import { useOptimizedAuth } from "@/hooks/useOptimizedAuth";
import { useInboxData } from "@/hooks/useInboxData";
import { UnifiedHeader } from "@/components/UnifiedHeader";
import { InboxContent } from "./InboxContent";
import { ThreadDetail } from "./ThreadDetail";
import { InboxSkeleton } from "./InboxSkeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const InboxPage = () => {
  const { user } = useOptimizedAuth();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const { 
    threads, 
    messages, 
    isLoading, 
    error, 
    refetchThreads, 
    markThreadAsRead,
    sendReply
  } = useInboxData();

  if (isLoading) {
    return <InboxSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Inbox</h1>
          <p className="text-gray-600 mb-4">Failed to load your messages.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/jobs" },
    { label: "Inbox", isCurrentPage: true },
  ];

  const selectedThread = selectedThreadId 
    ? threads.find(thread => thread.id === selectedThreadId) 
    : null;

  const threadMessages = selectedThreadId 
    ? messages.filter(msg => msg.thread_id === selectedThreadId)
    : [];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <UnifiedHeader 
          breadcrumbs={breadcrumbs}
          showCreateButton={false}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Thread List */}
            <div className="lg:col-span-1">
              <InboxContent
                threads={threads}
                selectedThreadId={selectedThreadId}
                onSelectThread={setSelectedThreadId}
                onMarkAsRead={markThreadAsRead}
                onRefresh={refetchThreads}
              />
            </div>

            {/* Thread Detail */}
            <div className="lg:col-span-2">
              <ThreadDetail
                thread={selectedThread}
                messages={threadMessages}
                onSendReply={sendReply}
                onMarkAsRead={markThreadAsRead}
              />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};
