
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
  '/lovable-uploads/a9794164-3a51-4bae-a5df-8d262d5e3660.png', // Starry night with clouds
  '/lovable-uploads/665ad2a2-26d4-4d47-9b74-f8d9b3fbd84d.png', // Night flowers field with mountains
  '/lovable-uploads/91434aed-9d21-45c4-923f-3689199d51f7.png', // Rolling hills under stars
  '/lovable-uploads/915aed33-6e51-409b-a7af-4aa148ac3e52.png', // Ocean waves under starry sky
  '/lovable-uploads/4dc7d598-c423-4afe-bf70-dba781069f46.png', // Purple cosmos flowers at night
  '/lovable-uploads/a4a8ecfc-f0ab-4d4d-961a-12b6acefac61.png', // Wheat field under starry sky
  '/lovable-uploads/62e62011-16d7-410a-93c5-6d24e25a4e47.png', // Mountain peaks with Milky Way
  '/lovable-uploads/24a3103c-109b-4470-b73f-2e0d2e47964f.png', // Teal gradient night sky
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
