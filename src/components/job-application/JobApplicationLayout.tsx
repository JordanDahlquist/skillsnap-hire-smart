
import { ReactNode } from 'react';
import { useRotatingBackground } from '@/hooks/useRotatingBackground';

interface JobApplicationLayoutProps {
  children: ReactNode;
}

export const JobApplicationLayout = ({ children }: JobApplicationLayoutProps) => {
  const { currentImage, isTransitioning } = useRotatingBackground();

  return (
    <div
      className={`min-h-screen dashboard-rotating-background ${isTransitioning ? 'transitioning' : ''}`}
      style={{ backgroundImage: `url(${currentImage})` }}
    >
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-pink-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-300/5 to-pink-300/5 rounded-full blur-3xl"></div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
};
