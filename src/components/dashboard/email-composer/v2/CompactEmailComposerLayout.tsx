
import { CompactRecipientsSection } from './CompactRecipientsSection';
import { CompactTemplateSelector } from './CompactTemplateSelector';
import { CompactEmailEditor } from './CompactEmailEditor';
import { CompactEmailActions } from './CompactEmailActions';
import { SendingProgress } from './SendingProgress';
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
  job,
  fromEmail,
  companyName,
  currentStep
}: CompactEmailComposerLayoutProps) => {
  if (currentStep === 'sending') {
    return (
      <div className="flex-1 flex items-center justify-center p-6 glass-content m-4 rounded-3xl">
        <SendingProgress 
          totalRecipients={selectedApplications.length}
          currentRecipient={0}
          isComplete={false}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-4 gap-4">
      {/* Compact top section - Recipients and Template */}
      <div className="flex-shrink-0 space-y-3">
        <CompactRecipientsSection applications={selectedApplications} />
        <CompactTemplateSelector
          templates={templates}
          isLoading={templatesLoading}
          selectedTemplateId={formData.templateId}
          onSelectTemplate={selectTemplate}
        />
      </div>

      {/* Main content area - Full width email editor */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="w-full flex flex-col glass-card rounded-2xl overflow-hidden">
          <CompactEmailEditor
            subject={formData.subject}
            content={formData.content}
            fromEmail={fromEmail}
            onSubjectChange={(subject) => updateField('subject', subject)}
            onContentChange={(content) => updateField('content', content)}
          />
        </div>
      </div>

      {/* Bottom actions - Always visible and accessible */}
      <div className="flex-shrink-0 glass-content rounded-2xl">
        <CompactEmailActions
          onSend={onSend}
          isSending={isSending}
          canSend={canSend}
        />
      </div>
    </div>
  );
};
