
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CandidateOverviewTab } from "./tabs/CandidateOverviewTab";
import { CandidateResumeTab } from "./tabs/CandidateResumeTab";
import { CandidateSkillsTab } from "./tabs/CandidateSkillsTab";
import { CandidateVideoTab } from "./tabs/CandidateVideoTab";
import { CandidateDocumentsTab } from "./tabs/CandidateDocumentsTab";
import { CandidateActivityTab } from "./tabs/CandidateActivityTab";
import { CandidateEmailTab } from "./tabs/CandidateEmailTab";
import type { Application, Job } from "@/types";

interface CandidateDetailContentProps {
  application: Application;
  job: Job;
  onApplicationUpdate: () => void;
  initialTab?: string;
}

export const CandidateDetailContent = ({ 
  application, 
  job, 
  onApplicationUpdate,
  initialTab = 'overview'
}: CandidateDetailContentProps) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update active tab when initialTab changes (from URL)
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="resume">Resume</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <CandidateOverviewTab 
            application={application} 
            job={job}
            onApplicationUpdate={onApplicationUpdate}
          />
        </TabsContent>

        <TabsContent value="resume" className="mt-0">
          <CandidateResumeTab application={application} />
        </TabsContent>

        <TabsContent value="skills" className="mt-0">
          <CandidateSkillsTab application={application} />
        </TabsContent>

        <TabsContent value="video" className="mt-0">
          <CandidateVideoTab application={application} />
        </TabsContent>

        <TabsContent value="documents" className="mt-0">
          <CandidateDocumentsTab application={application} />
        </TabsContent>

        <TabsContent value="email" className="mt-0">
          <CandidateEmailTab 
            application={application} 
            job={job}
          />
        </TabsContent>

        <TabsContent value="activity" className="mt-0">
          <CandidateActivityTab application={application} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
