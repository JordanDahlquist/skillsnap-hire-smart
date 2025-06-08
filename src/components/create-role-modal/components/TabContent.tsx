
import { TabsContent } from "@/components/ui/tabs";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "../utils/types";
import { RoleDetailsTab } from "../tabs/RoleDetailsTab";
import { LocationTab } from "../tabs/LocationTab";
import { JobPostTab } from "../tabs/JobPostTab";
import { SkillsTestTab } from "../tabs/SkillsTestTab";

interface TabContentProps {
  form: UseFormReturn<FormData>;
  uploadedPdfContent: string | null;
  uploadedFileName: string | null;
  rewriteWithAI: boolean;
  onPdfUpload: (content: string, fileName: string) => void;
  onPdfRemove: () => void;
  onRewriteToggle: (checked: boolean) => void;
  onLocationChange: (field: string, value: string) => void;
  generatedJobPost: string;
  setGeneratedJobPost: (content: string) => void;
  tab3Skipped: boolean;
  setTab3Skipped: (skipped: boolean) => void;
  onGenerateJobPost: () => Promise<void>;
  generatedSkillsTest: string;
  setGeneratedSkillsTest: (content: string) => void;
  tab4Skipped: boolean;
  setTab4Skipped: (skipped: boolean) => void;
  onGenerateSkillsTest: () => Promise<void>;
}

export const TabContent = ({
  form,
  uploadedPdfContent,
  uploadedFileName,
  rewriteWithAI,
  onPdfUpload,
  onPdfRemove,
  onRewriteToggle,
  onLocationChange,
  generatedJobPost,
  setGeneratedJobPost,
  tab3Skipped,
  setTab3Skipped,
  onGenerateJobPost,
  generatedSkillsTest,
  setGeneratedSkillsTest,
  tab4Skipped,
  setTab4Skipped,
  onGenerateSkillsTest
}: TabContentProps) => {
  return (
    <>
      <TabsContent value="1" className="space-y-6">
        <RoleDetailsTab
          form={form}
          uploadedPdfContent={uploadedPdfContent}
          uploadedFileName={uploadedFileName}
          rewriteWithAI={rewriteWithAI}
          onPdfUpload={onPdfUpload}
          onPdfRemove={onPdfRemove}
          onRewriteToggle={onRewriteToggle}
        />
      </TabsContent>

      <TabsContent value="2" className="space-y-6">
        <LocationTab
          form={form}
          onLocationChange={onLocationChange}
        />
      </TabsContent>

      <TabsContent value="3" className="space-y-6">
        <JobPostTab
          form={form}
          generatedJobPost={generatedJobPost}
          setGeneratedJobPost={setGeneratedJobPost}
          tab3Skipped={tab3Skipped}
          setTab3Skipped={setTab3Skipped}
          uploadedPdfContent={uploadedPdfContent}
          rewriteWithAI={rewriteWithAI}
          onGenerate={onGenerateJobPost}
        />
      </TabsContent>

      <TabsContent value="4" className="space-y-6">
        <SkillsTestTab
          generatedJobPost={generatedJobPost}
          generatedSkillsTest={generatedSkillsTest}
          setGeneratedSkillsTest={setGeneratedSkillsTest}
          tab4Skipped={tab4Skipped}
          setTab4Skipped={setTab4Skipped}
          onGenerate={onGenerateSkillsTest}
        />
      </TabsContent>
    </>
  );
};
