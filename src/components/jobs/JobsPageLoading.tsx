
import { memo } from "react";
import { LOADING_MESSAGES } from "@/constants/messages";

export const JobsPageLoading = memo(() => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center bg-card border border-border rounded-lg p-8 mx-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">{LOADING_MESSAGES.LOADING}</p>
      </div>
    </div>
  );
});

JobsPageLoading.displayName = 'JobsPageLoading';
