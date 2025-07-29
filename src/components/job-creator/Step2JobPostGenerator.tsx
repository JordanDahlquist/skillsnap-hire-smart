
import { useEffect } from "react";
import { UnifiedJobCreatorActions, WritingTone, UnifiedJobFormData } from "@/types/jobForm";
import { ToneControlSliders } from "./ToneControlSliders";
import { JobPostGeneratorInitialState } from "./job-post/JobPostGeneratorInitialState";
import { JobPostGeneratorContent } from "./job-post/JobPostGeneratorContent";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface Step2JobPostGeneratorProps {
  generatedJobPost: string;
  formData: UnifiedJobFormData;
  writingTone: WritingTone;
  isGenerating: boolean;
  isEditingJobPost: boolean;
  actions: UnifiedJobCreatorActions;
  onGenerateJobPost: () => Promise<void>;
}

export const Step2JobPostGenerator = ({
  generatedJobPost,
  formData,
  writingTone,
  isGenerating,
  isEditingJobPost,
  actions,
  onGenerateJobPost
}: Step2JobPostGeneratorProps) => {
  useEffect(() => {
    if (!generatedJobPost && !isGenerating) {
      onGenerateJobPost();
    }
  }, [generatedJobPost, isGenerating, onGenerateJobPost]);

  // Show initial state (loading or ready to generate)
  if (isGenerating || (!generatedJobPost && !isGenerating)) {
    return (
      <JobPostGeneratorInitialState
        isGenerating={isGenerating}
        onGenerateJobPost={onGenerateJobPost}
      />
    );
  }

  // Show generated content with tone controls
  return (
    <div className="h-full flex flex-col overflow-hidden space-y-4">
      {/* Informational Message */}
      <Alert className="border-info/20 bg-info/5">
        <Info className="h-4 w-4 text-info" />
        <AlertDescription className="text-sm text-muted-foreground">
          This job description will appear on your public application page with an "Apply Now" button at the bottom. 
          Our system automatically includes certain elements to guide candidates through the application process and help you manage applicants more effectively.
        </AlertDescription>
      </Alert>

      {/* Tone Control Sliders with Regenerate Button */}
      <ToneControlSliders
        writingTone={writingTone}
        onToneChange={actions.setWritingTone}
        onRegenerate={onGenerateJobPost}
        isGenerating={isGenerating}
      />

      {/* Job Post Content */}
      <JobPostGeneratorContent
        generatedJobPost={generatedJobPost}
        isEditingJobPost={isEditingJobPost}
        actions={actions}
      />
    </div>
  );
};
