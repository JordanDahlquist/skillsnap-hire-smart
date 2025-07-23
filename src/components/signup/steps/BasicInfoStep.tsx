
import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { SignUpFormData } from "@/pages/SignUp";
import { cn } from "@/lib/utils";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { AuthDivider } from "@/components/auth/AuthDivider";

interface BasicInfoStepProps {
  formData: SignUpFormData;
  onFormDataChange: (updates: Partial<SignUpFormData>) => void;
  onValidationChange: (isValid: boolean) => void;
  onNext: () => void;
  isLoading?: boolean;
}

export const BasicInfoStep = ({ 
  formData, 
  onFormDataChange, 
  onValidationChange,
  onNext,
  isLoading = false
}: BasicInfoStepProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordRequirements = useMemo(() => [
    { text: "At least 8 characters", met: formData.password.length >= 8 },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(formData.password) },
    { text: "Contains lowercase letter", met: /[a-z]/.test(formData.password) },
    { text: "Contains number", met: /\d/.test(formData.password) },
  ], [formData.password]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!passwordRequirements.every(req => req.met)) {
      newErrors.password = "Password doesn't meet requirements";
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    onValidationChange(isValid);
    return isValid;
  }, [formData.fullName, formData.email, formData.password, onValidationChange, passwordRequirements]);

  // Immediate validation on form data changes
  useEffect(() => {
    if (!isLoading) {
      console.log('BasicInfoStep: Validating form data');
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
          Create Your Account
        </h2>
        <p className="text-gray-600">
          Let's start with your basic information
        </p>
      </div>

      {/* Google Authentication */}
      <div className="mb-6">
        <GoogleAuthButton mode="signup" disabled={isLoading} />
        <AuthDivider />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
            Full Name
          </Label>
          <Input
            id="fullName"
            type="text"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            className={cn(
              "mt-1",
              errors.fullName && "border-red-500 focus-visible:ring-red-500"
            )}
            placeholder="Enter your full name"
            disabled={isLoading}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Work Email
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={cn(
              "mt-1",
              errors.email && "border-red-500 focus-visible:ring-red-500"
            )}
            placeholder="your.email@company.com"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </Label>
          <div className="relative mt-1">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={cn(
                "pr-10",
                errors.password && "border-red-500 focus-visible:ring-red-500"
              )}
              placeholder="Create a strong password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          {/* Password Requirements */}
          {formData.password && (
            <div className="mt-3 space-y-2">
              {passwordRequirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {req.met ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-gray-300" />
                  )}
                  <span className={req.met ? "text-green-600" : "text-gray-500"}>
                    {req.text}
                  </span>
                </div>
              ))}
            </div>
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

      <p className="text-xs text-gray-500 text-center mt-6">
        By creating an account, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
};
