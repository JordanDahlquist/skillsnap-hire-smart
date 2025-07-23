import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Star, 
  StarIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock,
  ExternalLink,
  User,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  Download,
  Eye,
  Trash2,
  RotateCcw
} from "lucide-react";
import { StageSelector } from "../StageSelector";
import { constructResumeUrl } from "@/utils/resumeUploadUtils";
import { Application } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface ApplicationDetailContentProps {
  application: Application;
  getStatusColor: (status: string) => string;
  getRatingStars: (rating: number | null) => JSX.Element[];
  getTimeAgo: (dateString: string) => string;
  isUpdating: boolean;
  onManualRating: (rating: number) => void;
  onReject: () => void;
  onUnreject: () => void;
  onEmail: () => void;
  onViewFullProfile: () => void;
  jobId: string;
  onStageChange: (applicationId: string, newStage: string) => void;
}

export const ApplicationDetailContent = ({
  application,
  getStatusColor,
  getRatingStars,
  getTimeAgo,
  isUpdating,
  onManualRating,
  onReject,
  onUnreject,
  onEmail,
  onViewFullProfile,
  jobId,
  onStageChange
}: ApplicationDetailContentProps) => {
  const [showFullCoverLetter, setShowFullCoverLetter] = useState(false);
  const { toast } = useToast();

  const handleViewResume = () => {
    if (application.resume_file_path) {
      const resumeUrl = constructResumeUrl(application.resume_file_path);
      window.open(resumeUrl, '_blank');
    }
  };

  const handleDownloadResume = () => {
    if (application.resume_file_path) {
      const resumeUrl = constructResumeUrl(application.resume_file_path);
      const link = document.createElement('a');
      link.href = resumeUrl;
      link.download = `${application.name}_resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopyEmail = async () => {
    if (application.email) {
      try {
        await navigator.clipboard.writeText(application.email);
        toast({
          description: "Email copied!",
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to copy email",
          variant: "destructive",
        });
      }
    }
  };

  const handleCopyPhone = async () => {
    if (application.phone) {
      try {
        await navigator.clipboard.writeText(application.phone);
        toast({
          description: "Phone copied!",
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to copy phone",
          variant: "destructive",
        });
      }
    }
  };

  const handleOpenLocation = () => {
    if (application.location) {
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(application.location)}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  // Normalize AI rating from 5-star to 3-star scale
  const normalizeAIRating = (rating: number | null): number | null => {
    if (!rating) return null;
    return Math.max(1, Math.min(3, Math.round((rating / 5) * 3)));
  };

  const renderManualRating = (rating: number | null) => {
    return Array.from({ length: 3 }, (_, i) => {
      const starValue = i + 1;
      const isActive = rating && starValue <= rating;
      
      return (
        <button
          key={i}
          onClick={() => onManualRating(starValue)}
          disabled={isUpdating}
          className="hover:scale-105 transition-transform disabled:opacity-50"
        >
          <Star
            className={`w-4 h-4 ${
              isActive 
                ? 'text-blue-500 fill-current' 
                : 'text-gray-300 hover:text-blue-400'
            }`}
          />
        </button>
      );
    });
  };

  const renderAIRating = (rating: number | null) => {
    const normalizedRating = normalizeAIRating(rating);
    
    return Array.from({ length: 3 }, (_, i) => {
      const starValue = i + 1;
      const isActive = normalizedRating && starValue <= normalizedRating;
      
      return (
        <Star
          key={i}
          className={`w-4 h-4 ${
            isActive ? 'text-purple-500 fill-current' : 'text-gray-300'
          }`}
        />
      );
    });
  };

  const renderParsedResumeData = () => {
    if (!application.parsed_resume_data) {
      return (
        <div className="text-sm text-muted-foreground">
          No parsed resume data available
        </div>
      );
    }

    const data = application.parsed_resume_data as any;

    return (
      <div className="space-y-4">
        {/* Personal Information */}
        {data.personalInfo && (
          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Personal Information
            </h4>
            <div className="text-sm space-y-1 text-muted-foreground ml-6">
              {data.personalInfo.name && <div><span className="font-medium">Name:</span> {data.personalInfo.name}</div>}
              {data.personalInfo.email && <div><span className="font-medium">Email:</span> {data.personalInfo.email}</div>}
              {data.personalInfo.phone && <div><span className="font-medium">Phone:</span> {data.personalInfo.phone}</div>}
              {data.personalInfo.location && <div><span className="font-medium">Location:</span> {data.personalInfo.location}</div>}
            </div>
          </div>
        )}

        {/* Work Experience */}
        {data.workExperience && data.workExperience.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Work Experience ({data.workExperience.length})
            </h4>
            <div className="text-sm space-y-2 text-muted-foreground ml-6">
              {data.workExperience.slice(0, 3).map((exp: any, index: number) => (
                <div key={index} className="border-l-2 border-muted pl-3">
                  <div className="font-medium text-foreground">{exp.position}</div>
                  <div className="text-xs">{exp.company}</div>
                  <div className="text-xs">{exp.startDate} - {exp.endDate}</div>
                  {exp.description && (
                    <div className="text-xs mt-1 line-clamp-2">{exp.description}</div>
                  )}
                </div>
              ))}
              {data.workExperience.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  ... and {data.workExperience.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Education ({data.education.length})
            </h4>
            <div className="text-sm space-y-1 text-muted-foreground ml-6">
              {data.education.slice(0, 2).map((edu: any, index: number) => (
                <div key={index}>
                  <div className="font-medium text-foreground">{edu.degree}</div>
                  <div className="text-xs">{edu.institution}</div>
                  <div className="text-xs">{edu.graduationDate}</div>
                  {edu.gpa && <div className="text-xs">GPA: {edu.gpa}</div>}
                </div>
              ))}
              {data.education.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  ... and {data.education.length - 2} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Skills ({data.skills.length})
            </h4>
            <div className="flex flex-wrap gap-1 ml-6">
              {data.skills.slice(0, 8).map((skill: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {data.skills.length > 8 && (
                <Badge variant="outline" className="text-xs">
                  +{data.skills.length - 8} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <button
              onClick={onViewFullProfile}
              className="text-left hover:text-primary transition-colors"
            >
              <h2 className="text-2xl font-bold hover:underline">{application.name}</h2>
            </button>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {application.email && (
                <button 
                  onClick={handleCopyEmail}
                  className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  {application.email}
                </button>
              )}
              {application.phone && (
                <button 
                  onClick={handleCopyPhone}
                  className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  {application.phone}
                </button>
              )}
              {application.location && (
                <button 
                  onClick={handleOpenLocation}
                  className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                >
                  <MapPin className="w-4 h-4" />
                  {application.location}
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary"
              className={`${getStatusColor(application.status)} text-white`}
            >
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="default"
            size="sm"
            onClick={onViewFullProfile}
            className="flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            View Full Profile
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onEmail}
            className="flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Email
          </Button>

          <StageSelector
            jobId={jobId}
            applicationId={application.id}
            currentStage={application.pipeline_stage || 'applied'}
            onStageChange={onStageChange}
            size="sm"
          />
        </div>

        {/* Rating Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Manual Rating:</span>
                <div className="flex items-center gap-1">
                  {renderManualRating(application.manual_rating)}
                </div>
                <span className="text-sm text-muted-foreground ml-1">
                  ({application.manual_rating || 0}/3)
                </span>
              </div>
              
              {application.ai_rating && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">AI Rating:</span>
                  <div className="flex items-center gap-1">
                    {renderAIRating(application.ai_rating)}
                  </div>
                  <span className="text-sm text-muted-foreground ml-1">
                    ({normalizeAIRating(application.ai_rating) || 0}/3)
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Summary */}
        {application.ai_summary && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">AI Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {application.ai_summary}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Application Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Application Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Applied:</span>
                <div className="text-muted-foreground flex items-center gap-1 mt-1">
                  <Calendar className="w-4 h-4" />
                  {getTimeAgo(application.created_at)}
                </div>
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>
                <div className="text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="w-4 h-4" />
                  {getTimeAgo(application.updated_at)}
                </div>
              </div>
            </div>

            {/* Resume Section */}
            {application.resume_file_path && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Resume Information
                  </h3>
                  {renderParsedResumeData()}
                </div>
              </>
            )}

            {/* Cover Letter */}
            {application.cover_letter && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium text-sm mb-2">Cover Letter</h3>
                  <div className="text-sm text-muted-foreground">
                    {showFullCoverLetter ? (
                      <div className="whitespace-pre-wrap">
                        {application.cover_letter}
                        <button
                          onClick={() => setShowFullCoverLetter(false)}
                          className="text-primary hover:underline ml-2"
                        >
                          Show less
                        </button>
                      </div>
                    ) : (
                      <div>
                        {application.cover_letter.length > 200 ? (
                          <>
                            {application.cover_letter.substring(0, 200)}...
                            <button
                              onClick={() => setShowFullCoverLetter(true)}
                              className="text-primary hover:underline ml-2"
                            >
                              Show more
                            </button>
                          </>
                        ) : (
                          application.cover_letter
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
