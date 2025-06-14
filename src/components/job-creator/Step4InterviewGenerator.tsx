import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sparkles, Edit3, SkipForward, Video } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { parseMarkdown } from "@/utils/markdownParser";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UnifiedJobCreatorActions } from "@/types/jobForm";
interface Step4InterviewGeneratorProps {
  generatedJobPost: string;
  generatedInterviewQuestions: string;
  interviewVideoMaxLength: number;
  isGenerating: boolean;
  isEditingInterviewQuestions: boolean;
  actions: UnifiedJobCreatorActions;
  onGenerateInterviewQuestions: () => Promise<void>;
}
export const Step4InterviewGenerator = ({
  generatedJobPost,
  generatedInterviewQuestions,
  interviewVideoMaxLength,
  isGenerating,
  isEditingInterviewQuestions,
  actions,
  onGenerateInterviewQuestions
}: Step4InterviewGeneratorProps) => {
  const handleInterviewQuestionsSave = () => {
    actions.setIsEditingInterviewQuestions(false);
  };
  const handleInterviewQuestionsCancel = () => {
    actions.setIsEditingInterviewQuestions(false);
  };
  return <div className="h-full flex flex-col overflow-hidden">
      {!generatedInterviewQuestions ? <Card className="h-full">
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Video className="w-5 h-5 text-purple-600" />
                Interview Questions Generator
              </CardTitle>
              <Badge variant="outline" className="text-xs text-gray-600 bg-gray-50">
                Optional
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-50 rounded-full flex items-center justify-center">
                <Video className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Create Interview Questions
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Generate targeted interview questions that candidates will answer via video submission. Set video length limits and customize questions to evaluate candidates effectively.
              </p>
              
              {/* Video Length Setting */}
              <div className="mb-6 text-left">
                <Label htmlFor="video-length" className="text-sm font-medium text-gray-700 mb-2 block">
                  Maximum Video Length
                </Label>
                <Select value={interviewVideoMaxLength.toString()} onValueChange={value => actions.setInterviewVideoMaxLength(parseInt(value))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select video length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 minute</SelectItem>
                    <SelectItem value="3">3 minutes</SelectItem>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button onClick={onGenerateInterviewQuestions} disabled={isGenerating || !generatedJobPost} className="bg-purple-600 hover:bg-purple-700 text-white" size="default">
                  {isGenerating ? 'Generating...' : 'Generate Interview Questions'}
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" onClick={() => actions.setCurrentStep(5)} className="text-gray-600 hover:text-gray-800" size="default">
                  <SkipForward className="w-4 h-4 mr-2" />
                  Skip Interview Questions
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                You can always add interview questions later after publishing your job
              </p>
            </div>
          </CardContent>
        </Card> : <Card className="h-full flex flex-col overflow-hidden">
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Video className="w-5 h-5 text-purple-600" />
                  Generated Interview Questions
                </CardTitle>
                <Badge variant="outline" className="text-xs text-gray-600 bg-gray-50">
                  Optional
                </Badge>
              </div>
              {!isEditingInterviewQuestions && <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-600">
                    Max length: {interviewVideoMaxLength} min
                  </div>
                  <Button variant="outline" size="sm" onClick={onGenerateInterviewQuestions} disabled={isGenerating} className="text-xs h-8 px-3">
                    {isGenerating ? 'Regenerating...' : 'Regenerate'}
                  </Button>
                </div>}
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            {isEditingInterviewQuestions ? <RichTextEditor value={generatedInterviewQuestions} onChange={actions.setGeneratedInterviewQuestions} onSave={handleInterviewQuestionsSave} onCancel={handleInterviewQuestionsCancel} placeholder="Enter your interview questions here..." /> : <div className="h-full flex flex-col">
                <div className="flex-shrink-0 p-4 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-gray-600">
                        Click to edit or use the buttons on the right
                      </p>
                      {/* Video Length Setting in View Mode */}
                      <div className="flex items-center gap-2">
                        <Label htmlFor="video-length-view" className="text-sm font-medium text-gray-700">Max Video Length Per Question:</Label>
                        <Select value={interviewVideoMaxLength.toString()} onValueChange={value => actions.setInterviewVideoMaxLength(parseInt(value))}>
                          <SelectTrigger className="w-32 h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 minute</SelectItem>
                            <SelectItem value="3">3 minutes</SelectItem>
                            <SelectItem value="5">5 minutes</SelectItem>
                            <SelectItem value="10">10 minutes</SelectItem>
                            <SelectItem value="15">15 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => actions.setIsEditingInterviewQuestions(true)} className="flex items-center gap-1 text-xs h-8 px-3">
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full w-full">
                    <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors min-h-full" onClick={() => actions.setIsEditingInterviewQuestions(true)} style={{
                lineHeight: '1.6',
                fontSize: '14px',
                wordWrap: 'break-word'
              }} dangerouslySetInnerHTML={{
                __html: parseMarkdown(generatedInterviewQuestions)
              }} />
                  </ScrollArea>
                </div>
              </div>}
          </CardContent>
        </Card>}
    </div>;
};