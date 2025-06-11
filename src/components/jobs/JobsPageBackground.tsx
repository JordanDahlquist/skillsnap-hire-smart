
import { memo, ReactNode } from "react";
import { useRotatingBackground } from "@/hooks/useRotatingBackground";
import { useThemeContext } from "@/contexts/ThemeContext";

interface JobsPageBackgroundProps {
  children: ReactNode;
}

export const JobsPageBackground = memo(({ children }: JobsPageBackgroundProps) => {
  const { currentImage, isTransitioning } = useRotatingBackground();
  const { currentTheme } = useThemeContext();

  return (
    <div 
      className={`dashboard-rotating-background ${isTransitioning ? 'transitioning' : ''}`}
      style={{ backgroundImage: `url(${currentImage})` }}
    >
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
