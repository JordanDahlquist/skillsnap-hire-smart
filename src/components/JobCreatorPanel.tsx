
// Backward compatibility wrapper
import { UnifiedJobCreatorPanel } from "./UnifiedJobCreatorPanel";
import type { UnifiedJobCreatorPanelProps as JobCreatorPanelProps } from "@/types/jobForm";

export type { JobCreatorPanelProps };

export const JobCreatorPanel = (props: JobCreatorPanelProps) => {
  return <UnifiedJobCreatorPanel {...props} />;
};
