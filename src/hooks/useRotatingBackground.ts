
import { useState, useEffect, useRef } from 'react';
import { useThemeContext } from '@/contexts/ThemeContext';

const lightModeBackgrounds = [
  '/lovable-uploads/98c7cfbe-64cc-429d-938f-402000e7cdf2.png', // Beach with sand patterns
  '/lovable-uploads/bb4da3b1-d19d-4ce4-b115-a9d2c1500738.png', // Rolling hills landscape
  '/lovable-uploads/0424f7ba-2b5d-4a20-b078-0a6dbbb657f0.png', // Mountain wildflower meadow
  '/lovable-uploads/933adeae-91a6-4c99-b2f6-5fe3fe28136e.png', // Golden hour field
  '/lovable-uploads/78ea977a-e7d4-45c6-8eac-2c949f778c87.png', // Sky and clouds
  '/lovable-uploads/42e601b9-445d-4059-bf73-0baa9749d9d2.png', // Wheat field
  '/lovable-uploads/ce9ad6fb-9b5f-432b-9d79-0a3455cedc24.png', // Cosmos flowers
];

const darkModeBackgrounds = [
  '/lovable-uploads/23d28cb2-7c51-4163-b662-b7e8ab37fe3a.png', // Starry night with clouds
  '/lovable-uploads/f31dd49f-4320-4158-ae1a-798a8228e710.png', // Night flowers field with mountains
  '/lovable-uploads/88c539ee-2eca-4ed6-aa22-eff1b249cd28.png', // Rolling hills under stars
  '/lovable-uploads/0a14a67e-fdc4-4349-9bd3-dcdb7846e547.png', // Ocean waves under starry sky
  '/lovable-uploads/709e62f6-6954-46ad-bfcf-99596ba43e7c.png', // Purple cosmos flowers at night
  '/lovable-uploads/a3f6d4c4-b1e7-4d4f-bbea-9e99b5a67d4b.png', // Wheat field under starry sky
  '/lovable-uploads/2bee2e19-d279-41ab-8dd2-375b2ae62ffc.png', // Mountain peaks with Milky Way
  '/lovable-uploads/f1d65efc-b1d6-49f7-9e12-b1e70373d211.png', // Teal gradient night sky
];

const getRandomIndex = (arrayLength: number) => {
  return Math.floor(Math.random() * arrayLength);
};

const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

export const useRotatingBackground = () => {
  const { currentTheme } = useThemeContext();
  
  // Check if theme uses solid colors (no image backgrounds)
  const isSolidColorTheme = currentTheme === 'white' || currentTheme === 'black';
  
  // Initialize with a random index based on current theme
  const [currentImageIndex, setCurrentImageIndex] = useState(() => {
    if (isSolidColorTheme) return 0; // Index doesn't matter for solid themes
    const backgroundArray = currentTheme === 'dark' ? darkModeBackgrounds : lightModeBackgrounds;
    const randomIndex = getRandomIndex(backgroundArray.length);
    console.log(`[Background Rotation] Starting with random image ${randomIndex + 1}/${backgroundArray.length} (${currentTheme} mode)`);
    return randomIndex;
  });
  
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSecondary, setShowSecondary] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle theme changes - start with random image for new theme
  useEffect(() => {
    console.log(`[Background Rotation] Theme changed to: ${currentTheme}`);
    
    if (isSolidColorTheme) {
      // For solid color themes, disable rotation
      setIsTransitioning(false);
      setShowSecondary(false);
      console.log(`[Background Rotation] Using solid color theme: ${currentTheme}`);
      return;
    }
    
    const backgroundArray = currentTheme === 'dark' ? darkModeBackgrounds : lightModeBackgrounds;
    const randomIndex = getRandomIndex(backgroundArray.length);
    setCurrentImageIndex(randomIndex);
    setIsTransitioning(false);
    setShowSecondary(false);
    console.log(`[Background Rotation] Theme change: starting with random image ${randomIndex + 1}/${backgroundArray.length} (${currentTheme} mode)`);
  }, [currentTheme, isSolidColorTheme]);

  // Main rotation effect - runs independently of theme changes, but disabled for solid themes
  useEffect(() => {
    if (isSolidColorTheme) {
      console.log(`[Background Rotation] Skipping rotation for solid color theme: ${currentTheme}`);
      return;
    }
    
    console.log('[Background Rotation] Starting rotation timer');
    
    const interval = setInterval(async () => {
      console.log('[Background Rotation] Starting transition...');
      
      const backgroundArray = currentTheme === 'dark' ? darkModeBackgrounds : lightModeBackgrounds;
      const nextIndex = (currentImageIndex + 1) % backgroundArray.length;
      const nextImage = backgroundArray[nextIndex];
      
      try {
        // Preload the next image
        await preloadImage(nextImage);
        console.log(`[Background Rotation] Next image preloaded: ${nextIndex + 1}/${backgroundArray.length}`);
        
        // Start crossfade transition
        setIsTransitioning(true);
        
        // Clear any existing timeout
        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current);
        }
        
        // After 1.5 seconds, switch to the next image and complete transition
        transitionTimeoutRef.current = setTimeout(() => {
          setCurrentImageIndex(nextIndex);
          setShowSecondary(!showSecondary);
          setIsTransitioning(false);
          console.log(`[Background Rotation] Crossfade completed to image ${nextIndex + 1}/${backgroundArray.length} (${currentTheme} mode)`);
        }, 1500);
        
      } catch (error) {
        console.error('[Background Rotation] Failed to preload next image:', error);
        // Fallback to direct switch if preloading fails
        setCurrentImageIndex(nextIndex);
        setIsTransitioning(false);
      }
    }, 120000); // 2 minutes = 120,000ms

    return () => {
      console.log('[Background Rotation] Clearing rotation timer');
      clearInterval(interval);
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [currentImageIndex, currentTheme, showSecondary, isSolidColorTheme]);

  // Return solid colors for white/black themes, images for light/dark themes
  if (isSolidColorTheme) {
    const solidColor = currentTheme === 'white' ? '#ffffff' : '#000000';
    return {
      currentImage: solidColor,
      nextImage: solidColor,
      isTransitioning: false,
      showSecondary: false,
    };
  }

  // Return the appropriate background based on theme
  const backgroundArray = currentTheme === 'dark' ? darkModeBackgrounds : lightModeBackgrounds;
  const currentImage = backgroundArray[currentImageIndex];
  const nextImage = backgroundArray[(currentImageIndex + 1) % backgroundArray.length];

  console.log(`[Background Rotation] Current: ${currentTheme} mode, image ${currentImageIndex + 1}/${backgroundArray.length}, transitioning: ${isTransitioning}, showSecondary: ${showSecondary}`);

  return {
    currentImage,
    nextImage,
    isTransitioning,
    showSecondary,
  };
};
