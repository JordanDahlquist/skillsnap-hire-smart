
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
        <Button onClick={() => setIsCreating(true)} disabled={isCreating || editingTemplate}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
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
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
