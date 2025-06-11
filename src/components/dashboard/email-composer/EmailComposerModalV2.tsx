
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { useEmailComposer } from '@/hooks/useEmailComposer';
import { useEmailSending } from '@/hooks/useEmailSending';
import { EmailComposerHeader } from './v2/EmailComposerHeader';
import { EmailComposerLayout } from './v2/EmailComposerLayout';
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] p-0 bg-transparent border-0 shadow-none">
        <div className="relative w-full h-full">
          {/* Backdrop with blur and gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 backdrop-blur-xl rounded-3xl" />
          
          {/* Glass morphism container */}
          <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
            <EmailComposerHeader
              currentStep={currentStep}
              recipientCount={selectedApplications.length}
              onClose={() => handleOpenChange(false)}
              isLoading={isSending}
            />
            
            <EmailComposerLayout
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
