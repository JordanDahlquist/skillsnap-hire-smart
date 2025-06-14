
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CandidateOverviewTab } from "./tabs/CandidateOverviewTab";
import { CandidateSkillsTab } from "./tabs/CandidateSkillsTab";
import { CandidateVideoTab } from "./tabs/CandidateVideoTab";
import { CandidateResumeTab } from "./tabs/CandidateResumeTab";
import { CandidateActivityTab } from "./tabs/CandidateActivityTab";
import { CandidateFloatingActions } from "./CandidateFloatingActions";
import { Application, Job } from "@/types";

interface CandidateDetailContentProps {
  application: Application;
  job: Job;
  onApplicationUpdate: () => void;
}

export const CandidateDetailContent = ({ 
  application, 
  job, 
  onApplicationUpdate 
}: CandidateDetailContentProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  // Parse skills test responses
  const skillsResponses = Array.isArray(application.skills_test_responses) 
    ? application.skills_test_responses 
    : [];

  // Check for video content in skills responses
  const skillsVideoResponses = skillsResponses.filter((response: any) => 
    response.answerType === 'video' && response.videoUrl
  );

  // Check for video content in interview responses (both new and legacy fields)
  let hasInterviewVideos = false;

  // Check new interview_video_responses field
  if (application.interview_video_responses) {
    try {
      let interviewResponses = [];
      if (Array.isArray(application.interview_video_responses)) {
        interviewResponses = application.interview_video_responses;
      } else if (typeof application.interview_video_responses === 'string') {
        interviewResponses = JSON.parse(application.interview_video_responses);
      }
      
      const interviewVideoResponses = interviewResponses.filter((response: any) => 
        response.answerType === 'video' && response.videoUrl
      );
      
      if (interviewVideoResponses.length > 0) {
        hasInterviewVideos = true;
      }
    } catch (error) {
      // Continue to check legacy field
    }
  }

  // Check legacy interview_video_url field if no videos found in new field
  if (!hasInterviewVideos && application.interview_video_url) {
    try {
      // Try to parse as JSON array first
      const parsed = JSON.parse(application.interview_video_url);
      if (Array.isArray(parsed)) {
        const videoResponses = parsed.filter((response: any) => 
          response.answerType === 'video' && response.videoUrl
        );
        hasInterviewVideos = videoResponses.length > 0;
      }
    } catch (error) {
      // If not valid JSON, treat as single video URL
      if (application.interview_video_url.startsWith('http') || 
          application.interview_video_url.startsWith('blob:') ||
          application.interview_video_url.includes('supabase')) {
        hasInterviewVideos = true;
      }
    }
  }

  const hasSkillsAssessment = skillsResponses.length > 0;
  const hasVideoContent = skillsVideoResponses.length > 0 || hasInterviewVideos;
  const hasResume = !!(application.resume_file_path);

  return (
    <div className="relative">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills" disabled={!hasSkillsAssessment}>
            Skills {!hasSkillsAssessment && "(None)"}
          </TabsTrigger>
          <TabsTrigger value="video" disabled={!hasVideoContent}>
            Video {!hasVideoContent && "(None)"}
          </TabsTrigger>
          <TabsTrigger value="resume" disabled={!hasResume}>
            Resume {!hasResume && "(None)"}
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <CandidateOverviewTab 
            application={application}
            job={job}
            onApplicationUpdate={onApplicationUpdate}
          />
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <CandidateSkillsTab 
            application={application}
            skillsResponses={skillsResponses}
          />
        </TabsContent>

        <TabsContent value="video" className="space-y-6">
          <CandidateVideoTab 
            application={application}
          />
        </TabsContent>

        <TabsContent value="resume" className="space-y-6">
          <CandidateResumeTab 
            application={application}
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <CandidateActivityTab 
            application={application}
          />
        </TabsContent>
      </Tabs>

      <CandidateFloatingActions 
        application={application}
        job={job}
        onApplicationUpdate={onApplicationUpdate}
      />
    </div>
  );
};
