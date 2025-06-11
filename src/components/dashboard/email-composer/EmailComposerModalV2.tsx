
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { useEmailComposer } from '@/hooks/useEmailComposer';
import { useEmailSending } from '@/hooks/useEmailSending';
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
      <DialogContent 
        className="max-w-4xl w-[95vw] h-[90vh] max-h-[90vh] p-0 border-0 shadow-2xl [&>button]:hidden overflow-hidden relative backdrop-blur-xl bg-white/30 border border-white/40 rounded-3xl"
      >
        {/* Accessibility components - visually hidden */}
        <DialogTitle className="sr-only">
          Email Composer - {selectedApplications.length} recipient{selectedApplications.length > 1 ? 's' : ''}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Compose and send bulk emails to selected candidates for {job.title} position
        </DialogDescription>

        {/* Enhanced glass background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent rounded-3xl pointer-events-none" />
        
        {/* Cosmic Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Main ambient orbs */}
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-blue-400/20 via-purple-500/15 to-cyan-400/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-32 right-16 w-48 h-48 bg-gradient-to-br from-purple-400/25 via-pink-500/15 to-blue-400/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-gradient-to-br from-cyan-400/30 via-blue-500/20 to-purple-400/15 rounded-full blur-xl animate-float" style={{ animationDelay: '4s' }} />
          
          {/* Subtle particle effects */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/60 rounded-full animate-twinkle" />
          <div className="absolute top-3/4 left-3/4 w-1.5 h-1.5 bg-blue-300/70 rounded-full animate-twinkle" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-purple-300/80 rounded-full animate-twinkle" style={{ animationDelay: '3s' }} />
        </div>

        <div className="flex flex-col h-full min-h-0 overflow-hidden relative z-10">
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
