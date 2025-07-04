
import { useThemeContext } from '@/contexts/ThemeContext';

export const useRotatingBackground = () => {
  const { currentTheme } = useThemeContext();

  // Always return solid colors - no more image backgrounds or rotation
  const solidColor = currentTheme === 'black' ? '#000000' : '#ffffff';
  
  return {
    currentImage: solidColor,
    nextImage: solidColor,
    isTransitioning: false,
    showSecondary: false,
  };
};
