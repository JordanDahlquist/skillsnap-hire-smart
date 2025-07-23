
import React from 'react';
import { cn } from '@/lib/utils';

interface PulsingDotProps {
  className?: string;
}

export const PulsingDot = ({ className }: PulsingDotProps) => {
  return (
    <div 
      className={cn(
        "absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse",
        className
      )}
    />
  );
};
