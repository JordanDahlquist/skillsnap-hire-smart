
import { EmailSendingState } from './EmailSendingState';
import { CompactEmailForm } from './CompactEmailForm';
import type { EmailTemplate, EmailFormData, Application, Job } from '@/types/emailComposer';

interface CompactEmailComposerLayoutProps {
  templates: EmailTemplate[];
  templatesLoading: boolean;
  formData: EmailFormData;
  updateField: (field: keyof EmailFormData, value: string | boolean) => void;
  selectTemplate: (template: EmailTemplate) => void;
  onSend: () => void;
  isSending: boolean;
  canSend: boolean;
  selectedApplications: Application[];
  job: Job;
  fromEmail: string;
  companyName: string;
  currentStep: 'compose' | 'preview' | 'sending';
}

export const CompactEmailComposerLayout = ({
  templates,
  templatesLoading,
  formData,
  updateField,
  selectTemplate,
  onSend,
  isSending,
  canSend,
  selectedApplications,
  fromEmail,
  currentStep
}: CompactEmailComposerLayoutProps) => {
  if (currentStep === 'sending') {
    return <EmailSendingState totalRecipients={selectedApplications.length} />;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <CompactEmailForm
        applications={selectedApplications}
        templates={templates}
        templatesLoading={templatesLoading}
        formData={formData}
        fromEmail={fromEmail}
        updateField={updateField}
        selectTemplate={selectTemplate}
        onSend={onSend}
        isSending={isSending}
        canSend={canSend}
      />
    </div>
  );
};
