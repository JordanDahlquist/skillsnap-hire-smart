import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { VideoUploadField } from "../VideoUploadField";
import { Brain } from "lucide-react";
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
        
        // Initialize responses based on question types (predefined by hiring manager)
        if (responses.length === 0) {
          const initialResponses = skillsTestData.questions.map(q => {
            const answerType = q.type === 'video_upload' ? 'video' : 'text';
            return {
              questionId: q.id,
              question: q.question,
              answer: '',
              answerType: answerType as 'text' | 'video'
            };
          });
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

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <Brain className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Skills Assessment</h3>
        <p className="text-gray-600">This job doesn't have a skills assessment.</p>
        {onNext && (
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Back
            </Button>
            <Button 
              onClick={onNext}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
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

          const isVideoQuestion = question.type === 'video_upload';

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
                    {question.candidateInstructions && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        {question.candidateInstructions}
                      </p>
                    )}
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`ml-4 ${isVideoQuestion ? 'text-purple-600 border-purple-200 bg-purple-50' : 'text-green-600 border-green-200 bg-green-50'}`}
                  >
                    {isVideoQuestion ? 'Video Response' : 'Text Response'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {isVideoQuestion ? (
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
                ) : (
                  <Textarea
                    placeholder="Type your response here..."
                    value={response.answer}
                    onChange={(e) => updateResponse(question.id, { answer: e.target.value })}
                    className="min-h-[120px] resize-none"
                    rows={5}
                  />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Navigation buttons */}
      {(onNext || onBack) && (
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={onBack} 
            disabled={!onBack}
            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Back
          </Button>
          <Button 
            onClick={onNext} 
            disabled={!onNext || !isValid}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:text-gray-600"
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
};
