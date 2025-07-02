
import { EmailComposerModalV2 } from './email-composer/EmailComposerModalV2';
import { useEmailNavigation } from '@/hooks/useEmailNavigation';
import type { Application, Job } from '@/types';

interface EmailComposerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedApplications: Application[];
  job: Job;
}

export const EmailComposerModal = (props: EmailComposerModalProps) => {
  const { navigateToEmailTab } = useEmailNavigation();
  
  // If only one application is selected, navigate to email tab instead of showing modal
  if (props.selectedApplications.length === 1 && props.open) {
    const application = props.selectedApplications[0];
    navigateToEmailTab(application, props.job.id);
    props.onOpenChange(false);
    return null;
  }
  
  // Only render modal for bulk operations (multiple candidates)
  if (props.selectedApplications.length > 1) {
    return <EmailComposerModalV2 {...props} />;
  }
  
  return null;
};
