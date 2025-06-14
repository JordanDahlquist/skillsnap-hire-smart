
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Edit3, Loader2 } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { parseMarkdown } from "@/utils/markdownParser";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UnifiedJobCreatorActions } from "@/types/jobForm";

interface Step2JobPostGeneratorProps {
  generatedJobPost: string;
  isGenerating: boolean;
  isEditingJobPost: boolean;
  actions: UnifiedJobCreatorActions;
  onGenerateJobPost: () => Promise<void>;
}

export const Step2JobPostGenerator = ({
  generatedJobPost,
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

  const handleJobPostSave = () => {
    actions.setIsEditingJobPost(false);
  };

  const handleJobPostCancel = () => {
    actions.setIsEditingJobPost(false);
  };

  if (isGenerating) {
    return (
      <Card className="h-full flex flex-col items-center justify-center">
        <CardContent className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Generating Your Job Post...
          </h3>
          <p className="text-sm text-gray-600">
            Our AI is crafting the perfect job description. Please wait a moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!generatedJobPost && !isGenerating) {
    return (
        <Card className="h-full flex flex-col items-center justify-center">
          <CardContent className="text-center max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to Generate
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Click the button to generate your job post.
            </p>
            <Button 
              onClick={onGenerateJobPost}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Generate Job Post
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Generated Job Post
          </CardTitle>
          {!isEditingJobPost && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onGenerateJobPost}
              disabled={isGenerating}
              className="text-xs h-8 px-3"
            >
              {isGenerating ? 'Regenerating...' : 'Regenerate'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        {isEditingJobPost ? (
          <RichTextEditor
            value={generatedJobPost}
            onChange={actions.setGeneratedJobPost}
            onSave={handleJobPostSave}
            onCancel={handleJobPostCancel}
            placeholder="Enter your job posting content here..."
          />
        ) : (
          <div className="h-full flex flex-col">
            <div className="flex-shrink-0 p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Review the generated content below. Click to make edits.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => actions.setIsEditingJobPost(true)}
                  className="flex items-center gap-1 text-xs h-8 px-3"
                >
                  <Edit3 className="w-3 h-3" />
                  Edit
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full w-full">
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors min-h-full prose prose-sm max-w-none"
                  onClick={() => actions.setIsEditingJobPost(true)}
                  style={{
                    lineHeight: '1.6',
                    fontSize: '14px',
                    wordWrap: 'break-word'
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: parseMarkdown(generatedJobPost) 
                  }}
                />
              </ScrollArea>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
