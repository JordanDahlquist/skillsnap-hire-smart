
import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface FieldValidation {
  value: string;
  error: string;
  isValid: boolean;
}

export const useInputValidation = () => {
  const [fields, setFields] = useState<Record<string, FieldValidation>>({});

  const sanitizeInput = useCallback((input: string): string => {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential XSS characters
      .replace(/\s+/g, ' '); // Normalize whitespace
  }, []);

  const validateField = useCallback((
    name: string,
    value: string,
    rules: ValidationRule
  ): FieldValidation => {
    const sanitizedValue = sanitizeInput(value);
    let error = '';

    if (rules.required && !sanitizedValue) {
      error = 'This field is required';
    } else if (rules.minLength && sanitizedValue.length < rules.minLength) {
      error = `Minimum ${rules.minLength} characters required`;
    } else if (rules.maxLength && sanitizedValue.length > rules.maxLength) {
      error = `Maximum ${rules.maxLength} characters allowed`;
    } else if (rules.pattern && !rules.pattern.test(sanitizedValue)) {
      error = 'Invalid format';
    } else if (rules.custom) {
      const customError = rules.custom(sanitizedValue);
      if (customError) error = customError;
    }

    const fieldValidation: FieldValidation = {
      value: sanitizedValue,
      error,
      isValid: !error
    };

    setFields(prev => ({
      ...prev,
      [name]: fieldValidation
    }));

    return fieldValidation;
  }, [sanitizeInput]);

  const getFieldValidation = useCallback((name: string): FieldValidation => {
    return fields[name] || { value: '', error: '', isValid: true };
  }, [fields]);

  const isFormValid = useCallback((fieldNames: string[]): boolean => {
    return fieldNames.every(name => {
      const field = fields[name];
      return field && field.isValid;
    });
  }, [fields]);

  const clearValidation = useCallback(() => {
    setFields({});
  }, []);

  return {
    validateField,
    getFieldValidation,
    isFormValid,
    clearValidation,
    sanitizeInput
  };
};

// Common validation rules
export const validationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Please enter a valid email address';
      }
      return null;
    }
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s'-]+$/,
    custom: (value: string) => {
      if (value && !/^[a-zA-Z\s'-]+$/.test(value)) {
        return 'Name can only contain letters, spaces, hyphens, and apostrophes';
      }
      return null;
    }
  },
  phone: {
    pattern: /^[\+]?[\d\s\-\(\)]+$/,
    custom: (value: string) => {
      if (value && !/^[\+]?[\d\s\-\(\)]+$/.test(value)) {
        return 'Please enter a valid phone number';
      }
      return null;
    }
  },
  url: {
    pattern: /^https?:\/\/.+/,
    custom: (value: string) => {
      if (value && !/^https?:\/\/.+/.test(value)) {
        return 'Please enter a valid URL starting with http:// or https://';
      }
      return null;
    }
  },
  text: {
    maxLength: 2000,
    custom: (value: string) => {
      // Check for potential script injection
      if (value && /<script/i.test(value)) {
        return 'Invalid content detected';
      }
      return null;
    }
  }
};
