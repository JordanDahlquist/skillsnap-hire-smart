
import { ReactNode } from 'react';

interface JobApplicationLayoutProps {
  children: ReactNode;
}

export const JobApplicationLayout = ({ children }: JobApplicationLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Clean white background with subtle pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-white"></div>
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-50/30 to-transparent"></div>
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
