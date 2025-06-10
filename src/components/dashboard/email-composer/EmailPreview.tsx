
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { processTemplateVariables } from '@/utils/emailValidation';
import type { Application, Job } from '@/types/emailComposer';

interface EmailPreviewProps {
  application: Application;
  job: Job;
  subject: string;
  content: string;
  fromEmail: string;
  companyName: string;
}

export const EmailPreview = ({
  application,
  job,
  subject,
  content,
  fromEmail,
  companyName
}: EmailPreviewProps) => {
  const processedSubject = processTemplateVariables(subject, application, job, companyName);
  const processedContent = processTemplateVariables(content, application, job, companyName);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Preview (for {application.name})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-gray-500">From:</Label>
            <p className="text-sm font-medium">{fromEmail}</p>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Subject:</Label>
            <p className="text-sm font-medium">{processedSubject}</p>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Content:</Label>
            <ScrollArea className="h-40 p-3 bg-gray-50 rounded border text-sm whitespace-pre-wrap">
              {processedContent}
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
