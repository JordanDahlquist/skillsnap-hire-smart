
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Video, FileText } from "lucide-react";
import { InterviewQuestionsData } from "@/types/interviewQuestions";

interface InterviewQuestionPreviewProps {
  interviewQuestionsData: InterviewQuestionsData;
  onBack: () => void;
}

export const InterviewQuestionPreview = ({
  interviewQuestionsData,
  onBack
}: InterviewQuestionPreviewProps) => {
  const totalVideoTime = interviewQuestionsData.questions
    .filter(q => q.type === 'video_response')
    .reduce((total, q) => total + (q.videoMaxLength || 5), 0);

  const videoQuestions = interviewQuestionsData.questions.filter(q => q.type === 'video_response').length;
  const textQuestions = interviewQuestionsData.questions.filter(q => q.type === 'text_response').length;
  const requiredQuestions = interviewQuestionsData.questions.filter(q => q.required).length;

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'video_response': return <Video className="w-4 h-4 text-purple-600" />;
      case 'text_response': return <FileText className="w-4 h-4 text-blue-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'video_response': return 'bg-purple-100 text-purple-800';
      case 'text_response': return 'bg-blue-100 text-blue-800';
      case 'behavioral': return 'bg-green-100 text-green-800';
      case 'technical': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Editor
        </Button>
        <h3 className="text-lg font-medium">Interview Preview</h3>
      </div>

      {/* Overview Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Interview Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{interviewQuestionsData.questions.length}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{videoQuestions}</div>
              <div className="text-sm text-gray-600">Video Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{textQuestions}</div>
              <div className="text-sm text-gray-600">Text Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{totalVideoTime}</div>
              <div className="text-sm text-gray-600">Max Video Time (min)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      {interviewQuestionsData.instructions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Instructions for Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{interviewQuestionsData.instructions}</p>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Interview Questions</h4>
        
        {interviewQuestionsData.questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getQuestionIcon(question.type)}
                  <span className="font-medium">Question {index + 1}</span>
                  <Badge className={getQuestionTypeColor(question.type)}>
                    {question.type.replace('_', ' ')}
                  </Badge>
                  {question.required && (
                    <Badge variant="outline" className="text-red-600 border-red-200">
                      Required
                    </Badge>
                  )}
                </div>
                {question.type === 'video_response' && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {question.videoMaxLength || 5} min
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-900 font-medium">{question.question}</p>
              
              {question.candidateInstructions && (
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Instructions:</strong> {question.candidateInstructions}
                  </p>
                </div>
              )}

              {question.evaluationCriteria && (
                <div className="bg-green-50 p-3 rounded-md">
                  <p className="text-sm text-green-800">
                    <strong>Evaluation Criteria:</strong> {question.evaluationCriteria}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {interviewQuestionsData.questions.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-600">No interview questions to preview</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
