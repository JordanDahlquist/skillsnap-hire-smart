
import { ScrollArea } from '@/components/ui/scroll-area';
import { processTemplateVariables } from '@/utils/emailValidation';
import { Eye } from 'lucide-react';
import type { Application, Job } from '@/types/emailComposer';

interface CompactEmailPreviewProps {
  application: Application;
  job: Job;
  subject: string;
  content: string;
  fromEmail: string;
  companyName: string;
}

export const CompactEmailPreview = ({
  application,
  job,
  subject,
  content,
  fromEmail,
  companyName
}: CompactEmailPreviewProps) => {
  const processedSubject = processTemplateVariables(subject, application, job, companyName);
  const processedContent = processTemplateVariables(content, application, job, companyName);

  return (
    <div className="flex flex-col h-full">
      {/* Preview header */}
      <div className="flex-shrink-0 p-4 border-b bg-gray-50/50">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">Live Preview</span>
          <span className="text-xs text-gray-500">({application.name})</span>
        </div>
      </div>

      {/* Email preview */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {/* Email headers */}
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="w-12 text-gray-500 font-medium">From:</span>
                <span className="text-gray-800">{fromEmail}</span>
              </div>
              <div className="flex">
                <span className="w-12 text-gray-500 font-medium">To:</span>
                <span className="text-gray-800">{application.email}</span>
              </div>
              <div className="flex">
                <span className="w-12 text-gray-500 font-medium">Subject:</span>
                <span className="text-gray-800 font-medium">{processedSubject}</span>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Email content */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div 
                className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed"
                dangerouslySetInnerHTML={{ __html: processedContent }}
              />
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
