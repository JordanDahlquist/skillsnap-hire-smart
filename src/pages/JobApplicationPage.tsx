
import { JobApplication } from "@/components/JobApplication";
import { ThemeProvider } from "@/contexts/ThemeContext";

export const JobApplicationPage = () => {
  return (
    <ThemeProvider>
      <JobApplication />
    </ThemeProvider>
  );
};
