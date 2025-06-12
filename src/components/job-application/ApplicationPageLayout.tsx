
import { ReactNode } from 'react';

interface ApplicationPageLayoutProps {
  children: ReactNode;
}

export const ApplicationPageLayout = ({ children }: ApplicationPageLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
};
