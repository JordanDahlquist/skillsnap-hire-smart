
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { useEmailComposer } from '@/hooks/useEmailComposer';
import { useEmailSending } from '@/hooks/useEmailSending';
import { EmailTemplateSelector } from './email-composer/EmailTemplateSelector';
import { EmailComposerForm } from './email-composer/EmailComposerForm';
import { EmailComposerActions } from './email-composer/EmailComposerActions';
import { RecipientsList } from './email-composer/RecipientsList';
import { EmailPreview } from './email-composer/EmailPreview';
import { validateEmailForm } from '@/utils/emailValidation';
import type { Application, Job } from '@/types';

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
  const { data: templates = [], isLoading: templatesLoading } = useEmailTemplates(open);
  const { formData, updateField, selectTemplate, togglePreview, resetForm } = useEmailComposer();
  const { sendBulkEmail, isSending } = useEmailSending();

  const { isValid } = validateEmailForm(formData.subject, formData.content);
  const canSend = isValid && selectedApplications.length > 0 && !isSending;

  const handleSend = async () => {
    if (!canSend) return;

    try {
      await sendBulkEmail({
        applications: selectedApplications,
        job,
        subject: formData.subject,
        content: formData.content
      });
      
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to send emails:', error);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Bulk Email</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <RecipientsList applications={selectedApplications} />

          <EmailTemplateSelector
            templates={templates}
            isLoading={templatesLoading}
            selectedTemplateId={formData.templateId}
            onSelectTemplate={selectTemplate}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <EmailComposerForm
                subject={formData.subject}
                content={formData.content}
                onSubjectChange={(subject) => updateField('subject', subject)}
                onContentChange={(content) => updateField('content', content)}
              />

              <EmailComposerActions
                onSend={handleSend}
                onTogglePreview={togglePreview}
                isSending={isSending}
                canSend={canSend}
                showPreview={formData.showPreview}
              />
            </div>

            {formData.showPreview && (
              <EmailPreview
                subject={formData.subject}
                content={formData.content}
                sampleApplication={selectedApplications[0]}
                job={job}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
