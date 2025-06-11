
import { EmailComposerModalV2 } from './email-composer/EmailComposerModalV2';
import type { Application, Job } from '@/types';

interface EmailComposerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedApplications: Application[];
  job: Job;
}

export const EmailComposerModal = (props: EmailComposerModalProps) => {
  return <EmailComposerModalV2 {...props} />;
};
