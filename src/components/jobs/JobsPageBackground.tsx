
import { memo, ReactNode } from "react";
import { useRotatingBackground } from "@/hooks/useRotatingBackground";
import { useThemeContext } from "@/contexts/ThemeContext";

interface JobsPageBackgroundProps {
  children: ReactNode;
}

export const JobsPageBackground = memo(({ children }: JobsPageBackgroundProps) => {
  const { currentImage, nextImage, isTransitioning, showSecondary } = useRotatingBackground();
  const { currentTheme } = useThemeContext();

  // Check if this is a solid color theme
  const isSolidColorTheme = currentTheme === 'white' || currentTheme === 'black';

  if (isSolidColorTheme) {
    // For solid color themes, just use a simple background
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  // Generate CSS class names for crossfade background
  const backgroundClass = `dashboard-crossfade-background ${
    isTransitioning ? 'transitioning' : ''
  } ${showSecondary ? 'show-secondary' : ''}`;

  return (
    <div 
      className={backgroundClass}
      style={{
        '--bg-primary': `url(${currentImage})`,
        '--bg-secondary': `url(${nextImage})`
      } as React.CSSProperties & { '--bg-primary': string; '--bg-secondary': string }}
    >
      <style>
        {`.dashboard-crossfade-background::before { background-image: var(--bg-primary); }`}
        {`.dashboard-crossfade-background::after { background-image: var(--bg-secondary); }`}
      </style>

      {/* Ambient Background Effects - Only show in light mode */}
      {currentTheme === 'light' && (
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-teal-300/5 to-cyan-300/5 rounded-full blur-3xl"></div>
        </div>
      )}

      {/* Dark mode overlay - Only show in dark mode */}
      {currentTheme === 'dark' && (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20"></div>
        </div>
      )}

      {/* Content Layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
});

JobsPageBackground.displayName = 'JobsPageBackground';
