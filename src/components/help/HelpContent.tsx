
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GettingStartedSection } from "./sections/GettingStartedSection";
import { JobManagementSection } from "./sections/JobManagementSection";
import { CandidateManagementSection } from "./sections/CandidateManagementSection";
import { LinkedInIntegrationSection } from "./sections/LinkedInIntegrationSection";
import { EmailTemplatesSection } from "./sections/EmailTemplatesSection";
import { AnalyticsSection } from "./sections/AnalyticsSection";
import { TroubleshootingSection } from "./sections/TroubleshootingSection";

export const HelpContent = () => {
  return (
    <Tabs defaultValue="getting-started" className="space-y-6">
      <TabsList className="grid w-full grid-cols-7">
        <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
        <TabsTrigger value="jobs">Job Management</TabsTrigger>
        <TabsTrigger value="candidates">Candidates</TabsTrigger>
        <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
        <TabsTrigger value="emails">Email Templates</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="troubleshooting">Help</TabsTrigger>
      </TabsList>

      <TabsContent value="getting-started">
        <GettingStartedSection />
      </TabsContent>

      <TabsContent value="jobs">
        <JobManagementSection />
      </TabsContent>

      <TabsContent value="candidates">
        <CandidateManagementSection />
      </TabsContent>

      <TabsContent value="linkedin">
        <LinkedInIntegrationSection />
      </TabsContent>

      <TabsContent value="emails">
        <EmailTemplatesSection />
      </TabsContent>

      <TabsContent value="analytics">
        <AnalyticsSection />
      </TabsContent>

      <TabsContent value="troubleshooting">
        <TroubleshootingSection />
      </TabsContent>
    </Tabs>
  );
};
