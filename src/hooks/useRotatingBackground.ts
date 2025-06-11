
import { useState, useEffect } from 'react';
import { useThemeContext } from '@/contexts/ThemeContext';

const lightModeBackgrounds = [
  '/lovable-uploads/359cf4d3-a562-4548-8f05-42e09b703652.png', // Ocean beach
  '/lovable-uploads/9a214e87-85c9-4507-816d-1c0366a49ea8.png', // Cosmos flowers
  '/lovable-uploads/229ea90d-ee95-4ce3-81f6-b1143e5aef5e.png', // Wheat field
  '/lovable-uploads/517d2fe4-14e8-451b-b0a9-78a713a6c7a1.png', // Tropical rainforest
  '/lovable-uploads/ef411788-847f-4c6e-95a9-07da702b977f.png', // Beach waves
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

export const useRotatingBackground = () => {
  const { currentTheme } = useThemeContext();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      // After 1.5 seconds (half of the 3-second transition), change the image
      setTimeout(() => {
        const backgroundArray = currentTheme === 'dark' ? darkModeBackgrounds : lightModeBackgrounds;
        setCurrentImageIndex((prev) => (prev + 1) % backgroundArray.length);
        setIsTransitioning(false);
      }, 1500);
    }, 120000); // 2 minutes = 120,000ms

    return () => clearInterval(interval);
  }, [currentTheme]);

  // Return the appropriate background based on theme
  const backgroundArray = currentTheme === 'dark' ? darkModeBackgrounds : lightModeBackgrounds;
  const currentImage = backgroundArray[currentImageIndex];

  return {
    currentImage,
    isTransitioning,
  };
};
