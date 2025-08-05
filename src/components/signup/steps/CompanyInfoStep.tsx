
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SignUpFormData } from "@/pages/SignUp";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface CompanyInfoStepProps {
  formData: SignUpFormData;
  onFormDataChange: (updates: Partial<SignUpFormData>) => void;
  onValidationChange: (isValid: boolean) => void;
  onNext: () => void;
  isLoading?: boolean;
}

const COMPANY_SIZES = [
  "1-10 employees",
  "11-50 employees", 
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees"
];

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Manufacturing",
  "Consulting",
  "Marketing & Advertising",
  "Real Estate",
  "Non-profit",
  "Other"
];

export const CompanyInfoStep = ({ 
  formData, 
  onFormDataChange, 
  onValidationChange,
  onNext,
  isLoading = false
}: CompanyInfoStepProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checkingCompanyName, setCheckingCompanyName] = useState(false);

  // Check if company name already exists
  const checkCompanyNameAvailability = useCallback(async (companyName: string) => {
    if (!companyName.trim()) return;
    
    setCheckingCompanyName(true);
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('company_name', companyName.trim());
      
      if (error) throw error;
      
      setErrors(prev => {
        const newErrors = { ...prev };
        if (count && count > 0) {
          newErrors.companyName = "This company name is already taken. Please choose a different name.";
        } else {
          delete newErrors.companyName;
        }
        return newErrors;
      });
    } catch (error) {
      console.error('Error checking company name:', error);
    } finally {
      setCheckingCompanyName(false);
    }
  }, []);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!formData.companySize) {
      newErrors.companySize = "Company size is required";
    }

    if (!formData.industry) {
      newErrors.industry = "Industry is required";
    }

    // Clear any existing errors for fields that are now valid
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0 && !checkingCompanyName;
    onValidationChange(isValid);
    return isValid;
  }, [formData.companyName, formData.companySize, formData.industry, checkingCompanyName, onValidationChange]);

  // Check company name availability with debounce
  useEffect(() => {
    if (!formData.companyName.trim()) return;
    
    const timeoutId = setTimeout(() => {
      checkCompanyNameAvailability(formData.companyName);
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [formData.companyName, checkCompanyNameAvailability]);

  // Immediate validation on form data changes
  useEffect(() => {
    if (!isLoading) {
      validateForm();
    }
  }, [validateForm, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading && validateForm()) {
      onNext();
    }
  };

  const handleInputChange = useCallback((field: keyof SignUpFormData, value: string) => {
    if (!isLoading) {
      onFormDataChange({ [field]: value });
    }
  }, [onFormDataChange, isLoading]);

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tell Us About Your Company
        </h2>
        <p className="text-gray-600">
          This helps us personalize your experience
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">
            Company Name
          </Label>
          <Input
            id="companyName"
            type="text"
            value={formData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            className={cn(
              "mt-1",
              errors.companyName && "border-red-500 focus-visible:ring-red-500"
            )}
            placeholder="Your company name"
            disabled={isLoading}
          />
          {errors.companyName && (
            <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
          )}
        </div>

        <div>
          <Label htmlFor="companySize" className="text-sm font-medium text-gray-700">
            Company Size
          </Label>
          <Select 
            value={formData.companySize} 
            onValueChange={(value) => handleInputChange('companySize', value)}
            disabled={isLoading}
          >
            <SelectTrigger className={cn(
              "mt-1",
              errors.companySize && "border-red-500 focus-visible:ring-red-500"
            )}>
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 z-50">
              {COMPANY_SIZES.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.companySize && (
            <p className="text-red-500 text-sm mt-1">{errors.companySize}</p>
          )}
        </div>

        <div>
          <Label htmlFor="industry" className="text-sm font-medium text-gray-700">
            Industry
          </Label>
          <Select 
            value={formData.industry} 
            onValueChange={(value) => handleInputChange('industry', value)}
            disabled={isLoading}
          >
            <SelectTrigger className={cn(
              "mt-1",
              errors.industry && "border-red-500 focus-visible:ring-red-500"
            )}>
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 z-50">
              {INDUSTRIES.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.industry && (
            <p className="text-red-500 text-sm mt-1">{errors.industry}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          disabled={Object.keys(errors).length > 0 || isLoading}
        >
          {isLoading ? "Processing..." : "Continue"}
        </Button>
      </form>
    </div>
  );
};
