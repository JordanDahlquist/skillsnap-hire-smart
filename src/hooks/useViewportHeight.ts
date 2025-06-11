
import { useState, useEffect } from 'react';

export const useViewportHeight = () => {
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [headerHeight, setHeaderHeight] = useState(64); // Default header height
  const [trialBannerHeight, setTrialBannerHeight] = useState(0);

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
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    
    // Use ResizeObserver for more accurate updates
    const resizeObserver = new ResizeObserver(updateHeight);
    const header = document.querySelector('header');
    if (header) {
      resizeObserver.observe(header);
    }

    return () => {
      window.removeEventListener('resize', updateHeight);
      resizeObserver.disconnect();
    };
  }, []);

  const availableHeight = viewportHeight - headerHeight - trialBannerHeight;
  
  return {
    viewportHeight,
    headerHeight,
    trialBannerHeight,
    availableHeight
  };
};
