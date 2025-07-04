
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CandidateOverviewTab } from "./tabs/CandidateOverviewTab";
import { CandidateResumeTab } from "./tabs/CandidateResumeTab";
import { CandidateSkillsTab } from "./tabs/CandidateSkillsTab";
import { CandidateVideoTab } from "./tabs/CandidateVideoTab";
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
        <TabsList className="grid w-full grid-cols-6 mb-6 bg-background border border-border">
          <TabsTrigger value="overview" className="data-[state=active]:bg-foreground data-[state=active]:text-background">Overview</TabsTrigger>
          <TabsTrigger value="email" className="data-[state=active]:bg-foreground data-[state=active]:text-background">Email</TabsTrigger>
          <TabsTrigger value="resume" className="data-[state=active]:bg-foreground data-[state=active]:text-background">Resume</TabsTrigger>
          <TabsTrigger value="skills" className="data-[state=active]:bg-foreground data-[state=active]:text-background">Assessment</TabsTrigger>
          <TabsTrigger value="video" className="data-[state=active]:bg-foreground data-[state=active]:text-background">Video</TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-foreground data-[state=active]:text-background">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <CandidateOverviewTab 
            application={application} 
            job={job}
            onApplicationUpdate={onApplicationUpdate}
          />
        </TabsContent>

        <TabsContent value="email" className="mt-0">
          <CandidateEmailTab 
            application={application} 
            job={job}
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

        <TabsContent value="activity" className="mt-0">
          <CandidateActivityTab application={application} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
