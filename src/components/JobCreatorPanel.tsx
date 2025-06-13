
// Backward compatibility wrapper
import { UnifiedJobCreatorPanel } from "./UnifiedJobCreatorPanel";
import { UnifiedJobCreatorPanelProps as JobCreatorPanelProps } from "@/types/jobForm";

export { JobCreatorPanelProps };

export const JobCreatorPanel = (props: JobCreatorPanelProps) => {
  return <UnifiedJobCreatorPanel {...props} />;
};
