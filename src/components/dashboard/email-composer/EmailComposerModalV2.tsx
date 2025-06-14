
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { useEmailSending } from '@/hooks/useEmailSending';
import { useEmailComposerState } from '@/hooks/useEmailComposerState';
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
  const {
    currentStep,
    setCurrentStep,
    formData,
    updateField,
    selectTemplate,
    resetForm
  } = useEmailComposerState();
  const { sendBulkEmail, isSending, getCompanyName, getUserUniqueEmail } = useEmailSending();

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
    } catch (error) {
      console.error('Failed to send emails:', error);
      setCurrentStep('compose');
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const fromEmail = getUserUniqueEmail();
  const companyName = getCompanyName(job);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] max-h-[700px] min-h-[600px] p-0 border-0 shadow-3xl overflow-hidden">
        {/* Hidden accessibility components */}
        <DialogTitle className="sr-only">Compose Email</DialogTitle>
        <DialogDescription className="sr-only">
          Compose and send emails to {selectedApplications.length} selected candidate{selectedApplications.length > 1 ? 's' : ''}
        </DialogDescription>
        
        <div className="flex flex-col h-full overflow-hidden bg-background/95 backdrop-blur-xl rounded-3xl">
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
