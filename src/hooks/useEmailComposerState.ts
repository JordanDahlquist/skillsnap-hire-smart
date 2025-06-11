
import { useState, useCallback } from 'react';
import type { EmailFormData, EmailTemplate } from '@/types/emailComposer';

export const useEmailComposerState = () => {
  const [currentStep, setCurrentStep] = useState<'compose' | 'preview' | 'sending'>('compose');
  const [formData, setFormData] = useState<EmailFormData>({
    templateId: '',
    subject: '',
    content: ''
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

  const resetForm = useCallback(() => {
    setFormData({
      templateId: '',
      subject: '',
      content: ''
    });
    setCurrentStep('compose');
  }, []);

  return {
    currentStep,
    setCurrentStep,
    formData,
    updateField,
    selectTemplate,
    resetForm
  };
};
