
import { CompactRecipientsSection } from './CompactRecipientsSection';
import { CompactTemplateSelector } from './CompactTemplateSelector';
import { Mail, Users } from 'lucide-react';
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
    <div className="flex-shrink-0 border-b border-border/50">
      <div className="p-4 space-y-4">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500 rounded-xl text-white">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Email Configuration</h3>
            <p className="text-sm text-muted-foreground">Set up your email recipients and template</p>
          </div>
        </div>

        {/* Recipients Card */}
        <div className="glass-card-no-hover p-4 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-blue-500" />
            <h4 className="font-medium text-foreground">Recipients</h4>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {applications.length} selected
            </span>
          </div>
          <CompactRecipientsSection applications={applications} />
        </div>

        {/* Template Selector Card */}
        <div className="glass-card-no-hover p-4 rounded-2xl">
          <CompactTemplateSelector
            templates={templates}
            isLoading={templatesLoading}
            selectedTemplateId={formData.templateId}
            onSelectTemplate={selectTemplate}
          />
        </div>
      </div>
    </div>
  );
};
