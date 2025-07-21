import { useEffect, useState } from "react";
import { Application } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CheckCircle, User, Briefcase, GraduationCap, BookOpen, Link, Github, AlertTriangle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { constructResumeUrl } from "@/utils/resumeUploadUtils";
import { ExternalLink } from "@/components/icons/external-link";
import { AIAnalysisService } from "@/services/aiAnalysisService";
import { DASHBOARD_ACTION_CONSTANTS } from "@/constants/dashboardActions";
import { ResumeProcessingDiagnostic } from "@/components/ResumeProcessingDiagnostic";

interface ApplicationDetailContentProps {
  application: Application;
  onUpdate: () => void;
}

export const ApplicationDetailContent = ({ application, onUpdate }: ApplicationDetailContentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyzeApplication = async () => {
    setIsLoading(true);
    try {
      const jobData = {
        title: application.job_title || 'Unknown Job',
        description: application.job_description || 'No description',
        role_type: application.job_role_type || 'Unknown',
        experience_level: application.job_experience_level || 'Entry',
        required_skills: application.job_required_skills || 'None',
        employment_type: application.job_employment_type || 'Full-time',
        company_name: application.job_company_name || 'Unknown Company'
      };

      const result = await AIAnalysisService.analyzeApplication(application, jobData);
      if (result.success) {
        toast({
          title: "AI Analysis Complete",
          description: "The application has been analyzed and updated.",
        });
        onUpdate();
      } else {
        toast({
          title: "AI Analysis Failed",
          description: result.error || "Failed to analyze application",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error analyzing application:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during analysis.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReprocessComplete = () => {
    // Refresh the application data
    onUpdate();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <p className="text-sm text-gray-600">{application.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-gray-600">{application.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <p className="text-sm text-gray-600">{application.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <p className="text-sm text-gray-600">{application.location || 'Not provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resume Processing Diagnostic */}
          <ResumeProcessingDiagnostic
            applicationId={application.id}
            resumeFilePath={application.resume_file_path}
            parsedResumeData={application.parsed_resume_data}
            onReprocessComplete={handleReprocessComplete}
          />

          {/* Skills */}
          {application.skills && application.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {application.skills.map((skill: any, index: number) => (
                    <Badge key={index}>{typeof skill === 'string' ? skill : skill.name || skill.skill || 'Unknown Skill'}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Work Experience */}
          {application.work_experience && application.work_experience.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {application.work_experience.map((experience: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <p className="text-sm font-medium">{experience.title || experience.position || 'Unknown Position'} at {experience.company || experience.employer || 'Unknown Company'}</p>
                    <p className="text-xs text-gray-500">{experience.start_date || experience.startDate || 'Unknown'} - {experience.end_date || experience.endDate || 'Present'}</p>
                    <p className="text-sm text-gray-600">{experience.description || 'No description provided'}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {application.education && application.education.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {application.education.map((education: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <p className="text-sm font-medium">{education.degree || 'Unknown Degree'} in {education.field || education.major || 'Unknown Field'} from {education.institution || education.school || 'Unknown Institution'}</p>
                    <p className="text-xs text-gray-500">Graduated: {education.year || education.graduation_year || 'Unknown'}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {application.portfolio_url && (
                <div>
                  <label className="text-sm font-medium">Portfolio URL</label>
                  <p className="text-sm text-gray-600">
                    <a href={application.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                      {application.portfolio_url}
                      <ExternalLink className="w-4 h-4 text-gray-500" />
                    </a>
                  </p>
                </div>
              )}
              {application.linkedin_url && (
                <div>
                  <label className="text-sm font-medium">LinkedIn URL</label>
                  <p className="text-sm text-gray-600">
                    <a href={application.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                      {application.linkedin_url}
                      <ExternalLink className="w-4 h-4 text-gray-500" />
                    </a>
                  </p>
                </div>
              )}
              {application.github_url && (
                <div>
                  <label className="text-sm font-medium">GitHub URL</label>
                  <p className="text-sm text-gray-600">
                    <a href={application.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                      {application.github_url}
                      <ExternalLink className="w-4 h-4 text-gray-500" />
                    </a>
                  </p>
                </div>
              )}
              {application.cover_letter && (
                <div>
                  <label className="text-sm font-medium">Cover Letter</label>
                  <p className="text-sm text-gray-600">{application.cover_letter}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-settings-2 w-5 h-5"
                >
                  <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="M5.1 8h2" />
                  <path d="M16.9 8h2" />
                  <path d="M3.5 15.5l1.42 1.42" />
                  <path d="M19.08 15.5l-1.42 1.42" />
                </svg>
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                Edit Application
              </Button>
              <Button variant="destructive" className="w-full">
                Delete Application
              </Button>
            </CardContent>
          </Card>

          {/* AI Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-brain w-5 h-5"
                >
                  <path d="M15 5v7" />
                  <path d="m9 12 3-3 3 3" />
                  <path d="M20 9s0-5-6-5" />
                  <path d="M4 9s0-5 6-5" />
                  <path d="M4 15s0 5 6 5" />
                  <path d="M20 15s0 5-6 5" />
                  <path d="M12 4v16" />
                </svg>
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {application.ai_rating && application.ai_summary ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">AI Rating: {application.ai_rating}</p>
                  <p className="text-sm text-gray-600">{application.ai_summary}</p>
                </div>
              ) : (
                <div className="text-sm text-gray-600">No AI analysis available.</div>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={handleAnalyzeApplication}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Application"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Resume */}
          {application.resume_file_path && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Resume
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <a
                  href={constructResumeUrl(application.resume_file_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex gap-2 items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-accent hover:text-accent-foreground"
                >
                  View Resume
                  <ExternalLink className="w-4 h-4" />
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
