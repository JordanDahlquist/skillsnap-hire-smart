
import { CompactEmailEditor } from './CompactEmailEditor';
import type { EmailFormData } from '@/types/emailComposer';

interface EmailFormSectionProps {
  formData: EmailFormData;
  fromEmail: string;
  updateField: (field: keyof EmailFormData, value: string | boolean) => void;
}

export const EmailFormSection = ({
  formData,
  fromEmail,
  updateField
}: EmailFormSectionProps) => {
  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      <div className="w-full flex flex-col border-r overflow-hidden">
        <CompactEmailEditor
          subject={formData.subject}
          content={formData.content}
          fromEmail={fromEmail}
          onSubjectChange={(subject) => updateField('subject', subject)}
          onContentChange={(content) => updateField('content', content)}
        />
      </div>
    </div>
  );
};
