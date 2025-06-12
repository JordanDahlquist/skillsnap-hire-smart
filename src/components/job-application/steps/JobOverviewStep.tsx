
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, Users, Target } from "lucide-react";
import { Job } from "@/types";
import { useEffect } from "react";
import { parseMarkdown } from "@/utils/markdownParser";

interface JobOverviewStepProps {
  job: Job;
  onValidationChange: (isValid: boolean) => void;
}

export const JobOverviewStep = ({ job, onValidationChange }: JobOverviewStepProps) => {
  useEffect(() => {
    // This step is always valid as it's just viewing content
    onValidationChange(true);
  }, [onValidationChange]);

  const getLocationDisplay = () => {
    const { location_type, country, state, region, city } = job;
    
    if (location_type === 'remote') {
      if (country) {
        return `Remote (${country})`;
      }
      return 'Remote';
    }
    
    if (country === 'United States' && state) {
      const parts = [city, state, region].filter(Boolean);
      return parts.join(', ');
    }
    
    if (country) {
      const parts = [city, country].filter(Boolean);
      return parts.join(', ');
    }
    
    return location_type ? location_type.charAt(0).toUpperCase() + location_type.slice(1) : 'Not specified';
  };

  return (
    <div className="space-y-8">
      {/* Job Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
        {job.company_name && (
          <p className="text-xl text-gray-600">{job.company_name}</p>
        )}
        
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {getLocationDisplay()}
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            {job.role_type}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {job.experience_level}
          </div>
          {job.budget && (
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {job.budget}
            </div>
          )}
          {job.duration && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {job.duration}
            </div>
          )}
        </div>
      </div>

      {/* Job Description */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">About This Position</h2>
        <div className="prose prose-gray max-w-none">
          {job.generated_job_post ? (
            <div dangerouslySetInnerHTML={{ __html: parseMarkdown(job.generated_job_post) }} />
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
          )}
        </div>
      </div>

      {/* Required Skills */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
        <div className="flex flex-wrap gap-2">
          {job.required_skills.split(',').map((skill, index) => (
            <Badge key={index} variant="outline" className="text-sm">
              {skill.trim()}
            </Badge>
          ))}
        </div>
      </div>

      {/* Application Process Preview */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3 text-blue-900">Application Process</h3>
        <div className="space-y-2 text-blue-800">
          <p>✓ Review job details and requirements</p>
          <p>✓ Provide your personal information and resume</p>
          {job.generated_test && <p>✓ Complete the skills assessment</p>}
          {job.generated_interview_questions && <p>✓ Record video responses to interview questions</p>}
          <p>✓ Review and submit your application</p>
        </div>
      </div>

      <div className="text-center">
        <p className="text-gray-600">
          Ready to apply? Click "Next" to get started with your application.
        </p>
      </div>
    </div>
  );
};
