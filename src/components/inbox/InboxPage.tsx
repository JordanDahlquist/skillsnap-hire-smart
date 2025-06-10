
import { useState, useMemo } from "react";
import { useOptimizedAuth } from "@/hooks/useOptimizedAuth";
import { useOptimizedInboxData } from "@/hooks/useOptimizedInboxData";
import { UnifiedHeader } from "@/components/UnifiedHeader";
import { InboxContent } from "./InboxContent";
import { ThreadDetail } from "./ThreadDetail";
import { InboxSkeleton } from "./InboxSkeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FixedHeightLayout } from "@/components/layout/FixedHeightLayout";
import { useOptimizedEmailSubjects } from "@/hooks/useOptimizedEmailSubjects";

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
  } = useOptimizedInboxData();

  // Process email subjects with optimized caching
  const { processedThreads, isProcessing } = useOptimizedEmailSubjects(threads);

  // Memoize filtered messages to prevent unnecessary recalculations
  const threadMessages = useMemo(() => {
    return selectedThreadId 
      ? messages.filter(msg => msg.thread_id === selectedThreadId)
      : [];
  }, [messages, selectedThreadId]);

  // Memoize selected thread to prevent unnecessary recalculations
  const selectedThread = useMemo(() => {
    return selectedThreadId 
      ? processedThreads.find(thread => thread.id === selectedThreadId) || null
      : null;
  }, [processedThreads, selectedThreadId]);

  if (isLoading || isProcessing) {
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

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background flex flex-col">
        <UnifiedHeader 
          breadcrumbs={breadcrumbs}
          showCreateButton={false}
        />

        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
          <FixedHeightLayout>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              {/* Thread List - Independent Scrolling */}
              <div className="lg:col-span-1 h-full">
                <InboxContent
                  threads={processedThreads}
                  selectedThreadId={selectedThreadId}
                  onSelectThread={setSelectedThreadId}
                  onMarkAsRead={markThreadAsRead}
                  onRefresh={refetchThreads}
                />
              </div>

              {/* Thread Detail - Independent Scrolling */}
              <div className="lg:col-span-2 h-full">
                <ThreadDetail
                  thread={selectedThread}
                  messages={threadMessages}
                  onSendReply={sendReply}
                  onMarkAsRead={markThreadAsRead}
                />
              </div>
            </div>
          </FixedHeightLayout>
        </div>
      </div>
    </ErrorBoundary>
  );
};
