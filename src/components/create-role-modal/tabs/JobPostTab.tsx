
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Wand2, Sparkles, X, Loader2 } from "lucide-react";
import { EmptyState } from "../ui-components/EmptyState";
import { LoadingState } from "../ui-components/LoadingState";
import { GeneratedContent } from "../ui-components/GeneratedContent";

interface JobPostTabProps {
  form: any;
  generatedJobPost: string;
  setGeneratedJobPost: (content: string) => void;
  tab3Skipped: boolean;
  setTab3Skipped: (skipped: boolean) => void;
  uploadedPdfContent: string | null;
  rewriteWithAI: boolean;
  onGenerate: () => Promise<void>;
}

export const JobPostTab = ({
  form,
  generatedJobPost,
  setGeneratedJobPost,
  tab3Skipped,
  setTab3Skipped,
  uploadedPdfContent,
  rewriteWithAI,
  onGenerate
}: JobPostTabProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSkip = () => {
    setTab3Skipped(true);
    toast({
      title: "Job Post Skipped",
      description: "You can publish without AI-generated job post content."
    });
  };

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Job Post Updated",
      description: "Your changes have been saved."
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-600" />
              AI-Generated Job Post
              {tab3Skipped && (
                <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  Skipped
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {!generatedJobPost && !tab3Skipped && (
                <>
                  <Button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Generate Job Post
                  </Button>
                  <Button type="button" onClick={handleSkip} variant="outline">
                    <X className="w-4 h-4 mr-2" />
                    Skip
                  </Button>
                </>
              )}
              {tab3Skipped && (
                <Button
                  type="button"
                  onClick={() => setTab3Skipped(false)}
                  variant="outline"
                  size="sm"
                >
                  Undo Skip
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!generatedJobPost && !isGenerating && !tab3Skipped && (
            <EmptyState
              icon={Wand2}
              title="Ready to create magic?"
              description="Fill in the role details and generate an AI-powered job posting."
            />
          )}

          {tab3Skipped && (
            <EmptyState
              icon={() => <div className="w-12 h-12 text-green-500">✓</div>}
              title="Job Post Skipped"
              description="You can publish without AI-generated content."
            />
          )}

          {isGenerating && (
            <LoadingState
              title="AI is crafting your job post..."
              description="This may take a few seconds"
              color="purple"
            />
          )}

          {generatedJobPost && (
            <GeneratedContent
              content={generatedJobPost}
              isEditing={isEditing}
              isGenerating={isGenerating}
              isSkipped={tab3Skipped}
              onEdit={() => setIsEditing(true)}
              onRegenerate={handleGenerate}
              onUndoSkip={() => setTab3Skipped(false)}
              onSave={handleSave}
              onCancel={handleCancel}
              onChange={setGeneratedJobPost}
              placeholder="Edit your job posting content here..."
              gradientFrom="blue"
              gradientTo="purple"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
