
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { SignUpFormData } from "@/pages/SignUp";

interface UseCaseStepProps {
  formData: SignUpFormData;
  onFormDataChange: (updates: Partial<SignUpFormData>) => void;
  onValidationChange: (isValid: boolean) => void;
  onNext: () => void;
}

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

export const UseCaseStep = ({ 
  formData, 
  onFormDataChange, 
  onValidationChange,
  onNext 
}: UseCaseStepProps) => {
  const validateForm = useCallback(() => {
    const isValid = formData.hiringGoals.length > 0 && 
                   formData.hiresPerMonth !== "" &&
                   formData.currentTools.length > 0 &&
                   formData.biggestChallenges.length > 0;
    
    onValidationChange(isValid);
    return isValid;
  }, [formData.hiringGoals, formData.hiresPerMonth, formData.currentTools, formData.biggestChallenges, onValidationChange]);

  useEffect(() => {
    validateForm();
  }, [validateForm]);

  const handleGoalChange = (goal: string, checked: boolean) => {
    const newGoals = checked 
      ? [...formData.hiringGoals, goal]
      : formData.hiringGoals.filter(g => g !== goal);
    onFormDataChange({ hiringGoals: newGoals });
  };

  const handleToolChange = (tool: string, checked: boolean) => {
    const newTools = checked 
      ? [...formData.currentTools, tool]
      : formData.currentTools.filter(t => t !== tool);
    onFormDataChange({ currentTools: newTools });
  };

  const handleChallengeChange = (challenge: string, checked: boolean) => {
    const newChallenges = checked 
      ? [...formData.biggestChallenges, challenge]
      : formData.biggestChallenges.filter(c => c !== challenge);
    onFormDataChange({ biggestChallenges: newChallenges });
  };

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
          Let's Understand Your Hiring Needs
        </h2>
        <p className="text-gray-600">
          This helps us tailor Atract to your specific requirements
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Hiring Goals */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            What are your main hiring goals? (Select all that apply)
          </Label>
          <div className="grid grid-cols-1 gap-3">
            {HIRING_GOALS.map((goal) => (
              <div key={goal} className="flex items-center space-x-3">
                <Checkbox
                  id={goal}
                  checked={formData.hiringGoals.includes(goal)}
                  onCheckedChange={(checked) => handleGoalChange(goal, !!checked)}
                />
                <Label htmlFor={goal} className="text-sm text-gray-700 cursor-pointer">
                  {goal}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Hiring Volume */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            How many people do you typically hire?
          </Label>
          <Select 
            value={formData.hiresPerMonth} 
            onValueChange={(value) => onFormDataChange({ hiresPerMonth: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select hiring volume" />
            </SelectTrigger>
            <SelectContent>
              {HIRING_VOLUMES.map((volume) => (
                <SelectItem key={volume} value={volume}>
                  {volume}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Current Tools */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            What recruiting tools do you currently use? (Select all that apply)
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {CURRENT_TOOLS.map((tool) => (
              <div key={tool} className="flex items-center space-x-3">
                <Checkbox
                  id={tool}
                  checked={formData.currentTools.includes(tool)}
                  onCheckedChange={(checked) => handleToolChange(tool, !!checked)}
                />
                <Label htmlFor={tool} className="text-sm text-gray-700 cursor-pointer">
                  {tool}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Biggest Challenges */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            What are your biggest hiring challenges? (Select all that apply)
          </Label>
          <div className="grid grid-cols-1 gap-3">
            {BIGGEST_CHALLENGES.map((challenge) => (
              <div key={challenge} className="flex items-center space-x-3">
                <Checkbox
                  id={challenge}
                  checked={formData.biggestChallenges.includes(challenge)}
                  onCheckedChange={(checked) => handleChallengeChange(challenge, !!checked)}
                />
                <Label htmlFor={challenge} className="text-sm text-gray-700 cursor-pointer">
                  {challenge}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
          disabled={!validateForm()}
        >
          Continue
        </Button>
      </form>
    </div>
  );
};
