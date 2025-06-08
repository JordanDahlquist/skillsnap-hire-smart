
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Sparkles, FileText, ClipboardList, MapPin, Loader2 } from "lucide-react";
import { useTabCompletion } from "@/hooks/useTabCompletion";
import { TabTriggerWithStatus } from "./create-role-modal/ui-components/TabTriggerWithStatus";
import { RoleDetailsTab } from "./create-role-modal/tabs/RoleDetailsTab";
import { LocationTab } from "./create-role-modal/tabs/LocationTab";
import { JobPostTab } from "./create-role-modal/tabs/JobPostTab";
import { SkillsTestTab } from "./create-role-modal/tabs/SkillsTestTab";
import { useJobCreation } from "./create-role-modal/hooks/useJobCreation";
import { useAIGeneration } from "./create-role-modal/hooks/useAIGeneration";
import { formSchema, DEFAULT_FORM_VALUES } from "./create-role-modal/utils/constants";
import { CreateRoleModalProps } from "./create-role-modal/utils/types";

export const CreateRoleModal = ({ open, onOpenChange }: CreateRoleModalProps) => {
  const [activeTab, setActiveTab] = useState("1");
  const [generatedJobPost, setGeneratedJobPost] = useState("");
  const [generatedSkillsTest, setGeneratedSkillsTest] = useState("");
  const [uploadedPdfContent, setUploadedPdfContent] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [rewriteWithAI, setRewriteWithAI] = useState(true);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_FORM_VALUES
  });

  const {
    tabCompletion,
    allTabsComplete,
    tab3Skipped,
    tab4Skipped,
    setTab3Skipped,
    setTab4Skipped,
    getIncompleteTabsMessage
  } = useTabCompletion(form, generatedJobPost, generatedSkillsTest);

  const resetForm = () => {
    form.reset();
    setGeneratedJobPost("");
    setGeneratedSkillsTest("");
    setTab3Skipped(false);
    setTab4Skipped(false);
    setUploadedPdfContent(null);
    setUploadedFileName(null);
    setRewriteWithAI(true);
    setActiveTab("1");
  };

  const { isSaving, onSubmitAsDraft, onSubmitAsPublished } = useJobCreation(
    form,
    generatedJobPost,
    generatedSkillsTest,
    () => onOpenChange(false),
    resetForm
  );

  const { generateJobPost, generateSkillsTest } = useAIGeneration(
    setGeneratedJobPost,
    setGeneratedSkillsTest
  );

  const handlePdfUpload = (content: string, fileName: string) => {
    setUploadedPdfContent(content);
    setUploadedFileName(fileName);
    
    if (!rewriteWithAI) {
      form.setValue("description", content);
    }
  };

  const handlePdfRemove = () => {
    setUploadedPdfContent(null);
    setUploadedFileName(null);
    if (!rewriteWithAI) {
      form.setValue("description", "");
    }
  };

  const handleRewriteToggle = (checked: boolean) => {
    setRewriteWithAI(checked);
    
    if (uploadedPdfContent) {
      if (!checked) {
        form.setValue("description", uploadedPdfContent);
      } else {
        form.setValue("description", "");
      }
    }
  };

  const handleLocationChange = (field: string, value: string) => {
    form.setValue(field as any, value);
  };

  const handleGenerateJobPost = async () => {
    const formData = form.getValues();
    await generateJobPost(formData, uploadedPdfContent, rewriteWithAI);
  };

  const handleGenerateSkillsTest = async () => {
    await generateSkillsTest(generatedJobPost);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Create AI-Powered Job
          </DialogTitle>
          <DialogDescription>
            Create a professional job posting with AI-generated content and skills assessments.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabTriggerWithStatus value="1" isComplete={tabCompletion.tab1Complete}>
              <FileText className="w-4 h-4" />
              Role Details
            </TabTriggerWithStatus>
            <TabTriggerWithStatus value="2" isComplete={tabCompletion.tab2Complete}>
              <MapPin className="w-4 h-4" />
              Location
            </TabTriggerWithStatus>
            <TabTriggerWithStatus value="3" isComplete={tabCompletion.tab3Complete}>
              <Sparkles className="w-4 h-4" />
              AI Job Post
            </TabTriggerWithStatus>
            <TabTriggerWithStatus value="4" isComplete={tabCompletion.tab4Complete}>
              <ClipboardList className="w-4 h-4" />
              Skills Test
            </TabTriggerWithStatus>
          </TabsList>

          <Form {...form}>
            <form className="space-y-6">
              <TabsContent value="1" className="space-y-6">
                <RoleDetailsTab
                  form={form}
                  uploadedPdfContent={uploadedPdfContent}
                  uploadedFileName={uploadedFileName}
                  rewriteWithAI={rewriteWithAI}
                  onPdfUpload={handlePdfUpload}
                  onPdfRemove={handlePdfRemove}
                  onRewriteToggle={handleRewriteToggle}
                />
              </TabsContent>

              <TabsContent value="2" className="space-y-6">
                <LocationTab
                  form={form}
                  onLocationChange={handleLocationChange}
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
                  onGenerate={handleGenerateJobPost}
                />
              </TabsContent>

              <TabsContent value="4" className="space-y-6">
                <SkillsTestTab
                  generatedJobPost={generatedJobPost}
                  generatedSkillsTest={generatedSkillsTest}
                  setGeneratedSkillsTest={setGeneratedSkillsTest}
                  tab4Skipped={tab4Skipped}
                  setTab4Skipped={setTab4Skipped}
                  onGenerate={handleGenerateSkillsTest}
                />
              </TabsContent>

              <DialogFooter className="flex justify-between">
                <div className="flex gap-2">
                  {activeTab !== "1" && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab((parseInt(activeTab) - 1).toString())}
                    >
                      Previous
                    </Button>
                  )}
                  {activeTab !== "4" && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab((parseInt(activeTab) + 1).toString())}
                    >
                      Next
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSaving}
                    onClick={onSubmitAsDraft}
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <FileText className="w-4 h-4 mr-2" />
                    )}
                    Save as Draft
                  </Button>
                  <Button
                    type="button"
                    disabled={isSaving || !allTabsComplete}
                    onClick={() => onSubmitAsPublished(allTabsComplete, getIncompleteTabsMessage)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Publish Job
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
