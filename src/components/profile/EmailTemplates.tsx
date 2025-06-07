import React, { useState, useEffect } from 'react';
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
import { Trash2, Edit2, Plus, Save, X } from 'lucide-react';
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

Thank you for taking the time to interview for the {position} role at {company}. It was great getting to know you and learning more about your background.

We're currently reviewing all candidates and will have a decision within the next few days. We'll be in touch soon with an update on next steps.

Thank you again for your interest in joining our team!

Best regards,
{company} Team`,
    category: "followup"
  },
  // New rejection templates for each specific reason
  {
    name: "Rejection - Insufficient Experience",
    subject: "Update on Your Application - {position} at {company}",
    content: `Hi {name},

Thank you for your interest in the {position} role at {company} and for taking the time to apply.

After careful review of your application, we've determined that we're looking for a candidate with more extensive experience in the specific areas required for this position.

While your background shows promise, we believe this particular role requires additional years of hands-on experience that would better match our current project needs.

We encourage you to continue developing your skills and consider applying for future opportunities that match your experience level. We'll keep your information on file for roles that may be a better fit.

We wish you the best of luck in your job search!

Best regards,
{company} Team`,
    category: "rejection"
  },
  {
    name: "Rejection - Skills Mismatch",
    subject: "Update on Your Application - {position} at {company}",
    content: `Hi {name},

Thank you for your interest in the {position} role at {company} and for taking the time to apply.

After reviewing your application, we found that while you have impressive qualifications, your skill set doesn't closely align with the specific technical requirements we're looking for in this position.

We're seeking someone with more specialized experience in the particular technologies and methodologies that are central to this role.

We encourage you to apply for future opportunities where your skills might be a better match. We'll keep your information on file and reach out if a suitable position becomes available.

We appreciate your interest in our company and wish you success in your job search!

Best regards,
{company} Team`,
    category: "rejection"
  },
  {
    name: "Rejection - Unsuccessful Assessment",
    subject: "Update on Your Application - {position} at {company}",
    content: `Hi {name},

Thank you for your interest in the {position} role at {company} and for completing our assessment process.

After reviewing your assessment results, we've decided to move forward with other candidates whose performance more closely aligned with our requirements for this position.

We appreciate the time and effort you put into the assessment and encourage you to continue honing your skills in these areas.

We'll keep your information on file and encourage you to apply for future opportunities that may be a better fit for your background.

We wish you the best of luck in your job search!

Best regards,
{company} Team`,
    category: "rejection"
  },
  {
    name: "Rejection - Unsuccessful Interview",
    subject: "Update on Your Application - {position} at {company}",
    content: `Hi {name},

Thank you for taking the time to interview with us for the {position} role at {company}. We enjoyed our conversation and learning more about your background.

After careful consideration of all candidates, we've decided to move forward with someone whose experience and interview responses more closely matched what we're looking for in this position.

We appreciate your professionalism throughout the interview process and encourage you to apply for future roles that might be a better fit.

We'll keep your information on file and wish you continued success in your career!

Best regards,
{company} Team`,
    category: "rejection"
  },
  {
    name: "Rejection - Overqualified",
    subject: "Update on Your Application - {position} at {company}",
    content: `Hi {name},

Thank you for your interest in the {position} role at {company} and for taking the time to apply.

After reviewing your impressive background and qualifications, we feel that you may be overqualified for this particular position. We're concerned that the role might not provide the level of challenge and growth opportunities that someone with your experience would be seeking.

We believe you would be better suited for more senior positions that could fully utilize your expertise and provide appropriate career advancement.

We encourage you to keep an eye on our career page for senior-level opportunities that might be a better match for your qualifications.

Thank you for considering {company}, and we wish you success in finding a role that matches your experience level!

Best regards,
{company} Team`,
    category: "rejection"
  },
  {
    name: "Rejection - Location Requirements",
    subject: "Update on Your Application - {position} at {company}",
    content: `Hi {name},

Thank you for your interest in the {position} role at {company} and for taking the time to apply.

After reviewing your application, we found that while your qualifications are impressive, your location doesn't align with our requirements for this particular position.

This role requires someone who can work from our specific location or within a certain geographic area for collaboration and operational needs that we cannot accommodate remotely.

We encourage you to apply for future remote opportunities or positions in locations that work better for your situation. We'll keep your information on file for roles that might be a better geographic fit.

We appreciate your interest in our company and wish you success in your job search!

Best regards,
{company} Team`,
    category: "rejection"
  },
  {
    name: "Rejection - Salary Expectations",
    subject: "Update on Your Application - {position} at {company}",
    content: `Hi {name},

Thank you for your interest in the {position} role at {company} and for taking the time to apply.

After reviewing your application and discussing compensation expectations, we found that there's a significant gap between what you're seeking and our budget for this position.

While we recognize the value of your experience, we're unable to meet your salary requirements within our current budget constraints for this role.

We encourage you to apply for future opportunities where compensation might be more aligned with your expectations. We'll keep your information on file for senior positions that may offer compensation packages more in line with what you're seeking.

