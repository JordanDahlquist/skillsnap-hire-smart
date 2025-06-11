
import { CompactRecipientsSection } from './CompactRecipientsSection';
import { CompactTemplateSelector } from './CompactTemplateSelector';
import type { EmailTemplate, EmailFormData, Application } from '@/types/emailComposer';

interface EmailConfigSectionProps {
  applications: Application[];
  templates: EmailTemplate[];
  templatesLoading: boolean;
  formData: EmailFormData;
  selectTemplate: (template: EmailTemplate) => void;
}

export const EmailConfigSection = ({
  applications,
  templates,
  templatesLoading,
  formData,
  selectTemplate
}: EmailConfigSectionProps) => {
  return (
    <div className="flex-shrink-0 p-2 bg-gray-50/30 border-b space-y-2">
      <CompactRecipientsSection applications={applications} />
      <CompactTemplateSelector
        templates={templates}
        isLoading={templatesLoading}
        selectedTemplateId={formData.templateId}
        onSelectTemplate={selectTemplate}
      />
    </div>
  );
};
