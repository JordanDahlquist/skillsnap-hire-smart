
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { SignupFormData, COMPANY_SIZES, INDUSTRIES } from "./types";
import { PasswordRequirements } from "./PasswordRequirements";

interface SignupFormFieldsProps {
  formData: SignupFormData;
  errors: Record<string, string>;
  isLoading: boolean;
  passwordRequirements: Array<{ text: string; met: boolean }>;
  onInputChange: (field: string, value: string) => void;
}

export const SignupFormFields = ({
  formData,
  errors,
  isLoading,
  passwordRequirements,
  onInputChange
}: SignupFormFieldsProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
        
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => onInputChange('fullName', e.target.value)}
            className={cn(errors.fullName && "border-red-500")}
            placeholder="Enter your full name"
            disabled={isLoading}
          />
          {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
        </div>

        <div>
          <Label htmlFor="email">Work Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            className={cn(errors.email && "border-red-500")}
            placeholder="your.email@company.com"
            disabled={isLoading}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => onInputChange('password', e.target.value)}
              className={cn("pr-10", errors.password && "border-red-500")}
              placeholder="Create a strong password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          <PasswordRequirements 
            password={formData.password} 
            requirements={passwordRequirements} 
          />
        </div>
      </div>

      {/* Company Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
        
        <div>
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => onInputChange('companyName', e.target.value)}
            className={cn(errors.companyName && "border-red-500")}
            placeholder="Your company name"
            disabled={isLoading}
          />
          {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
        </div>

        <div>
          <Label htmlFor="companySize">Company Size</Label>
          <Select value={formData.companySize} onValueChange={(value) => onInputChange('companySize', value)} disabled={isLoading}>
            <SelectTrigger className={cn(errors.companySize && "border-red-500")}>
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              {COMPANY_SIZES.map((size) => (
                <SelectItem key={size} value={size}>{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.companySize && <p className="text-red-500 text-sm mt-1">{errors.companySize}</p>}
        </div>

        <div>
          <Label htmlFor="industry">Industry</Label>
          <Select value={formData.industry} onValueChange={(value) => onInputChange('industry', value)} disabled={isLoading}>
            <SelectTrigger className={cn(errors.industry && "border-red-500")}>
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((industry) => (
                <SelectItem key={industry} value={industry}>{industry}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.industry && <p className="text-red-500 text-sm mt-1">{errors.industry}</p>}
        </div>

        <div>
          <Label htmlFor="jobTitle">Your Job Title</Label>
          <Input
            id="jobTitle"
            value={formData.jobTitle}
            onChange={(e) => onInputChange('jobTitle', e.target.value)}
            className={cn(errors.jobTitle && "border-red-500")}
            placeholder="e.g. HR Manager, CEO, Recruiter"
            disabled={isLoading}
          />
          {errors.jobTitle && <p className="text-red-500 text-sm mt-1">{errors.jobTitle}</p>}
        </div>
      </div>
    </div>
  );
};
