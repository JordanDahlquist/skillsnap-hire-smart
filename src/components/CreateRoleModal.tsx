
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs } from "@/components/ui/tabs";
import { useTabCompletion } from "@/hooks/useTabCompletion";
import { useJobCreation } from "./create-role-modal/hooks/useJobCreation";
import { useAIGeneration } from "./create-role-modal/hooks/useAIGeneration";
import { useModalState } from "./create-role-modal/hooks/useModalState";
import { formSchema, DEFAULT_FORM_VALUES } from "./create-role-modal/utils/constants";
import { CreateRoleModalProps } from "./create-role-modal/utils/types";
import { ModalHeader } from "./create-role-modal/components/ModalHeader";
import { NavigationTabs } from "./create-role-modal/components/NavigationTabs";
import { TabContent } from "./create-role-modal/components/TabContent";
import { ModalFooter } from "./create-role-modal/components/ModalFooter";

export const CreateRoleModal = ({ open, onOpenChange }: CreateRoleModalProps) => {
  const {
    activeTab,
    setActiveTab,
    generatedJobPost,
    setGeneratedJobPost,
    generatedSkillsTest,
    setGeneratedSkillsTest,
    uploadedPdfContent,
    setUploadedPdfContent,
    uploadedFileName,
    setUploadedFileName,
    rewriteWithAI,
    setRewriteWithAI,
    resetState
  } = useModalState();
  
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
    resetState();
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
    form.setValue(field as keyof typeof DEFAULT_FORM_VALUES, value);
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
        <ModalHeader />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <NavigationTabs tabCompletion={tabCompletion} />

          <Form {...form}>
            <form className="space-y-6">
              <TabContent
                form={form}
                uploadedPdfContent={uploadedPdfContent}
                uploadedFileName={uploadedFileName}
                rewriteWithAI={rewriteWithAI}
                onPdfUpload={handlePdfUpload}
                onPdfRemove={handlePdfRemove}
                onRewriteToggle={handleRewriteToggle}
                onLocationChange={handleLocationChange}
                generatedJobPost={generatedJobPost}
                setGeneratedJobPost={setGeneratedJobPost}
                tab3Skipped={tab3Skipped}
                setTab3Skipped={setTab3Skipped}
                onGenerateJobPost={handleGenerateJobPost}
                generatedSkillsTest={generatedSkillsTest}
                setGeneratedSkillsTest={setGeneratedSkillsTest}
                tab4Skipped={tab4Skipped}
                setTab4Skipped={setTab4Skipped}
                onGenerateSkillsTest={handleGenerateSkillsTest}
              />

              <ModalFooter
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isSaving={isSaving}
                allTabsComplete={allTabsComplete}
                onSubmitAsDraft={onSubmitAsDraft}
                onSubmitAsPublished={onSubmitAsPublished}
                getIncompleteTabsMessage={getIncompleteTabsMessage}
              />
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
