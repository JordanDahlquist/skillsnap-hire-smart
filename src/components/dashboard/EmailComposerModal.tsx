
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mail } from 'lucide-react';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { useEmailComposer } from '@/hooks/useEmailComposer';
import { useEmailSending } from '@/hooks/useEmailSending';
import { EmailTemplateSelector } from './email-composer/EmailTemplateSelector';
import { EmailComposerForm } from './email-composer/EmailComposerForm';
import { EmailComposerActions } from './email-composer/EmailComposerActions';
import { RecipientsList } from './email-composer/RecipientsList';
import { EmailPreview } from './email-composer/EmailPreview';
import type { Application, Job } from '@/types/emailComposer';

interface EmailComposerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedApplications: Application[];
  job: Job;
}

export const EmailComposerModal = ({
  open,
  onOpenChange,
  selectedApplications,
  job
}: EmailComposerModalProps) => {
  const { data: templates = [] } = useEmailTemplates(open);
  const { formData, updateField, selectTemplate, togglePreview, resetForm } = useEmailComposer();
  const { isSending, sendEmails, getCompanyName, getUserUniqueEmail } = useEmailSending();

  const companyName = getCompanyName(job);
  const userUniqueEmail = getUserUniqueEmail();
  const previewExample = selectedApplications[0];
  const canSend = formData.subject.trim() && formData.content.trim();

  const handleSendEmails = async () => {
    const success = await sendEmails(
      selectedApplications,
      job,
      formData.subject,
      formData.content,
      formData.templateId || undefined
    );

    if (success) {
      resetForm();
      onOpenChange(false);
    }
  };

  const handleSubjectChange = (value: string) => updateField('subject', value);
  const handleContentChange = (value: string) => updateField('content', value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Send Email to {selectedApplications.length} Candidate{selectedApplications.length > 1 ? 's' : ''}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
          {/* Email Composer */}
          <div className="space-y-4">
            <EmailTemplateSelector
              templates={templates}
              selectedTemplateId={formData.templateId}
              onTemplateSelect={selectTemplate}
            />

            <EmailComposerForm
              subject={formData.subject}
              content={formData.content}
              fromEmail={userUniqueEmail}
              onSubjectChange={handleSubjectChange}
              onContentChange={handleContentChange}
            />

            <EmailComposerActions
              onSend={handleSendEmails}
              onTogglePreview={togglePreview}
              isSending={isSending}
              canSend={canSend}
              showPreview={formData.showPreview}
            />
          </div>

          {/* Recipients and Preview */}
          <div className="space-y-4">
            <RecipientsList applications={selectedApplications} />

            {formData.showPreview && previewExample && (
              <EmailPreview
                application={previewExample}
                job={job}
                subject={formData.subject}
                content={formData.content}
                fromEmail={userUniqueEmail}
                companyName={companyName}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
