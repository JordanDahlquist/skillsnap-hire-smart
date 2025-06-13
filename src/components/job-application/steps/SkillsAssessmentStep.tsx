
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { VideoUploadField } from "../VideoUploadField";
import { Brain, FileText, Video } from "lucide-react";
import { SkillsTestData, SkillsQuestion } from "@/types/skillsAssessment";

interface SkillsAssessmentStepProps {
  job: any;
  formData: any;
  onFormDataChange: (updates: any) => void;
  onValidationChange: (isValid: boolean) => void;
  onNext?: () => void;
  onBack?: () => void;
}

interface SkillsResponse {
  questionId: string;
  question: string;
  answer: string;
  answerType: 'text' | 'video';
  videoUrl?: string;
  videoFileName?: string;
  videoFileSize?: number;
}

export const SkillsAssessmentStep = ({
  job,
  formData,
  onFormDataChange,
  onValidationChange,
  onNext,
  onBack
}: SkillsAssessmentStepProps) => {
  const [responses, setResponses] = useState<SkillsResponse[]>([]);
  const [questions, setQuestions] = useState<SkillsQuestion[]>([]);

  // Parse skills test data from job
  useEffect(() => {
    if (job.generated_test) {
      try {
        const skillsTestData: SkillsTestData = JSON.parse(job.generated_test);
        setQuestions(skillsTestData.questions || []);
        
        // Initialize responses if not already set
        if (responses.length === 0) {
          const initialResponses = skillsTestData.questions.map(q => ({
            questionId: q.id,
            question: q.question,
            answer: '',
            answerType: 'text' as const
          }));
          setResponses(initialResponses);
        }
      } catch (error) {
        console.error('Error parsing skills test data:', error);
      }
    }
  }, [job.generated_test]);

  // Update form data when responses change
  useEffect(() => {
    const skillsTestResponses = responses
      .filter(r => r.answer.trim() || r.videoUrl)
      .map(r => ({
        question: r.question,
        answer: r.answerType === 'video' ? `[Video Response: ${r.videoFileName}]` : r.answer,
        answerType: r.answerType,
        videoUrl: r.videoUrl,
        videoFileName: r.videoFileName,
        videoFileSize: r.videoFileSize
      }));

    onFormDataChange({ skillsTestResponses });
    
    // Validate - at least half the questions should be answered
    const answeredCount = responses.filter(r => r.answer.trim() || r.videoUrl).length;
    const isValid = answeredCount >= Math.ceil(questions.length / 2);
    onValidationChange(isValid);
  }, [responses, questions.length, onFormDataChange, onValidationChange]);

  const updateResponse = (questionId: string, updates: Partial<SkillsResponse>) => {
    setResponses(prev => prev.map(r => 
      r.questionId === questionId ? { ...r, ...updates } : r
    ));
  };

  const toggleAnswerType = (questionId: string) => {
    setResponses(prev => prev.map(r => 
      r.questionId === questionId 
        ? { 
            ...r, 
            answerType: r.answerType === 'text' ? 'video' : 'text',
            answer: '',
            videoUrl: undefined,
            videoFileName: undefined,
            videoFileSize: undefined
          }
        : r
    ));
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <Brain className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Skills Assessment</h3>
        <p className="text-gray-600">This job doesn't have a skills assessment.</p>
        {onNext && (
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={onNext}>
              Continue
            </Button>
          </div>
        )}
      </div>
    );
  }

  const answeredCount = responses.filter(r => r.answer.trim() || r.videoUrl).length;
  const requiredAnswers = Math.ceil(questions.length / 2);
  const isValid = answeredCount >= requiredAnswers;

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-gray-900">
            <Brain className="w-6 h-6 text-blue-600" />
            Skills Assessment
          </CardTitle>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
              {answeredCount} of {questions.length} answered
            </Badge>
            <p className="text-sm text-gray-600">
              Answer at least {requiredAnswers} questions to continue
            </p>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-6">
        {questions.map((question, index) => {
          const response = responses.find(r => r.questionId === question.id);
          if (!response) return null;

          return (
            <Card key={question.id} className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Question {index + 1}
                    </h3>
                    <p className="text-gray-800 leading-relaxed">
                      {question.question}
                    </p>
                    {question.description && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        {question.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      type="button"
                      variant={response.answerType === 'text' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => response.answerType !== 'text' && toggleAnswerType(question.id)}
                      className="flex items-center gap-1"
                    >
                      <FileText className="w-4 h-4" />
                      Text
                    </Button>
                    <Button
                      type="button"
                      variant={response.answerType === 'video' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => response.answerType !== 'video' && toggleAnswerType(question.id)}
                      className="flex items-center gap-1"
                    >
                      <Video className="w-4 h-4" />
                      Video
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {response.answerType === 'text' ? (
                  <Textarea
                    placeholder="Type your response here..."
                    value={response.answer}
                    onChange={(e) => updateResponse(question.id, { answer: e.target.value })}
                    className="min-h-[120px] resize-none"
                    rows={5}
                  />
                ) : (
                  <VideoUploadField
                    questionId={question.id}
                    onVideoUploaded={(videoUrl, fileName, fileSize) => {
                      updateResponse(question.id, {
                        answer: `Video response: ${fileName}`,
                        videoUrl,
                        videoFileName: fileName,
                        videoFileSize: fileSize
                      });
                    }}
                    existingVideoUrl={response.videoUrl}
                    existingFileName={response.videoFileName}
                  />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> You can answer questions with either text or video responses. 
          Video responses allow you to demonstrate your skills more effectively and provide a personal touch to your application.
        </p>
      </div>

      {/* Navigation buttons */}
      {(onNext || onBack) && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} disabled={!onBack}>
            Back
          </Button>
          <Button onClick={onNext} disabled={!onNext || !isValid}>
            Continue
          </Button>
        </div>
      )}
    </div>
  );
};
