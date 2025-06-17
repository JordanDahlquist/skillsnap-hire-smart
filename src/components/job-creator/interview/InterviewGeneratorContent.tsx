
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit3, Video, Eye } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { parseMarkdown } from "@/utils/markdownParser";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UnifiedJobCreatorActions } from "@/types/jobForm";
import { InterviewQuestionsData } from "@/types/interviewQuestions";

interface InterviewGeneratorContentProps {
  generatedInterviewQuestions: string;
  interviewQuestionsData: InterviewQuestionsData;
  isEditingInterviewQuestions: boolean;
  actions: UnifiedJobCreatorActions;
}

export const InterviewGeneratorContent = ({
  generatedInterviewQuestions,
  interviewQuestionsData,
  isEditingInterviewQuestions,
  actions
}: InterviewGeneratorContentProps) => {
  const handleInterviewQuestionsSave = () => {
    actions.setIsEditingInterviewQuestions(false);
  };

  const handleInterviewQuestionsCancel = () => {
    actions.setIsEditingInterviewQuestions(false);
  };

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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => actions.setInterviewQuestionsViewState('initial')} 
                className="text-xs h-8 px-3"
              >
                Start Over
              </Button>
              {interviewQuestionsData.questions.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => actions.setInterviewQuestionsViewState('preview')} 
                  className="text-xs h-8 px-3"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Preview
                </Button>
              )}
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
                      : 'Review generated interview questions below'}
                  </p>
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
                  <div className="p-6 space-y-6">
                    {interviewQuestionsData.questions.map((question, index) => (
                      <Card key={question.id} className="border-l-4 border-l-purple-500">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="font-semibold text-lg text-gray-900">Question {index + 1}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-sm">
                                {question.type.replace('_', ' ')}
                              </Badge>
                              {question.required && (
                                <Badge variant="outline" className="text-sm text-red-600">
                                  Required
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-900 mb-4 text-lg leading-relaxed">{question.question}</p>
                          {question.candidateInstructions && (
                            <p className="text-gray-600 italic mb-4 text-base leading-relaxed">
                              Instructions: {question.candidateInstructions}
                            </p>
                          )}
                          {question.type === 'video_response' && (
                            <p className="text-purple-600 font-medium text-base">
                              Max video length: {question.videoMaxLength || 5} minutes
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div 
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors min-h-full"
                    onClick={() => actions.setIsEditingInterviewQuestions(true)}
                    style={{
                      lineHeight: '1.8',
                      fontSize: '18px',
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
