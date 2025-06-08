import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Eye, Users, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  variables: string[];
}

interface Application {
  id: string;
  name: string;
  email: string;
}

interface Job {
  id: string;
  title: string;
  company_name?: string;
}

interface EmailComposerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedApplications: Application[];
  job: Job;
}

export const EmailComposerModal = ({
  open,
  onOpenChange,
  selectedApplications,
  job
}: EmailComposerModalProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Smart fallback for company name: job-specific > profile > 'Our Company'
  const getCompanyName = () => {
    return job.company_name || profile?.company_name || 'Our Company';
  };

  // Always use the verified atract.ai domain for emails
  const getReplyToEmail = () => {
    return 'hiring@atract.ai';
  };

  // Fetch email templates
  const { data: templates = [] } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as EmailTemplate[];
    },
    enabled: !!user && open,
  });

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setSubject(template.subject);
      setContent(template.content);
    }
  };

  const processTemplate = (text: string, application: Application) => {
    const companyName = getCompanyName();
    return text
      .replace(/{name}/g, application.name)
      .replace(/{email}/g, application.email)
      .replace(/{position}/g, job.title)
      .replace(/{company}/g, companyName);
  };

  const handleSendEmails = async () => {
    if (!subject || !content) {
      toast({
        title: "Missing Information",
        description: "Please provide both subject and content for the email.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to send emails.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    
    try {
      const companyName = getCompanyName();
      const replyToEmail = getReplyToEmail();
      
      // Call the send-bulk-email edge function with user ID
      const { data, error } = await supabase.functions.invoke('send-bulk-email', {
        body: {
          user_id: user.id, // Pass user ID explicitly
          applications: selectedApplications,
          job: job,
          subject: subject,
          content: content,
          template_id: selectedTemplateId || null,
          company_name: companyName,
          reply_to_email: replyToEmail,
          create_threads: true // Flag to create email threads
        }
      });

      if (error) throw error;

      toast({
        title: "Emails Sent",
        description: `Successfully sent emails to ${selectedApplications.length} candidate${selectedApplications.length > 1 ? 's' : ''} from ${replyToEmail}.`,
      });

      onOpenChange(false);
      
    } catch (error) {
      console.error('Error sending emails:', error);
      toast({
        title: "Send Failed",
        description: "There was an error sending the emails. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const previewExample = selectedApplications[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Send Email to {selectedApplications.length} Candidate{selectedApplications.length > 1 ? 's' : ''}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
          {/* Email Composer */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="template">Email Template (Optional)</Label>
              <Select value={selectedTemplateId} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <span>{template.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reply-to">Reply-to Address</Label>
              <Input
                id="reply-to"
                value={getReplyToEmail()}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Recipients can reply to this address and it will appear in your inbox
              </p>
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject..."
              />
            </div>

            <div>
              <Label htmlFor="content">Email Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Email content..."
                rows={10}
              />
              <p className="text-xs text-gray-500 mt-1">
                Available variables: {"{name}"}, {"{email}"}, {"{position}"}, {"{company}"}
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSendEmails} disabled={isSending || !subject || !content}>
                <Send className="w-4 h-4 mr-2" />
                {isSending ? 'Sending...' : 'Send Email'}
              </Button>
              <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? 'Hide Preview' : 'Preview'}
              </Button>
            </div>
          </div>

          {/* Recipients and Preview */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Recipients ({selectedApplications.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {selectedApplications.map((app) => (
                      <div key={app.id} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{app.name}</span>
                        <span className="text-gray-500">{app.email}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {showPreview && previewExample && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Preview (for {previewExample.name})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-500">From:</Label>
                      <p className="text-sm font-medium">{getReplyToEmail()}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Subject:</Label>
                      <p className="text-sm font-medium">
                        {processTemplate(subject, previewExample)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Content:</Label>
                      <ScrollArea className="h-40 p-3 bg-gray-50 rounded border text-sm whitespace-pre-wrap">
                        {processTemplate(content, previewExample)}
                      </ScrollArea>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
