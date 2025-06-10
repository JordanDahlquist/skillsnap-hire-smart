
import React from 'react';
import { cn } from '@/lib/utils';

interface ModernInboxLayoutProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  className?: string;
}

export const ModernInboxLayout = ({ sidebar, main, className }: ModernInboxLayoutProps) => {
  return (
    <div className={cn("flex h-full bg-background", className)}>
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-background flex-shrink-0">
        {sidebar}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {main}
      </div>
    </div>
  );
};
