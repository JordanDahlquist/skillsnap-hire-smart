
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface FixedHeightLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const FixedHeightLayout = ({ children, className }: FixedHeightLayoutProps) => {
  const [availableHeight, setAvailableHeight] = useState<number>(0);

  useEffect(() => {
    const calculateHeight = () => {
      // Calculate header height (including trial banner if present)
      const header = document.querySelector('header') as HTMLElement;
      const trialBanner = document.querySelector('[class*="trial-banner"], [class*="TrialBanner"]') as HTMLElement;
      const footer = document.querySelector('footer') as HTMLElement;
      
      const headerHeight = header?.offsetHeight || 64;
      const trialBannerHeight = trialBanner?.offsetHeight || 0;
      const footerHeight = footer?.offsetHeight || 60;
      
      const totalFixedHeight = headerHeight + trialBannerHeight + footerHeight;
      const viewportHeight = window.innerHeight;
      const available = Math.max(400, viewportHeight - totalFixedHeight - 32); // 32px for padding
      
      setAvailableHeight(available);
    };

    // Calculate on mount and resize
    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    
    // Also watch for DOM changes that might affect header/footer height
    const observer = new MutationObserver(calculateHeight);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true, 
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    return () => {
      window.removeEventListener('resize', calculateHeight);
      observer.disconnect();
    };
  }, []);

  return (
    <div 
      className={cn("w-full", className)}
      style={{ height: availableHeight > 0 ? `${availableHeight}px` : 'auto' }}
    >
      {children}
    </div>
  );
};
