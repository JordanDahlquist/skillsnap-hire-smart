
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Edit3 } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { parseMarkdown } from "@/utils/markdownParser";
import { ScrollArea } from "@/components/ui/scroll-area";
import { JobCreatorActions } from "./types";

interface Step3SkillsTestGeneratorProps {
  generatedJobPost: string;
  generatedSkillsTest: string;
  isGenerating: boolean;
  isEditingSkillsTest: boolean;
  actions: JobCreatorActions;
  onGenerateSkillsTest: () => Promise<void>;
}

export const Step3SkillsTestGenerator = ({
  generatedJobPost,
  generatedSkillsTest,
  isGenerating,
  isEditingSkillsTest,
  actions,
  onGenerateSkillsTest
}: Step3SkillsTestGeneratorProps) => {
  const handleSkillsTestSave = () => {
    actions.setIsEditingSkillsTest(false);
  };

  const handleSkillsTestCancel = () => {
    actions.setIsEditingSkillsTest(false);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {!generatedSkillsTest ? (
        <Card className="h-full">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Skills Assessment Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Create Skills Assessment
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Generate targeted assessment questions based on your job post to evaluate candidate skills effectively
              </p>
              <Button 
                onClick={onGenerateSkillsTest}
                disabled={isGenerating || !generatedJobPost}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="default"
              >
                {isGenerating ? 'Generating...' : 'Generate Skills Test'}
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="h-full flex flex-col overflow-hidden">
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Generated Skills Test
              </CardTitle>
              {!isEditingSkillsTest && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onGenerateSkillsTest}
                  disabled={isGenerating}
                  className="text-xs h-8 px-3"
                >
                  {isGenerating ? 'Regenerating...' : 'Regenerate'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            {isEditingSkillsTest ? (
              <RichTextEditor
                value={generatedSkillsTest}
                onChange={actions.setGeneratedSkillsTest}
                onSave={handleSkillsTestSave}
                onCancel={handleSkillsTestCancel}
                placeholder="Enter your skills test questions here..."
              />
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex-shrink-0 p-4 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Click to edit or use the buttons on the right
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => actions.setIsEditingSkillsTest(true)}
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
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors min-h-full"
                      onClick={() => actions.setIsEditingSkillsTest(true)}
                      style={{
                        lineHeight: '1.6',
                        fontSize: '14px',
                        wordWrap: 'break-word'
                      }}
                      dangerouslySetInnerHTML={{ 
                        __html: parseMarkdown(generatedSkillsTest) 
                      }}
                    />
                  </ScrollArea>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
