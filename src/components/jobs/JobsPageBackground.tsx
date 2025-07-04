
import { memo, ReactNode } from "react";

interface JobsPageBackgroundProps {
  children: ReactNode;
}

export const JobsPageBackground = memo(({ children }: JobsPageBackgroundProps) => {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
});

JobsPageBackground.displayName = 'JobsPageBackground';
