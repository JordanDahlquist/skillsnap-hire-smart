
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
import { AttachmentUpload } from '@/components/inbox/AttachmentUpload';
import { validateEmailForm } from '@/utils/emailValidation';
import type { Application, Job } from '@/types';

interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  path?: string;
  file?: File;
}

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
  const { sendBulkEmail, isSending, getCompanyName, getUserUniqueEmail } = useEmailSending();
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);

  const { isValid } = validateEmailForm(formData.subject, formData.content);
  const canSend = isValid && selectedApplications.length > 0 && !isSending;

  const handleSend = async () => {
    if (!canSend) return;

    try {
      const success = await sendBulkEmail(
        selectedApplications,
        job,
        formData.subject,
        formData.content,
        formData.templateId,
        attachments
      );
      
      if (success) {
        resetForm();
        setAttachments([]);
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Failed to send emails:', error);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
      setAttachments([]);
    }
    onOpenChange(open);
  };

  const fromEmail = getUserUniqueEmail();
  const companyName = getCompanyName(job);

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
                fromEmail={fromEmail}
                onSubjectChange={(subject) => updateField('subject', subject)}
                onContentChange={(content) => updateField('content', content)}
              />

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Attachments</h4>
                <AttachmentUpload
                  attachments={attachments}
                  onAttachmentsChange={setAttachments}
                  disabled={isSending}
                />
              </div>

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
                application={selectedApplications[0]}
                job={job}
                fromEmail={fromEmail}
                companyName={companyName}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
