
import { useState, useEffect } from 'react';

export const useViewportHeight = () => {
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [headerHeight, setHeaderHeight] = useState(64); // Default header height
  const [trialBannerHeight, setTrialBannerHeight] = useState(0);
  const [sidebarHeaderHeight, setSidebarHeaderHeight] = useState(60); // Default sidebar header height

  useEffect(() => {
    const updateHeight = () => {
      setViewportHeight(window.innerHeight);
      
      // Calculate header height
      const header = document.querySelector('header') as HTMLElement;
      if (header) {
        setHeaderHeight(header.offsetHeight);
      }
      
      // Calculate trial banner height
      const trialBanner = document.querySelector('[data-trial-banner]') as HTMLElement;
      setTrialBannerHeight(trialBanner ? trialBanner.offsetHeight : 0);
      
      // Calculate sidebar header height (Scout AI title section)
      const sidebarHeader = document.querySelector('[data-sidebar="header"]') as HTMLElement;
      if (sidebarHeader) {
        setSidebarHeaderHeight(sidebarHeader.offsetHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    
    // Use ResizeObserver for more accurate updates
    const resizeObserver = new ResizeObserver(updateHeight);
    const header = document.querySelector('header') as HTMLElement;
    const trialBanner = document.querySelector('[data-trial-banner]') as HTMLElement;
    const sidebarHeader = document.querySelector('[data-sidebar="header"]') as HTMLElement;
    
    if (header) {
      resizeObserver.observe(header);
    }
    if (trialBanner) {
      resizeObserver.observe(trialBanner);
    }
    if (sidebarHeader) {
      resizeObserver.observe(sidebarHeader);
    }

    return () => {
      window.removeEventListener('resize', updateHeight);
      resizeObserver.disconnect();
    };
  }, []);

  const availableHeight = viewportHeight - headerHeight - trialBannerHeight;
  const chatAreaHeight = availableHeight - sidebarHeaderHeight - 16; // 16px for padding/margins
  
  return {
    viewportHeight,
    headerHeight,
    trialBannerHeight,
    sidebarHeaderHeight,
    availableHeight,
    chatAreaHeight
  };
};
