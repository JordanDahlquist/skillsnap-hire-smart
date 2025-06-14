
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmailConfigSection } from './EmailConfigSection';
import { EmailFormSection } from './EmailFormSection';
import { CompactEmailActions } from './CompactEmailActions';
import { EmailSendingState } from './EmailSendingState';
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
    <div className="flex-1 flex flex-col min-h-0">
      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          <EmailConfigSection
            applications={selectedApplications}
            templates={templates}
            templatesLoading={templatesLoading}
            formData={formData}
            selectTemplate={selectTemplate}
          />

          <div className="min-h-[400px]">
            <EmailFormSection
              formData={formData}
              fromEmail={fromEmail}
              updateField={updateField}
            />
          </div>
        </div>
      </ScrollArea>

      <div className="flex-shrink-0 border-t bg-white">
        <CompactEmailActions
          onSend={onSend}
          isSending={isSending}
          canSend={canSend}
        />
      </div>
    </div>
  );
};
