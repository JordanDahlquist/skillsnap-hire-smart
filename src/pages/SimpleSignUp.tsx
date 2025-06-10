
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

const HIRING_GOALS = [
  "Reduce time to hire",
  "Improve candidate quality",
  "Scale hiring process",
  "Reduce hiring costs",
  "Better candidate experience",
  "Streamline interview process"
];

const HIRING_VOLUMES = [
  "1-5 per month",
  "6-15 per month",
  "16-30 per month",
  "31-50 per month",
  "50+ per month",
  "Seasonal/Project-based"
];

const CURRENT_TOOLS = [
  "Indeed",
  "LinkedIn Recruiter",
  "ZipRecruiter",
  "Glassdoor",
  "AngelList",
  "Manual process",
  "Other ATS",
  "None"
];

const BIGGEST_CHALLENGES = [
  "Too many unqualified applicants",
  "Time-consuming screening process",
  "Difficulty assessing technical skills",
  "Scheduling interviews",
  "Poor candidate communication",
  "Lack of hiring data/insights",
  "High cost per hire",
  "Long time to fill positions"
];

const SimpleSignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    companyName: "",
    companySize: "",
    industry: "",
    jobTitle: "",
    hiringGoals: [] as string[],
    hiresPerMonth: "",
    currentTools: [] as string[],
    biggestChallenges: [] as string[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordRequirements = [
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
    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = "Job title is required";
    }
    if (formData.hiringGoals.length === 0) {
      newErrors.hiringGoals = "Please select at least one hiring goal";
    }
    if (!formData.hiresPerMonth) {
      newErrors.hiresPerMonth = "Please select hiring volume";
    }
    if (formData.currentTools.length === 0) {
      newErrors.currentTools = "Please select at least one current tool";
    }
    if (formData.biggestChallenges.length === 0) {
      newErrors.biggestChallenges = "Please select at least one challenge";
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

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field as keyof typeof prev] as string[]), value]
        : (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
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
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.fullName,
            company_name: formData.companyName,
            company_size: formData.companySize,
            industry: formData.industry,
            job_title: formData.jobTitle,
            hiring_goals: formData.hiringGoals,
            hires_per_month: formData.hiresPerMonth,
            current_tools: formData.currentTools,
            biggest_challenges: formData.biggestChallenges,
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        throw error;
      }

      console.log('Account created successfully:', data);
      
      toast({
        title: "Account created successfully!",
        description: "Welcome to Atract. You'll be redirected to your dashboard shortly.",
      });

      // Small delay then redirect
      setTimeout(() => {
        navigate('/jobs');
      }, 1500);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Start Your Free Trial
          </h1>
          <p className="text-gray-600">
            Join 500+ companies hiring smarter with Atract
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
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
                      onChange={(e) => handleInputChange('email', e.target.value)}
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
                        onChange={(e) => handleInputChange('password', e.target.value)}
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
                    
                    {formData.password && (
                      <div className="mt-2 space-y-1">
                        {passwordRequirements.map((req, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            {req.met ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <X className="w-3 h-3 text-gray-300" />
                            )}
                            <span className={req.met ? "text-green-600" : "text-gray-500"}>
                              {req.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
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
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className={cn(errors.companyName && "border-red-500")}
                      placeholder="Your company name"
                      disabled={isLoading}
                    />
                    {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="companySize">Company Size</Label>
                    <Select value={formData.companySize} onValueChange={(value) => handleInputChange('companySize', value)} disabled={isLoading}>
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
                    <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)} disabled={isLoading}>
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
                      onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                      className={cn(errors.jobTitle && "border-red-500")}
                      placeholder="e.g. HR Manager, CEO, Recruiter"
                      disabled={isLoading}
                    />
                    {errors.jobTitle && <p className="text-red-500 text-sm mt-1">{errors.jobTitle}</p>}
                  </div>
                </div>
              </div>

              {/* Hiring Preferences */}
              <div className="space-y-6 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900">Hiring Preferences</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Main hiring goals (select all that apply)
                    </Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {HIRING_GOALS.map((goal) => (
                        <div key={goal} className="flex items-center space-x-2">
                          <Checkbox
                            id={goal}
                            checked={formData.hiringGoals.includes(goal)}
                            onCheckedChange={(checked) => handleCheckboxChange('hiringGoals', goal, !!checked)}
                            disabled={isLoading}
                          />
                          <Label htmlFor={goal} className="text-sm cursor-pointer">{goal}</Label>
                        </div>
                      ))}
                    </div>
                    {errors.hiringGoals && <p className="text-red-500 text-sm mt-1">{errors.hiringGoals}</p>}
                  </div>

                  <div>
                    <Label htmlFor="hiresPerMonth">Typical hiring volume</Label>
                    <Select value={formData.hiresPerMonth} onValueChange={(value) => handleInputChange('hiresPerMonth', value)} disabled={isLoading}>
                      <SelectTrigger className={cn(errors.hiresPerMonth && "border-red-500")}>
                        <SelectValue placeholder="Select hiring volume" />
                      </SelectTrigger>
                      <SelectContent>
                        {HIRING_VOLUMES.map((volume) => (
                          <SelectItem key={volume} value={volume}>{volume}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.hiresPerMonth && <p className="text-red-500 text-sm mt-1">{errors.hiresPerMonth}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Current recruiting tools (select all that apply)
                    </Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {CURRENT_TOOLS.map((tool) => (
                        <div key={tool} className="flex items-center space-x-2">
                          <Checkbox
                            id={tool}
                            checked={formData.currentTools.includes(tool)}
                            onCheckedChange={(checked) => handleCheckboxChange('currentTools', tool, !!checked)}
                            disabled={isLoading}
                          />
                          <Label htmlFor={tool} className="text-sm cursor-pointer">{tool}</Label>
                        </div>
                      ))}
                    </div>
                    {errors.currentTools && <p className="text-red-500 text-sm mt-1">{errors.currentTools}</p>}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Biggest hiring challenges (select all that apply)
                    </Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {BIGGEST_CHALLENGES.map((challenge) => (
                        <div key={challenge} className="flex items-center space-x-2">
                          <Checkbox
                            id={challenge}
                            checked={formData.biggestChallenges.includes(challenge)}
                            onCheckedChange={(checked) => handleCheckboxChange('biggestChallenges', challenge, !!checked)}
                            disabled={isLoading}
                          />
                          <Label htmlFor={challenge} className="text-sm cursor-pointer">{challenge}</Label>
                        </div>
                      ))}
                    </div>
                    {errors.biggestChallenges && <p className="text-red-500 text-sm mt-1">{errors.biggestChallenges}</p>}
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-6">
                <Button
                  type="submit"
                  className="w-full max-w-md py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Your Account..." : "Create Account & Start Free Trial"}
                </Button>
              </div>
            </form>

            <p className="text-xs text-gray-500 text-center mt-6">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>

            <div className="text-center mt-6">
              <span className="text-sm text-gray-500">
                Already have an account?{" "}
                <button
                  onClick={() => navigate('/auth')}
                  className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                  disabled={isLoading}
                >
                  Sign in
                </button>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimpleSignUp;
