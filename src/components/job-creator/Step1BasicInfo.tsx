
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UnifiedJobFormData, UnifiedJobCreatorActions } from "@/types/jobForm";
import { Info } from "lucide-react";

interface Step1BasicInfoProps {
  formData: UnifiedJobFormData;
  actions: UnifiedJobCreatorActions;
}

export const Step1BasicInfo = ({
  formData,
  actions
}: Step1BasicInfoProps) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Basic Job Information</CardTitle>
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">How it works:</p>
            <p>Step 1: Enter basic details • Step 2: AI generates professional job posting • Step 3: Create skills test • Step 4: Add interview questions • Step 5: Review & publish</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 h-full overflow-y-auto">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="title" className="text-sm">Job Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => actions.updateFormData('title', e.target.value)}
              placeholder="e.g. Senior React Developer"
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="employmentType" className="text-sm">Employment Type</Label>
            <Select value={formData.employmentType} onValueChange={(value) => actions.updateFormData('employmentType', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="project">Project</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description" className="text-sm">AI Generation Prompt</Label>
          <p className="text-xs text-gray-500 mb-1">
            Enter any unique requirements, special skills, or key details that will help our AI create a tailored job description. This is optional - basic details work great too!
          </p>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => actions.updateFormData('description', e.target.value)}
            placeholder="e.g. Must have experience with GraphQL, remote-first culture, startup environment, experience with microservices..."
            rows={4}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label htmlFor="experienceLevel" className="text-sm">Experience Level</Label>
            <Select value={formData.experienceLevel} onValueChange={(value) => actions.updateFormData('experienceLevel', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry-level">Entry Level</SelectItem>
                <SelectItem value="mid-level">Mid Level</SelectItem>
                <SelectItem value="senior-level">Senior Level</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="budget" className="text-sm">Budget</Label>
            <Input
              id="budget"
              value={formData.budget}
              onChange={(e) => actions.updateFormData('budget', e.target.value)}
              placeholder="$50-100/hr"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="duration" className="text-sm">Duration</Label>
            <Input
              id="duration"
              value={formData.duration}
              onChange={(e) => actions.updateFormData('duration', e.target.value)}
              placeholder="3 months"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="skills" className="text-sm">Required Skills</Label>
          <Input
            id="skills"
            value={formData.skills}
            onChange={(e) => actions.updateFormData('skills', e.target.value)}
            placeholder="React, TypeScript, Node.js..."
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="location" className="text-sm">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => actions.updateFormData('location', e.target.value)}
            placeholder="Remote, New York, etc."
            className="mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );
};
