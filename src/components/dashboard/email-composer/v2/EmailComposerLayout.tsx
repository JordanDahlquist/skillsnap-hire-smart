
import { Card } from '@/components/ui/card';
import { RecipientsCardV2 } from './RecipientsCardV2';
import { TemplateGallery } from './TemplateGallery';
import { EmailEditorV2 } from './EmailEditorV2';
import { EmailPreviewV2 } from './EmailPreviewV2';
import { EmailActionsV2 } from './EmailActionsV2';
import { SendingProgress } from './SendingProgress';
import type { EmailTemplate, EmailFormData, Application, Job } from '@/types/emailComposer';

interface EmailComposerLayoutProps {
  templates: EmailTemplate[];
  templatesLoading: boolean;
  formData: EmailFormData;
  updateField: (field: keyof EmailFormData, value: string | boolean) => void;
  selectTemplate: (template: EmailTemplate) => void;
  togglePreview: () => void;
  onSend: () => void;
  isSending: boolean;
  canSend: boolean;
  selectedApplications: Application[];
  job: Job;
  fromEmail: string;
  companyName: string;
  currentStep: 'compose' | 'preview' | 'sending';
}

export const EmailComposerLayout = ({
  templates,
  templatesLoading,
  formData,
  updateField,
  selectTemplate,
  togglePreview,
  onSend,
  isSending,
  canSend,
  selectedApplications,
  job,
  fromEmail,
  companyName,
  currentStep
}: EmailComposerLayoutProps) => {
  if (currentStep === 'sending') {
    return (
      <div className="p-8">
        <SendingProgress 
          totalRecipients={selectedApplications.length}
          currentRecipient={0}
          isComplete={false}
        />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Recipients Section */}
      <RecipientsCardV2 applications={selectedApplications} />

      {/* Template Gallery */}
      <TemplateGallery
        templates={templates}
        isLoading={templatesLoading}
        selectedTemplateId={formData.templateId}
        onSelectTemplate={selectTemplate}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Email Editor */}
        <div className="space-y-6">
          <EmailEditorV2
            subject={formData.subject}
            content={formData.content}
            fromEmail={fromEmail}
            onSubjectChange={(subject) => updateField('subject', subject)}
            onContentChange={(content) => updateField('content', content)}
          />

          <EmailActionsV2
            onSend={onSend}
            onTogglePreview={togglePreview}
            isSending={isSending}
            canSend={canSend}
            showPreview={formData.showPreview}
          />
        </div>

        {/* Right Column - Preview */}
        {formData.showPreview && (
          <div className="space-y-6">
            <EmailPreviewV2
              subject={formData.subject}
              content={formData.content}
              application={selectedApplications[0]}
              job={job}
              fromEmail={fromEmail}
              companyName={companyName}
            />
          </div>
        )}
      </div>
    </div>
  );
};
