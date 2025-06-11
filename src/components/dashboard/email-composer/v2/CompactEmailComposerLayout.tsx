
import { CompactRecipientsSection } from './CompactRecipientsSection';
import { CompactTemplateSelector } from './CompactTemplateSelector';
import { CompactEmailEditor } from './CompactEmailEditor';
import { CompactEmailPreview } from './CompactEmailPreview';
import { CompactEmailActions } from './CompactEmailActions';
import { SendingProgress } from './SendingProgress';
import type { EmailTemplate, EmailFormData, Application, Job } from '@/types/emailComposer';

interface CompactEmailComposerLayoutProps {
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

export const CompactEmailComposerLayout = ({
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
}: CompactEmailComposerLayoutProps) => {
  if (currentStep === 'sending') {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <SendingProgress 
          totalRecipients={selectedApplications.length}
          currentRecipient={0}
          isComplete={false}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Compact top section - Recipients and Template */}
      <div className="flex-shrink-0 p-2 bg-gray-50/30 border-b space-y-2">
        <CompactRecipientsSection applications={selectedApplications} />
        <CompactTemplateSelector
          templates={templates}
          isLoading={templatesLoading}
          selectedTemplateId={formData.templateId}
          onSelectTemplate={selectTemplate}
        />
      </div>

      {/* Main content area with proper height constraints */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left side - Email Editor with internal scrolling */}
        <div className={`${formData.showPreview ? 'w-1/2' : 'w-full'} flex flex-col border-r overflow-hidden`}>
          <CompactEmailEditor
            subject={formData.subject}
            content={formData.content}
            fromEmail={fromEmail}
            onSubjectChange={(subject) => updateField('subject', subject)}
            onContentChange={(content) => updateField('content', content)}
          />
        </div>

        {/* Right side - Preview (if enabled) */}
        {formData.showPreview && (
          <div className="w-1/2 flex flex-col min-h-0 overflow-hidden">
            <CompactEmailPreview
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

      {/* Bottom actions - Always visible and accessible */}
      <div className="flex-shrink-0 border-t bg-white">
        <CompactEmailActions
          onSend={onSend}
          onTogglePreview={togglePreview}
          isSending={isSending}
          canSend={canSend}
          showPreview={formData.showPreview}
        />
      </div>
    </div>
  );
};
