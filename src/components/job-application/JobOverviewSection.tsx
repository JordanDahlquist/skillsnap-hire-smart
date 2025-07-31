
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, DollarSign, Target, Users } from "lucide-react";
import { Job } from "@/types";
import { parseMarkdown } from "@/utils/markdownParser";

interface JobOverviewSectionProps {
  job: Job;
  onContinue: () => void;
}

export const JobOverviewSection = ({ job, onContinue }: JobOverviewSectionProps) => {
  const getLocationDisplay = () => {
    const { location_type, country, state, city } = job;
    
    if (location_type === 'remote') {
      return country ? `Remote (${country})` : 'Remote';
    }
    
    if (country === 'United States' && state) {
      return [city, state].filter(Boolean).join(', ');
    }
    
    return [city, country].filter(Boolean).join(', ') || 'Not specified';
  };

  const isJobActive = job.status === 'active';

  return (
    <div className="space-y-8">
      {/* Job Header */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            {job.title}
          </CardTitle>
          {job.company_name && (
            <p className="text-xl text-gray-700 mb-4">{job.company_name}</p>
          )}
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-700">
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
        </CardHeader>
      </Card>

      {/* Job Description */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            About This Position
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-gray max-w-none">
            {job.generated_job_post ? (
              <div 
                className="text-gray-800 text-left"
                dangerouslySetInnerHTML={{ 
                  __html: parseMarkdown(job.generated_job_post)
                }} 
              />
            ) : (
              <p className="text-gray-800 whitespace-pre-wrap text-left">{job.description}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Required Skills */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Required Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const skills = job.required_skills;
            // Check if skills are formatted as sentences/paragraphs (contains periods or is very long)
            const isSentenceFormat = skills.includes('.') || skills.length > 100 || !skills.includes(',');
            
            if (isSentenceFormat) {
              return (
                <div className="prose prose-gray max-w-none">
                  <div className="text-gray-800 whitespace-pre-wrap text-left">
                    {skills}
                  </div>
                </div>
              );
            } else {
              return (
                <div className="flex flex-wrap gap-2">
                  {skills.split(',').map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-sm border-gray-300 text-gray-800">
                      {skill.trim()}
                    </Badge>
                  ))}
                </div>
              );
            }
          })()}
        </CardContent>
      </Card>

      {/* Application Process */}
      <Card className="bg-blue-50 border border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-blue-900">
            Application Process
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-blue-800 text-left">
            <p>✓ Review job details and requirements</p>
            <p>✓ Provide your personal information and resume</p>
            {job.generated_test && <p>✓ Complete the skills assessment</p>}
            {job.generated_interview_questions && <p>✓ Record video responses to interview questions</p>}
            <p>✓ Review and submit your application</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <button
          onClick={isJobActive ? onContinue : undefined}
          disabled={!isJobActive}
          className={`px-8 py-3 rounded-lg font-medium transition-colors ${
            isJobActive
              ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
              : 'bg-gray-400 text-gray-600 cursor-not-allowed'
          }`}
        >
          {isJobActive ? 'Start Application' : 'Applications Closed'}
        </button>
      </div>
    </div>
  );
};
