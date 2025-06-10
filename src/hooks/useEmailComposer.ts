
import { useState, useCallback } from 'react';
import type { EmailFormData, EmailTemplate } from '@/types/emailComposer';

export const useEmailComposer = () => {
  const [formData, setFormData] = useState<EmailFormData>({
    templateId: '',
    subject: '',
    content: '',
    showPreview: false
  });

  const updateField = useCallback((field: keyof EmailFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const selectTemplate = useCallback((template: EmailTemplate) => {
    setFormData(prev => ({
      ...prev,
      templateId: template.id,
      subject: template.subject,
      content: template.content
    }));
  }, []);

  const togglePreview = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      showPreview: !prev.showPreview
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      templateId: '',
      subject: '',
      content: '',
      showPreview: false
    });
  }, []);

  return {
    formData,
    updateField,
    selectTemplate,
    togglePreview,
    resetForm
  };
};
