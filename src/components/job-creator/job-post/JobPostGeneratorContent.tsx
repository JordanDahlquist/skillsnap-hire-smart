
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Edit3 } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { parseMarkdown } from "@/utils/markdownParser";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UnifiedJobCreatorActions } from "@/types/jobForm";

interface JobPostGeneratorContentProps {
  generatedJobPost: string;
  isEditingJobPost: boolean;
  actions: UnifiedJobCreatorActions;
}

export const JobPostGeneratorContent = ({
  generatedJobPost,
  isEditingJobPost,
  actions
}: JobPostGeneratorContentProps) => {
  const handleJobPostSave = () => {
    actions.setIsEditingJobPost(false);
  };

  const handleJobPostCancel = () => {
    actions.setIsEditingJobPost(false);
  };

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-blue-600" />
          Generated Job Post
        </CardTitle>
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
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors min-h-full"
                  onClick={() => actions.setIsEditingJobPost(true)}
                  style={{
                    lineHeight: '1.8',
                    fontSize: '18px',
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
