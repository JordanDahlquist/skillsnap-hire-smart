
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

// Helper function to parse generated text into individual questions
const parseGeneratedQuestions = (text: string): string[] => {
  if (!text) return [];
  
  // Split by numbered questions (1., 2., etc.) or bullet points (-, *)
  const parsedQuestions = text
    .split(/\d+\.|\n-|\n\*/)
    .map(q => q.trim())
    .filter(q => q.length > 10 && !q.toLowerCase().includes('interview questions'))
    .slice(0, 10); // Limit to 10 questions max
  
  return parsedQuestions;
};

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

  // Parse generated questions for display
  const parsedQuestions = parseGeneratedQuestions(generatedInterviewQuestions);

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Video className="w-5 h-5 text-purple-600" />
              Interview Questions
              {interviewQuestionsData.questions.length > 0 ? (
                <Badge variant="outline" className="text-xs">
                  {interviewQuestionsData.questions.length} questions
                </Badge>
              ) : parsedQuestions.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {parsedQuestions.length} questions
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
                variant="ghost" 
                size="sm" 
                onClick={() => actions.setInterviewQuestionsViewState('initial')} 
                className="text-xs h-8 px-3 text-gray-600 hover:text-gray-900"
              >
                Start Over
              </Button>
              {interviewQuestionsData.questions.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => actions.setInterviewQuestionsViewState('preview')} 
                  className="text-xs h-8 px-3 text-gray-600 hover:text-gray-900"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Preview
                </Button>
              )}
              {interviewQuestionsData.questions.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => actions.setInterviewQuestionsViewState('editor')} 
                  className="text-xs h-8 px-3 text-gray-600 hover:text-gray-900"
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  Edit Structure
                </Button>
              )}
              {generatedInterviewQuestions && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => actions.setIsEditingInterviewQuestions(true)} 
                  className="text-xs h-8 px-3 text-gray-600 hover:text-gray-900"
                >
                  <Edit3 className="w-3 h-3" />
                  Edit
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
          <div className="h-full overflow-hidden">
            <ScrollArea className="h-full w-full">
              {interviewQuestionsData.questions.length > 0 ? (
                <div className="p-4 space-y-4">
                  {interviewQuestionsData.questions.map((question, index) => (
                    <Card key={question.id} className="border-l-4 border-l-purple-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-base text-gray-900">Question {index + 1}</h4>
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
                        <p className="text-gray-900 mb-3 text-sm leading-relaxed">{question.question}</p>
                        {question.candidateInstructions && (
                          <p className="text-gray-600 italic mb-3 text-sm leading-relaxed">
                            Instructions: {question.candidateInstructions}
                          </p>
                        )}
                        {question.type === 'video_response' && (
                          <p className="text-purple-600 font-medium text-sm">
                            Max video length: {question.videoMaxLength || 5} minutes
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : parsedQuestions.length > 0 ? (
                <div className="p-4 space-y-4">
                  {parsedQuestions.map((question, index) => (
                    <Card key={index} className="border-l-4 border-l-purple-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-base text-gray-900">Question {index + 1}</h4>
                          <Badge variant="outline" className="text-xs">
                            video response
                          </Badge>
                        </div>
                        <p className="text-gray-900 mb-3 text-sm leading-relaxed">{question}</p>
                        <p className="text-purple-600 font-medium text-sm">
                          Max video length: 5 minutes
                        </p>
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
        )}
      </CardContent>
    </Card>
  );
};
