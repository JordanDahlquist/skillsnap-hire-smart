
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SignupFormData, PasswordRequirement } from "./types";

export const useSignupForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: "",
    email: "",
    password: "",
    companyName: "",
    companySize: "",
    industry: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordRequirements: PasswordRequirement[] = [
    { text: "At least 8 characters", met: formData.password.length >= 8 },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(formData.password) },
    { text: "Contains lowercase letter", met: /[a-z]/.test(formData.password) },
    { text: "Contains number", met: /\d/.test(formData.password) },
  ];

  const validateForm = () => {
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
    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }
    if (!formData.companySize) {
      newErrors.companySize = "Company size is required";
    }
    if (!formData.industry) {
      newErrors.industry = "Industry is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('Creating account with data:', formData);

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            company_name: formData.companyName,
            company_size: formData.companySize,
            industry: formData.industry
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        throw error;
      }

      console.log('Account created successfully:', data);

      // Send custom confirmation email using edge function
      if (data.user && !data.user.email_confirmed_at) {
        try {
          const confirmationUrl = `${window.location.origin}/confirm-email?email=${encodeURIComponent(formData.email)}&name=${encodeURIComponent(formData.fullName)}`;
          
          const { error: emailError } = await supabase.functions.invoke('send-confirmation-email', {
            body: {
              email: formData.email,
              name: formData.fullName,
              confirmationUrl: confirmationUrl
            }
          });

          if (emailError) {
            console.error('Error sending confirmation email:', emailError);
            // Don't throw here - the account was created successfully
          }
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Don't throw here - the account was created successfully
        }
      }
      
      toast({
        title: "Account created successfully!",
        description: "Please check your email for a beautiful confirmation message.",
      });

      // Redirect to email confirmation page with user details
      const confirmParams = new URLSearchParams({
        email: formData.email,
        name: formData.fullName
      });
      navigate(`/confirm-email?${confirmParams.toString()}`);

    } catch (error: any) {
      console.error('Account creation error:', error);
      toast({
        title: "Account creation failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    errors,
    isLoading,
    passwordRequirements,
    handleInputChange,
    handleSubmit
  };
};
