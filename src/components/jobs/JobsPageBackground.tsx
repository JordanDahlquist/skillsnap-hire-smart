
import { memo, ReactNode } from "react";
import { useThemeContext } from "@/contexts/ThemeContext";

interface JobsPageBackgroundProps {
  children: ReactNode;
}

export const JobsPageBackground = memo(({ children }: JobsPageBackgroundProps) => {
  const { currentTheme } = useThemeContext();

  // Simple solid color background based on theme
  const backgroundColor = currentTheme === 'black' ? '#000000' : '#ffffff';

  return (
    <div className="min-h-screen" style={{ backgroundColor }}>
      {children}
    </div>
  );
});

JobsPageBackground.displayName = 'JobsPageBackground';