We appreciate your understanding and wish you success in finding a role that meets your financial goals!

Best regards,
{company} Team`,
    category: "rejection"
  },
  {
    name: "Rejection - Poor Application Quality",
    subject: "Update on Your Application - {position} at {company}",
    content: `Hi {name},

Thank you for your interest in the {position} role at {company} and for taking the time to apply.

After reviewing your application, we found that it didn't meet the standards we're looking for in terms of completeness and attention to detail.

We encourage you to take more time with future applications to ensure they fully showcase your qualifications and demonstrate your attention to detail and communication skills.

We appreciate your interest in our company and encourage you to apply again in the future with a more comprehensive application.

We wish you success in your job search!

Best regards,
{company} Team`,
    category: "rejection"
  },
  {
    name: "Rejection - Position Filled",
    subject: "Update on Your Application - {position} at {company}",
    content: `Hi {name},

Thank you for your interest in the {position} role at {company} and for taking the time to apply.

We wanted to let you know that we have filled this position with another candidate. The decision was difficult as we received many qualified applications, including yours.

We were impressed with your background and encourage you to apply for future opportunities that match your skills and interests. We'll keep your information on file and reach out if a suitable position becomes available.

Thank you for your interest in joining our team, and we wish you the best of luck in your job search!

Best regards,
{company} Team`,
    category: "rejection"
  },
  {
    name: "Rejection - Other",
    subject: "Update on Your Application - {position} at {company}",
    content: `Hi {name},

Thank you for your interest in the {position} role at {company} and for taking the time to apply.

After careful consideration, we've decided to move forward with other candidates for this position.

We appreciate the time you invested in the application process and encourage you to apply for future opportunities that may be a better fit.

We'll keep your information on file and wish you continued success in your career search!

Best regards,
{company} Team`,
    category: "rejection"
  }
];

export const EmailTemplates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'general'
  });

  // Fetch email templates with consistent ordering
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as EmailTemplate[];
    },
    enabled: !!user,
  });

  // Initialize missing preset templates
  const initializeMissingTemplatesMutation = useMutation({
    mutationFn: async () => {
      // Get existing template names to compare
      const existingTemplateNames = templates.map(t => t.name);
      
      // Find missing preset templates
      const missingTemplates = PRESET_TEMPLATES.filter(
        preset => !existingTemplateNames.includes(preset.name)
      );

      if (missingTemplates.length === 0) {
        return [];
      }

      console.log('Adding missing templates:', missingTemplates.map(t => t.name));

      const templatesToInsert = missingTemplates.map(preset => ({
        ...preset,
        user_id: user?.id,
        variables: extractVariables(preset.content)
      }));

      const { data, error } = await supabase
        .from('email_templates')
        .insert(templatesToInsert)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (newTemplates) => {
      if (newTemplates && newTemplates.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['email-templates'] });
        toast({
          title: "Templates Added",
          description: `Added ${newTemplates.length} missing email templates.`,
        });
      }
    },
    onError: (error) => {
      console.error('Error adding missing templates:', error);
      toast({
        title: "Error",
        description: "Failed to add missing email templates.",
        variant: "destructive",
      });
    }
  });

  // Check for missing templates when user and templates data are available
  useEffect(() => {
    if (user && templates.length > 0 && !isLoading && !initializeMissingTemplatesMutation.isPending) {
      const existingTemplateNames = templates.map(t => t.name);
      const missingTemplates = PRESET_TEMPLATES.filter(
        preset => !existingTemplateNames.includes(preset.name)
      );
      
      if (missingTemplates.length > 0) {
        console.log('Found missing templates, initializing...', missingTemplates.map(t => t.name));
        initializeMissingTemplatesMutation.mutate();
      }
    }
  }, [user, templates, isLoading]);

  // Auto-initialize preset templates for completely new users (no templates at all)
  const initializeAllPresetsMutation = useMutation({
    mutationFn: async () => {
      const presetsToInsert = PRESET_TEMPLATES.map(preset => ({
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    }
  });

  // Auto-initialize preset templates when user has none at all
  useEffect(() => {
    if (user && templates.length === 0 && !isLoading) {
      initializeAllPresetsMutation.mutate();
    }
  }, [user, templates.length, isLoading]);

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

  // Update template mutation - removed manual updated_at override
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, ...templateData }: any) => {
      const { data, error } = await supabase
        .from('email_templates')
        .update({
          ...templateData,
          variables: extractVariables(templateData.content)
          // Removed: updated_at: new Date().toISOString()
          // Let Supabase handle updated_at automatically
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
        <Button onClick={() => setIsCreating(true)} disabled={isCreating || !!editingTemplate}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Show loading state when adding missing templates */}
      {initializeMissingTemplatesMutation.isPending && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 mb-4">Adding missing email templates...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </CardContent>
        </Card>
      )}

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
                    <SelectItem value="other">Other</SelectItem>
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

      {templates.length === 0 && !isCreating && !initializeAllPresetsMutation.isPending && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 mb-4">Setting up your email templates...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
