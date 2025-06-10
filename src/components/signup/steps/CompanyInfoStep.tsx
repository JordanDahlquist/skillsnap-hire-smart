
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SignUpFormData } from "@/pages/SignUp";
import { cn } from "@/lib/utils";

interface CompanyInfoStepProps {
  formData: SignUpFormData;
  onFormDataChange: (updates: Partial<SignUpFormData>) => void;
  onValidationChange: (isValid: boolean) => void;
  onNext: () => void;
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
  onNext 
}: CompanyInfoStepProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
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
  };

  useEffect(() => {
    validateForm();
  }, [formData.companyName, formData.companySize, formData.industry, formData.jobTitle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

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
            onChange={(e) => onFormDataChange({ companyName: e.target.value })}
            className={cn(
              "mt-1",
              errors.companyName && "border-red-500 focus-visible:ring-red-500"
            )}
            placeholder="Your company name"
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
            onValueChange={(value) => onFormDataChange({ companySize: value })}
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
            onValueChange={(value) => onFormDataChange({ industry: value })}
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
            onChange={(e) => onFormDataChange({ jobTitle: e.target.value })}
            className={cn(
              "mt-1",
              errors.jobTitle && "border-red-500 focus-visible:ring-red-500"
            )}
            placeholder="e.g. HR Manager, CEO, Recruiter"
          />
          {errors.jobTitle && (
            <p className="text-red-500 text-sm mt-1">{errors.jobTitle}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
          disabled={Object.keys(errors).length > 0}
        >
          Continue
        </Button>
      </form>
    </div>
  );
};
