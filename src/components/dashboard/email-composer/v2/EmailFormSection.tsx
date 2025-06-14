
import { CompactEmailEditor } from './CompactEmailEditor';
import { Edit3 } from 'lucide-react';
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
    <div className="flex-1 flex min-h-0 overflow-hidden p-4">
      <div className="w-full flex flex-col glass-card-no-hover rounded-2xl overflow-hidden">
        {/* Editor Header */}
        <div className="p-4 border-b border-border/50 bg-background/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-xl text-white">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Compose Message</h3>
              <p className="text-sm text-muted-foreground">Write your email content with dynamic variables</p>
            </div>
          </div>
        </div>

        {/* Email Editor */}
        <div className="flex-1 min-h-0">
          <CompactEmailEditor
            subject={formData.subject}
            content={formData.content}
            fromEmail={fromEmail}
            onSubjectChange={(subject) => updateField('subject', subject)}
            onContentChange={(content) => updateField('content', content)}
          />
        </div>
      </div>
    </div>
  );
};
