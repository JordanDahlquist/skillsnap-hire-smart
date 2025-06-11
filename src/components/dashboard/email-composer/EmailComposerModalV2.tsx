
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
  const { formData, updateField, selectTemplate, resetForm } = useEmailComposer();
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
        className="max-w-4xl p-0 border-0 bg-transparent shadow-none [&>button]:hidden overflow-hidden"
        style={{ height: `${modalHeight}px` }}
      >
        {/* Cosmic Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-r from-green-400/15 to-emerald-400/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        {/* Main Modal Content with Glass Effect */}
        <div className="glass-card h-full flex flex-col overflow-hidden relative z-10">
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
