
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CandidateOverviewTab } from "./tabs/CandidateOverviewTab";
import { CandidateSkillsTab } from "./tabs/CandidateSkillsTab";
import { CandidateVideoTab } from "./tabs/CandidateVideoTab";
import { CandidateDocumentsTab } from "./tabs/CandidateDocumentsTab";
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

  const hasSkillsAssessment = skillsResponses.length > 0;
  const hasVideoInterview = !!application.interview_video_url;
  const hasDocuments = !!(application.resume_file_path || application.cover_letter);

  return (
    <div className="relative">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills" disabled={!hasSkillsAssessment}>
            Skills {!hasSkillsAssessment && "(None)"}
          </TabsTrigger>
          <TabsTrigger value="video" disabled={!hasVideoInterview}>
            Video {!hasVideoInterview && "(None)"}
          </TabsTrigger>
          <TabsTrigger value="documents" disabled={!hasDocuments}>
            Documents {!hasDocuments && "(None)"}
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

        <TabsContent value="documents" className="space-y-6">
          <CandidateDocumentsTab 
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
