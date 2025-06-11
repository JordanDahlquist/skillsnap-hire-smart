
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EmailRichTextEditor } from '@/components/inbox/EmailRichTextEditor';
import { Badge } from '@/components/ui/badge';
import { Edit3, User, AtSign, Building, Briefcase } from 'lucide-react';

interface EmailEditorV2Props {
  subject: string;
  content: string;
  fromEmail: string;
  onSubjectChange: (value: string) => void;
  onContentChange: (value: string) => void;
}

export const EmailEditorV2 = ({
  subject,
  content,
  fromEmail,
  onSubjectChange,
  onContentChange
}: EmailEditorV2Props) => {
  const variables = [
    { name: '{name}', icon: User, description: 'Candidate name' },
    { name: '{email}', icon: AtSign, description: 'Candidate email' },
    { name: '{position}', icon: Briefcase, description: 'Job position' },
    { name: '{company}', icon: Building, description: 'Company name' }
  ];

  return (
    <Card className="bg-gradient-to-br from-green-50/50 to-blue-50/50 border-0 shadow-lg backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2 bg-green-500 rounded-xl text-white">
            <Edit3 className="w-5 h-5" />
          </div>
          Compose Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* From Address */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">From Address</Label>
          <div className="relative">
            <Input
              value={fromEmail}
              disabled
              className="bg-gray-50/80 border-gray-200 text-gray-600 pr-20"
            />
            <Badge variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-100 text-green-700 text-xs">
              Verified
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            Your unique email address for private conversations
          </p>
        </div>

        {/* Subject Line */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Subject Line</Label>
          <Input
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            placeholder="Enter your email subject..."
            className="border-gray-200 focus:border-blue-400 focus:ring-blue-400"
          />
        </div>

        {/* Email Content */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Email Content</Label>
          <EmailRichTextEditor
            value={content}
            onChange={onContentChange}
            placeholder="Type your email message..."
          />
        </div>

        {/* Template Variables */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Available Variables</Label>
          <div className="grid grid-cols-2 gap-2">
            {variables.map((variable) => {
              const IconComponent = variable.icon;
              return (
                <div
                  key={variable.name}
                  className="flex items-center gap-2 p-2 bg-white/70 rounded-lg border border-gray-200 cursor-pointer hover:bg-white/90 transition-colors group"
                  onClick={() => {
                    onContentChange(content + ` ${variable.name}`);
                  }}
                >
                  <IconComponent className="w-4 h-4 text-gray-500 group-hover:text-blue-500" />
                  <div className="flex-1">
                    <code className="text-xs font-mono text-blue-600 group-hover:text-blue-700">
                      {variable.name}
                    </code>
                    <p className="text-xs text-gray-500">{variable.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
