
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SignUpFormData } from "@/pages/SignUp";
import { cn } from "@/lib/utils";
import { useDebounceValidation } from "@/hooks/useDebounceValidation";

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

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = "Job title is required";
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    onValidationChange(isValid);
    return isValid;
  }, [formData.companyName, formData.companySize, formData.industry, formData.jobTitle, onValidationChange]);

  const { debouncedValidate, clearDebounce } = useDebounceValidation(validateForm, 300);

  useEffect(() => {
    if (!isLoading) {
      debouncedValidate();
    }
    return () => clearDebounce();
  }, [debouncedValidate, clearDebounce, isLoading]);

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
            <SelectContent>
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
            <SelectContent>
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

        <div>
          <Label htmlFor="jobTitle" className="text-sm font-medium text-gray-700">
            Your Job Title
          </Label>
          <Input
            id="jobTitle"
            type="text"
            value={formData.jobTitle}
            onChange={(e) => handleInputChange('jobTitle', e.target.value)}
            className={cn(
              "mt-1",
              errors.jobTitle && "border-red-500 focus-visible:ring-red-500"
            )}
            placeholder="e.g. HR Manager, CEO, Recruiter"
            disabled={isLoading}
          />
          {errors.jobTitle && (
            <p className="text-red-500 text-sm mt-1">{errors.jobTitle}</p>
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
