
import { useState, useEffect } from 'react';

const backgroundImages = [
  '/lovable-uploads/359cf4d3-a562-4548-8f05-42e09b703652.png', // Ocean beach
  '/lovable-uploads/9a214e87-85c9-4507-816d-1c0366a49ea8.png', // Cosmos flowers
  '/lovable-uploads/229ea90d-ee95-4ce3-81f6-b1143e5aef5e.png', // Wheat field
  '/lovable-uploads/517d2fe4-14e8-451b-b0a9-78a713a6c7a1.png', // Tropical rainforest
  '/lovable-uploads/ef411788-847f-4c6e-95a9-07da702b977f.png', // Beach waves
];

export const useRotatingBackground = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      // After 500ms (half the transition), change the image
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
        setIsTransitioning(false);
      }, 500);
    }, 120000); // 2 minutes = 120,000ms

    return () => clearInterval(interval);
  }, []);

  return {
    currentImage: backgroundImages[currentImageIndex],
    isTransitioning,
  };
};
