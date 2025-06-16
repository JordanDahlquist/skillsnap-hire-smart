
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
import { CustomSpinningLogo } from "@/components/CustomSpinningLogo";
import { InterviewQuestionModeSelector } from "./interview/InterviewQuestionModeSelector";
import { InterviewQuestionTemplateSelector } from "./interview/InterviewQuestionTemplateSelector";
import { InterviewQuestionEditor } from "./interview/InterviewQuestionEditor";
import { InterviewQuestionPreview } from "./interview/InterviewQuestionPreview";
import { InterviewQuestionsData, InterviewQuestionTemplate, DEFAULT_INTERVIEW_TEMPLATES } from "@/types/interviewQuestions";

interface Step4InterviewGeneratorProps {
  generatedJobPost: string;
  generatedInterviewQuestions: string;
  interviewQuestionsData: InterviewQuestionsData;
  interviewQuestionsViewState: 'initial' | 'template_selector' | 'editor' | 'preview';
  interviewVideoMaxLength: number;
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
  interviewVideoMaxLength,
  isGenerating,
  isEditingInterviewQuestions,
  actions,
  onGenerateInterviewQuestions
}: Step4InterviewGeneratorProps) => {
  const hasAnyInterviewContent = Boolean(
    generatedInterviewQuestions || 
    interviewQuestionsData.questions.length > 0
  );

  const handleModeSelect = (mode: 'ai_generated' | 'template_based' | 'custom') => {
    if (mode === 'ai_generated') {
      onGenerateInterviewQuestions();
    } else if (mode === 'template_based') {
      actions.setInterviewQuestionsViewState('template_selector');
    } else if (mode === 'custom') {
      actions.setInterviewQuestionsData({
        ...interviewQuestionsData,
        mode: 'custom'
      });
      actions.setInterviewQuestionsViewState('editor');
    }
  };

  const handleTemplateSelect = (template: InterviewQuestionTemplate) => {
    const questionsWithIds = template.questions.map((q, index) => ({
      ...q,
      id: crypto.randomUUID(),
      order: index + 1
    }));

    actions.setInterviewQuestionsData({
      questions: questionsWithIds,
      maxQuestions: template.questions.length + 5,
      mode: 'template_based',
      estimatedCompletionTime: template.estimatedTime,
      instructions: `Answer the following questions about the ${template.name.toLowerCase()} position.`,
      defaultVideoLength: 5
    });
    actions.setInterviewQuestionsViewState('editor');
  };

  const handleInterviewQuestionsSave = () => {
    actions.setIsEditingInterviewQuestions(false);
  };

  const handleInterviewQuestionsCancel = () => {
    actions.setIsEditingInterviewQuestions(false);
  };

  // Render based on view state
  if (interviewQuestionsViewState === 'template_selector') {
    return (
      <div className="h-full">
        <Card className="h-full">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Video className="w-5 h-5 text-purple-600" />
              Choose Interview Template
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <InterviewQuestionTemplateSelector
              onSelectTemplate={handleTemplateSelect}
              onBack={() => actions.setInterviewQuestionsViewState('initial')}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (interviewQuestionsViewState === 'editor') {
    return (
      <div className="h-full">
        <Card className="h-full">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Video className="w-5 h-5 text-purple-600" />
              Interview Questions Builder
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <InterviewQuestionEditor
              interviewQuestionsData={interviewQuestionsData}
              onInterviewQuestionsDataChange={actions.setInterviewQuestionsData}
              onBack={() => actions.setInterviewQuestionsViewState('initial')}
              onPreview={() => actions.setInterviewQuestionsViewState('preview')}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (interviewQuestionsViewState === 'preview') {
    return (
      <div className="h-full">
        <Card className="h-full">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Video className="w-5 h-5 text-purple-600" />
              Interview Questions Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <InterviewQuestionPreview
              interviewQuestionsData={interviewQuestionsData}
              onBack={() => actions.setInterviewQuestionsViewState('editor')}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Initial state or showing generated content
  if (!hasAnyInterviewContent) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
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
                {isGenerating ? (
                  <CustomSpinningLogo size={48} animationSpeed="fast" />
                ) : (
                  <Video className="w-8 h-8 text-purple-600" />
                )}
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
                  Default Video Length
                </Label>
                <Select 
                  value={interviewVideoMaxLength.toString()} 
                  onValueChange={(value) => actions.setInterviewVideoMaxLength(parseInt(value))}
                >
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

              {/* Mode Selection */}
              <InterviewQuestionModeSelector onSelectMode={handleModeSelect} />
              
              <div className="mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => actions.setCurrentStep(5)} 
                  className="text-gray-600 hover:text-gray-800" 
                  size="default"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Skip Interview Questions
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                You can always add interview questions later after publishing your job
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show generated/structured content
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Video className="w-5 h-5 text-purple-600" />
              Interview Questions
              {interviewQuestionsData.questions.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {interviewQuestionsData.questions.length} questions
                </Badge>
              )}
            </CardTitle>
            <Badge variant="outline" className="text-xs text-gray-600 bg-gray-50">
              Optional
            </Badge>
          </div>
          {!isEditingInterviewQuestions && (
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">
                Max length: {interviewVideoMaxLength} min
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => actions.setInterviewQuestionsViewState('initial')} 
                className="text-xs h-8 px-3"
              >
                Change Mode
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        {isEditingInterviewQuestions ? (
          <RichTextEditor 
            value={generatedInterviewQuestions} 
            onChange={actions.setGeneratedInterviewQuestions} 
            onSave={handleInterviewQuestionsSave} 
            onCancel={handleInterviewQuestionsCancel} 
            placeholder="Enter your interview questions here..." 
          />
        ) : (
          <div className="h-full flex flex-col">
            <div className="flex-shrink-0 p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-gray-600">
                    {interviewQuestionsData.questions.length > 0 
                      ? 'Structured interview questions' 
                      : 'Click to edit or use the buttons on the right'
                    }
                  </p>
                  {/* Video Length Setting in View Mode */}
                  <div className="flex items-center gap-2">
                    <Label htmlFor="video-length-view" className="text-sm font-medium text-gray-700">Max Video Length Per Question:</Label>
                    <Select 
                      value={interviewVideoMaxLength.toString()} 
                      onValueChange={(value) => actions.setInterviewVideoMaxLength(parseInt(value))}
                    >
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
                <div className="flex items-center gap-2">
                  {interviewQuestionsData.questions.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => actions.setInterviewQuestionsViewState('editor')} 
                      className="flex items-center gap-1 text-xs h-8 px-3"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit Structure
                    </Button>
                  )}
                  {generatedInterviewQuestions && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => actions.setIsEditingInterviewQuestions(true)} 
                      className="flex items-center gap-1 text-xs h-8 px-3"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit Text
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full w-full">
                {interviewQuestionsData.questions.length > 0 ? (
                  <div className="p-4 space-y-4">
                    {interviewQuestionsData.questions.map((question, index) => (
                      <Card key={question.id} className="border-l-4 border-l-purple-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium">Question {index + 1}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {question.type.replace('_', ' ')}
                              </Badge>
                              {question.required && (
                                <Badge variant="outline" className="text-xs text-red-600">
                                  Required
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-900 mb-2">{question.question}</p>
                          {question.candidateInstructions && (
                            <p className="text-sm text-gray-600 italic">
                              Instructions: {question.candidateInstructions}
                            </p>
                          )}
                          {question.type === 'video_response' && (
                            <p className="text-sm text-purple-600 mt-2">
                              Max video length: {question.videoMaxLength || 5} minutes
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors min-h-full" 
                    onClick={() => actions.setIsEditingInterviewQuestions(true)} 
                    style={{
                      lineHeight: '1.6',
                      fontSize: '14px',
                      wordWrap: 'break-word'
                    }} 
                    dangerouslySetInnerHTML={{
                      __html: parseMarkdown(generatedInterviewQuestions)
                    }} 
                  />
                )}
              </ScrollArea>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
