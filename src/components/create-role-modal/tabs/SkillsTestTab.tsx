
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ClipboardList, Sparkles, X, Loader2 } from "lucide-react";
import { EmptyState } from "../ui-components/EmptyState";
import { LoadingState } from "../ui-components/LoadingState";
import { GeneratedContent } from "../ui-components/GeneratedContent";

interface SkillsTestTabProps {
  generatedJobPost: string;
  generatedSkillsTest: string;
  setGeneratedSkillsTest: (content: string) => void;
  tab4Skipped: boolean;
  setTab4Skipped: (skipped: boolean) => void;
  onGenerate: () => Promise<void>;
}

export const SkillsTestTab = ({
  generatedJobPost,
  generatedSkillsTest,
  setGeneratedSkillsTest,
  tab4Skipped,
  setTab4Skipped,
  onGenerate
}: SkillsTestTabProps) => {
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
    setTab4Skipped(true);
    toast({
      title: "Skills Test Skipped",
      description: "You can publish without AI-generated skills test."
    });
  };

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Skills Test Updated",
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
              <ClipboardList className="w-5 h-5 text-green-600" />
              AI-Generated Skills Test
              {tab4Skipped && (
                <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  Skipped
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {generatedJobPost && !generatedSkillsTest && !tab4Skipped && (
                <>
                  <Button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Generate Skills Test
                  </Button>
                  <Button type="button" onClick={handleSkip} variant="outline">
                    <X className="w-4 h-4 mr-2" />
                    Skip
                  </Button>
                </>
              )}
              {tab4Skipped && (
                <Button
                  type="button"
                  onClick={() => setTab4Skipped(false)}
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
          {!generatedJobPost && (
            <EmptyState
              icon={ClipboardList}
              title="Job Post Required"
              description="Generate the job post first to create a relevant skills test."
            />
          )}

          {generatedJobPost && !generatedSkillsTest && !isGenerating && !tab4Skipped && (
            <EmptyState
              icon={ClipboardList}
              title="Ready for Skills Assessment"
              description="Generate AI-powered assessment questions based on your job post."
            />
          )}

          {tab4Skipped && (
            <EmptyState
              icon={() => <div className="w-12 h-12 text-green-500">✓</div>}
              title="Skills Test Skipped"
              description="You can publish without AI-generated skills test."
            />
          )}

          {isGenerating && (
            <LoadingState
              title="AI is creating your skills test..."
              description="Crafting relevant assessment questions"
              color="green"
            />
          )}

          {generatedSkillsTest && (
            <GeneratedContent
              content={generatedSkillsTest}
              isEditing={isEditing}
              isGenerating={isGenerating}
              isSkipped={tab4Skipped}
              onEdit={() => setIsEditing(true)}
              onRegenerate={handleGenerate}
              onUndoSkip={() => setTab4Skipped(false)}
              onSave={handleSave}
              onCancel={handleCancel}
              onChange={setGeneratedSkillsTest}
              placeholder="Edit your skills test questions here..."
              gradientFrom="green"
              gradientTo="teal"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
