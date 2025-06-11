
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { useEmailComposer } from '@/hooks/useEmailComposer';
import { useEmailSending } from '@/hooks/useEmailSending';
import { useViewportHeight } from '@/hooks/useViewportHeight';
import { EmailComposerHeader } from './v2/EmailComposerHeader';
import { CompactEmailComposerLayout } from './v2/CompactEmailComposerLayout';
import { validateEmailForm } from '@/utils/emailValidation';
import type { Application, Job } from '@/types';

interface EmailComposerModalV2Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedApplications: Application[];
  job: Job;
}

export const EmailComposerModalV2 = ({
  open,
  onOpenChange,
  selectedApplications,
  job
}: EmailComposerModalV2Props) => {
  const { data: templates = [], isLoading: templatesLoading } = useEmailTemplates(open);
  const { formData, updateField, selectTemplate, togglePreview, resetForm } = useEmailComposer();
  const { sendBulkEmail, isSending, getCompanyName, getUserUniqueEmail } = useEmailSending();
  const { availableHeight } = useViewportHeight();
  const [currentStep, setCurrentStep] = useState<'compose' | 'preview' | 'sending'>('compose');

  const { isValid } = validateEmailForm(formData.subject, formData.content);
  const canSend = isValid && selectedApplications.length > 0 && !isSending;

  const handleSend = async () => {
    if (!canSend) return;

    setCurrentStep('sending');
    try {
      await sendBulkEmail(
        selectedApplications,
        job,
        formData.subject,
        formData.content,
        formData.templateId
      );
      
      resetForm();
      onOpenChange(false);
      setCurrentStep('compose');
    } catch (error) {
      console.error('Failed to send emails:', error);
      setCurrentStep('compose');
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
      setCurrentStep('compose');
    }
    onOpenChange(open);
  };

  const fromEmail = getUserUniqueEmail();
  const companyName = getCompanyName(job);
  
  // Calculate optimal modal height
  const modalHeight = Math.min(availableHeight * 0.9, 800);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="max-w-4xl p-0 bg-white border shadow-2xl [&>button]:hidden"
        style={{ height: `${modalHeight}px` }}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <EmailComposerHeader
            currentStep={currentStep}
            recipientCount={selectedApplications.length}
            onClose={() => handleOpenChange(false)}
            isLoading={isSending}
          />
          
          <CompactEmailComposerLayout
            templates={templates}
            templatesLoading={templatesLoading}
            formData={formData}
            updateField={updateField}
            selectTemplate={selectTemplate}
            togglePreview={togglePreview}
            onSend={handleSend}
            isSending={isSending}
            canSend={canSend}
            selectedApplications={selectedApplications}
            job={job}
            fromEmail={fromEmail}
            companyName={companyName}
            currentStep={currentStep}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
