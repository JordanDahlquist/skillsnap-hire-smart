import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit2, Plus, Save, X, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  variables: string[];
  created_at: string;
  updated_at: string;
}

const PRESET_TEMPLATES = [
  {
    name: "Interview Request",
    subject: "Interview Invitation - {position} at {company}",
    content: `Hi {name},

Thank you for your interest in the {position} role at {company}. We were impressed with your application and would like to invite you for an interview.

We'd like to schedule a conversation to learn more about your experience and discuss how you might contribute to our team.

Please let us know your availability for the coming week, and we'll coordinate a time that works for both of us.

Looking forward to speaking with you soon!

Best regards,
{company} Team`,
    category: "interview"
  },
  {
    name: "Application Received",
    subject: "Application Received - {position} at {company}",
    content: `Hi {name},

Thank you for applying for the {position} role at {company}. We've received your application and wanted to confirm it's in our system.

Our team will review your application carefully, and we'll be in touch within the next few days with an update on next steps.

We appreciate your interest in joining our team!

Best regards,
{company} Team`,
    category: "status"
  },
  {
    name: "Application Under Review",
    subject: "Update on Your Application - {position} at {company}",
    content: `Hi {name},

I wanted to provide you with a quick update on your application for the {position} role at {company}.

Your application is currently under review by our team. We're taking the time to carefully evaluate all candidates to ensure we make the best decision for both the role and our team.

We expect to have an update for you within the next week. Thank you for your patience during this process.

Best regards,
{company} Team`,
    category: "status"
  },
  {
    name: "Application Rejection",
    subject: "Update on Your Application - {position} at {company}",
    content: `Hi {name},

Thank you for your interest in the {position} role at {company} and for taking the time to apply.

After careful consideration, we've decided to move forward with other candidates whose experience more closely aligns with our current needs.

We were impressed by your background and encourage you to apply for future opportunities that match your skills and interests. We'll keep your information on file and reach out if a suitable position becomes available.

We wish you the best of luck in your job search!

Best regards,
{company} Team`,
    category: "rejection"
  },
  {
    name: "Follow-up After Interview",
    subject: "Thank you for interviewing - {position} at {company}",
    content: `Hi {name},

Thank you for taking the time to interview for the {position} role at {company}. It was great getting to know you and learning about your experience.

We're currently reviewing all candidates and will have a decision within the next few days. We'll be in touch soon with an update on next steps.

Thank you again for your interest in joining our team!

Best regards,
{company} Team`,
    category: "followup"
  }
];

export const EmailTemplates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingPresets, setIsLoadingPresets] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'general'
  });

  // Fetch email templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EmailTemplate[];
    },
    enabled: !!user,
  });

  // Load preset templates mutation
  const loadPresetsMutation = useMutation({
    mutationFn: async () => {
      const existingTemplateNames = templates.map(t => t.name);
      const newPresets = PRESET_TEMPLATES.filter(preset => 
        !existingTemplateNames.includes(preset.name)
      );

      if (newPresets.length === 0) {
        throw new Error('All preset templates already exist');
      }

      const presetsToInsert = newPresets.map(preset => ({
        ...preset,
        user_id: user?.id,
        variables: extractVariables(preset.content)
      }));

      const { data, error } = await supabase
        .from('email_templates')
        .insert(presetsToInsert)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast({
        title: "Preset Templates Loaded",
        description: `Successfully added ${data.length} preset email template${data.length > 1 ? 's' : ''}.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message === 'All preset templates already exist' 
          ? "All preset templates have already been loaded." 
          : "Failed to load preset templates.",
        variant: error.message === 'All preset templates already exist' ? "default" : "destructive",
      });
    }
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: any) => {
      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          ...templateData,
          user_id: user?.id,
          variables: extractVariables(templateData.content)
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      setIsCreating(false);
      resetForm();
      toast({
        title: "Template Created",
        description: "Email template has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create email template.",
        variant: "destructive",
      });
    }
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, ...templateData }: any) => {
      const { data, error } = await supabase
        .from('email_templates')
        .update({
          ...templateData,
          variables: extractVariables(templateData.content),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      setEditingTemplate(null);
      resetForm();
      toast({
        title: "Template Updated",
        description: "Email template has been updated successfully.",
      });
    }
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast({
        title: "Template Deleted",
        description: "Email template has been deleted successfully.",
      });
    }
  });

  const extractVariables = (content: string): string[] => {
    const regex = /\{([^}]+)\}/g;
    const matches = content.match(regex) || [];
    return [...new Set(matches)];
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      content: '',
      category: 'general'
    });
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      category: template.category
    });
  };

  const handleSave = () => {
    if (editingTemplate) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, ...formData });
    } else {
      createTemplateMutation.mutate(formData);
    }
  };

  const handleCancel = () => {
    setEditingTemplate(null);
    setIsCreating(false);
    resetForm();
  };

  const handleLoadPresets = () => {
    setIsLoadingPresets(true);
    loadPresetsMutation.mutate();
    setIsLoadingPresets(false);
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading templates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Email Templates</h3>
          <p className="text-sm text-gray-600">
            Create reusable email templates for candidate outreach. Use variables like {"{name}"}, {"{position}"}, {"{company}"} for personalization.
          </p>
        </div>
        <div className="flex gap-2">
          {templates.length === 0 && (
            <Button 
              variant="outline" 
              onClick={handleLoadPresets}
              disabled={isLoadingPresets || loadPresetsMutation.isPending}
            >
              <Download className="w-4 h-4 mr-2" />
              Load Preset Templates
            </Button>
          )}
          <Button onClick={() => setIsCreating(true)} disabled={isCreating || !!editingTemplate}>
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {(isCreating || editingTemplate) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingTemplate ? 'Edit Template' : 'Create New Template'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Interview Invitation"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="rejection">Rejection</SelectItem>
                    <SelectItem value="followup">Follow-up</SelectItem>
                    <SelectItem value="status">Status Update</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., Interview Invitation for {position} at {company}"
              />
            </div>
            
            <div>
              <Label htmlFor="content">Email Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Hi {name},&#10;&#10;Thank you for your application for the {position} role at {company}..."
                rows={8}
              />
              <p className="text-xs text-gray-500 mt-1">
                Available variables: {"{name}"}, {"{position}"}, {"{company}"}, {"{email}"}, {"{phone}"}
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!formData.name || !formData.subject || !formData.content}>
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription>{template.subject}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{template.category}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(template)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteTemplateMutation.mutate(template.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 mb-2">
                {template.content.substring(0, 150)}...
              </div>
              {template.variables && template.variables.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {template.variables.map((variable) => (
                    <Badge key={variable} variant="outline" className="text-xs">
                      {variable}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && !isCreating && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 mb-4">No email templates created yet.</p>
            <p className="text-sm text-gray-400 mb-6">
              Get started quickly with our preset templates or create your own from scratch.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleLoadPresets} disabled={isLoadingPresets || loadPresetsMutation.isPending}>
                <Download className="w-4 h-4 mr-2" />
                Load Preset Templates
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Custom Template
              </Button>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Preset templates include: Interview Request, Application Received, Under Review, Rejection, and Follow-up
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
