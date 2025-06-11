
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Monitor, Smartphone, Eye, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { processTemplateVariables } from '@/utils/emailValidation';
import type { Application, Job } from '@/types/emailComposer';

interface EmailPreviewV2Props {
  application: Application;
  job: Job;
  subject: string;
  content: string;
  fromEmail: string;
  companyName: string;
}

export const EmailPreviewV2 = ({
  application,
  job,
  subject,
  content,
  fromEmail,
  companyName
}: EmailPreviewV2Props) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  
  const processedSubject = processTemplateVariables(subject, application, job, companyName);
  const processedContent = processTemplateVariables(content, application, job, companyName);

  return (
    <Card className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border-0 shadow-lg backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="p-2 bg-indigo-500 rounded-xl text-white">
              <Eye className="w-5 h-5" />
            </div>
            Email Preview
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('desktop')}
              className="h-8"
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('mobile')}
              className="h-8"
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Preview for specific candidate */}
          <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl border border-white/50">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white text-sm">
                {application.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-900">Previewing for:</p>
              <p className="text-sm text-gray-600">{application.name}</p>
            </div>
          </div>

          {/* Email mockup */}
          <div className={`bg-white rounded-xl shadow-lg border transition-all duration-300 ${
            viewMode === 'mobile' ? 'max-w-xs mx-auto' : 'w-full'
          }`}>
            {/* Email header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{fromEmail}</p>
                  <p className="text-xs text-gray-500">to {application.email}</p>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">
                {processedSubject}
              </h3>
            </div>

            {/* Email body */}
            <div className="p-4">
              <div 
                className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: processedContent.replace(/\n/g, '<br>') }}
              />
            </div>

            {/* Email footer */}
            <div className="px-4 pb-4">
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Sent via {companyName} • Reply to this email to respond
                </p>
              </div>
            </div>
          </div>

          {/* Preview stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white/70 rounded-lg text-center">
              <p className="text-lg font-bold text-gray-900">{processedSubject.length}</p>
              <p className="text-xs text-gray-500">Subject Characters</p>
            </div>
            <div className="p-3 bg-white/70 rounded-lg text-center">
              <p className="text-lg font-bold text-gray-900">{processedContent.length}</p>
              <p className="text-xs text-gray-500">Content Characters</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
