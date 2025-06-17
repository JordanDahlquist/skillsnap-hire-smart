
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Edit3, SkipForward, Video } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { parseMarkdown } from "@/utils/markdownParser";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UnifiedJobCreatorActions } from "@/types/jobForm";
import { CustomSpinningLogo } from "@/components/CustomSpinningLogo";
import { InterviewQuestionEditor } from "./interview/InterviewQuestionEditor";
import { InterviewQuestionPreview } from "./interview/InterviewQuestionPreview";
import { InterviewQuestionsData } from "@/types/interviewQuestions";

interface Step4InterviewGeneratorProps {
  generatedJobPost: string;
  generatedInterviewQuestions: string;
  interviewQuestionsData: InterviewQuestionsData;
  interviewQuestionsViewState: 'initial' | 'editor' | 'preview';
  isGenerating: boolean;
  isEditingInterviewQuestions: boolean;
  actions: UnifiedJobCreatorActions;
  onGenerateInterviewQuestions: () => Promise<void>;
}

export const Step4InterviewGenerator = ({
  generatedJobPost,
  generatedInterviewQuestions,
  interviewQuestionsData,
  interviewQuestionsViewState,
  isGenerating,
  isEditingInterviewQuestions,
  actions,
  onGenerateInterviewQuestions
}: Step4InterviewGeneratorProps) => {
  const hasAnyInterviewContent = Boolean(generatedInterviewQuestions || interviewQuestionsData.questions.length > 0);

  const handleModeSelect = (mode: 'ai_generated' | 'custom') => {
    if (mode === 'ai_generated') {
      onGenerateInterviewQuestions();
    } else if (mode === 'custom') {
      actions.setInterviewQuestionsData({
        ...interviewQuestionsData,
        mode: 'custom'
      });
      actions.setInterviewQuestionsViewState('editor');
    }
  };

  const handleInterviewQuestionsSave = () => {
    actions.setIsEditingInterviewQuestions(false);
  };

  const handleInterviewQuestionsCancel = () => {
    actions.setIsEditingInterviewQuestions(false);
  };

  // Render based on view state
  if (interviewQuestionsViewState === 'editor') {
    return <div className="h-full">
        <Card className="h-full">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Video className="w-5 h-5 text-purple-600" />
              Interview Questions Builder
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <InterviewQuestionEditor interviewQuestionsData={interviewQuestionsData} onInterviewQuestionsDataChange={actions.setInterviewQuestionsData} onBack={() => actions.setInterviewQuestionsViewState('initial')} onPreview={() => actions.setInterviewQuestionsViewState('preview')} />
          </CardContent>
        </Card>
      </div>;
  }

  if (interviewQuestionsViewState === 'preview') {
    return <div className="h-full">
        <Card className="h-full">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Video className="w-5 h-5 text-purple-600" />
              Interview Questions Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <InterviewQuestionPreview interviewQuestionsData={interviewQuestionsData} onBack={() => actions.setInterviewQuestionsViewState('editor')} />
          </CardContent>
        </Card>
      </div>;
  }

  // Initial state or showing generated content
  if (!hasAnyInterviewContent) {
    return <div className="h-full flex flex-col overflow-hidden">
        <Card className="h-full">
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
                {isGenerating ? <CustomSpinningLogo size={48} animationSpeed="fast" /> : <Video className="w-8 h-8 text-purple-600" />}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Create Interview Questions
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Generate targeted interview questions that candidates will answer via video submission. Each question can have its own video length limit to evaluate candidates effectively.
              </p>

              {/* Consistent Button Stack - Same as Steps 2 & 3 */}
              <div className="space-y-3">
                <Button onClick={() => handleModeSelect('ai_generated')} disabled={isGenerating} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  {isGenerating ? <CustomSpinningLogo size={16} animationSpeed="fast" className="mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Generate with AI
                </Button>
                
                <Button variant="outline" onClick={() => handleModeSelect('custom')} className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Build Custom Questions
                </Button>
                
                <div className="pt-3 border-t border-gray-200">
                  <Button variant="outline" onClick={() => actions.setCurrentStep(5)} className="w-full text-gray-600 hover:text-gray-800 border-gray-200">
                    <SkipForward className="w-4 h-4 mr-2" />
                    Skip Interview Questions
                  </Button>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                You can always add interview questions later after publishing your job
              </p>
            </div>
          </CardContent>
        </Card>
      </div>;
  }

  // Show generated/structured content
  return <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Video className="w-5 h-5 text-purple-600" />
              Interview Questions
              {interviewQuestionsData.questions.length > 0 && <Badge variant="outline" className="text-xs">
                  {interviewQuestionsData.questions.length} questions
                </Badge>}
            </CardTitle>
            <Badge variant="outline" className="text-xs text-gray-600 bg-gray-50">
              Optional
            </Badge>
          </div>
          {!isEditingInterviewQuestions && <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => actions.setInterviewQuestionsViewState('initial')} className="text-xs h-8 px-3">
                Change Mode
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
                    {interviewQuestionsData.questions.length > 0 ? 'Structured interview questions' : 'Review generated interview questions below'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {interviewQuestionsData.questions.length > 0 && <Button variant="outline" size="sm" onClick={() => actions.setInterviewQuestionsViewState('editor')} className="flex items-center gap-1 text-xs h-8 px-3">
                      <Edit3 className="w-3 h-3" />
                      Edit Structure
                    </Button>}
                  {generatedInterviewQuestions && <Button variant="outline" size="sm" onClick={() => actions.setIsEditingInterviewQuestions(true)} className="flex items-center gap-1 text-xs h-8 px-3">
                      <Edit3 className="w-3 h-3" />
                      Edit Text
                    </Button>}
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full w-full">
                {interviewQuestionsData.questions.length > 0 ? <div className="p-6 space-y-6">
                    {interviewQuestionsData.questions.map((question, index) => <Card key={question.id} className="border-l-4 border-l-purple-500">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="font-semibold text-lg text-gray-900">Question {index + 1}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-sm">
                                {question.type.replace('_', ' ')}
                              </Badge>
                              {question.required && <Badge variant="outline" className="text-sm text-red-600">
                                  Required
                                </Badge>}
                            </div>
                          </div>
                          <p className="text-gray-900 mb-4 text-lg leading-relaxed">{question.question}</p>
                          {question.candidateInstructions && <p className="text-gray-600 italic mb-4 text-base leading-relaxed">
                              Instructions: {question.candidateInstructions}
                            </p>}
                          {question.type === 'video_response' && <p className="text-purple-600 font-medium text-base">
                              Max video length: {question.videoMaxLength || 5} minutes
                            </p>}
                        </CardContent>
                      </Card>)}
                  </div> : <div className="p-6 cursor-pointer hover:bg-gray-50 transition-colors min-h-full" onClick={() => actions.setIsEditingInterviewQuestions(true)} style={{
              lineHeight: '1.8',
              fontSize: '18px',
              wordWrap: 'break-word'
            }} dangerouslySetInnerHTML={{
              __html: parseMarkdown(generatedInterviewQuestions)
            }} />}
              </ScrollArea>
            </div>
          </div>}
      </CardContent>
    </Card>;
};
