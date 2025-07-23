
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PulsingDot } from '@/components/ui/pulsing-dot';
import { cn } from '@/lib/utils';

interface InboxNotificationBadgeProps {
  count: number;
  className?: string;
}

export const InboxNotificationBadge = ({ count, className }: InboxNotificationBadgeProps) => {
  // Don't render if no unread emails
  if (count === 0) {
    return null;
  }

  // Format count for display (show 99+ for large numbers)
  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <div className={cn("relative inline-flex", className)}>
      <Badge 
        variant="secondary" 
        className="bg-[#007af6] text-white hover:bg-[#007af6]/90 min-w-[20px] h-5 px-1.5 py-0 text-xs font-medium rounded-full flex items-center justify-center animate-pulse"
      >
        {displayCount}
      </Badge>
      <PulsingDot className="absolute -top-1 -right-1 w-2 h-2 bg-[#007af6] rounded-full animate-pulse" />
    </div>
  );
};
