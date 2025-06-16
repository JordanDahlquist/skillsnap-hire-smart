
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { VideoUploadField } from "../VideoUploadField";
import { SkillsFileUpload } from "../SkillsFileUpload";
import { SkillsCodeEditor } from "../SkillsCodeEditor";
import { Brain, Link, Code, Upload, FileText, ExternalLink } from "lucide-react";
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
  answerType: 'text' | 'video' | 'file' | 'url' | 'code';
  videoUrl?: string;
  videoFileName?: string;
  videoFileSize?: number;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  codeLanguage?: string;
  metadata?: any;
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
        
        // Initialize responses based on question types
        if (responses.length === 0) {
          const initialResponses = skillsTestData.questions.map(q => {
            let answerType: 'text' | 'video' | 'file' | 'url' | 'code' = 'text';
            
            switch (q.type) {
              case 'video_upload':
                answerType = 'video';
                break;
              case 'file_upload':
              case 'pdf_upload':
                answerType = 'file';
                break;
              case 'portfolio_link':
              case 'video_link':
              case 'url_submission':
                answerType = 'url';
                break;
              case 'code_submission':
                answerType = 'code';
                break;
              default:
                answerType = 'text';
            }
            
            return {
              questionId: q.id,
              question: q.question,
              answer: '',
              answerType
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
      .filter(r => {
        switch (r.answerType) {
          case 'text':
            return r.answer.trim();
          case 'video':
            return r.videoUrl;
          case 'file':
            return r.fileUrl;
          case 'url':
            return r.answer.trim();
          case 'code':
            return r.answer.trim();
          default:
            return false;
        }
      })
      .map(r => ({
        questionId: r.questionId,
        question: r.question,
        answer: r.answer,
        answerType: r.answerType,
        videoUrl: r.videoUrl,
        videoFileName: r.videoFileName,
        videoFileSize: r.videoFileSize,
        fileUrl: r.fileUrl,
        fileName: r.fileName,
        fileSize: r.fileSize,
        fileType: r.fileType,
        codeLanguage: r.codeLanguage,
        metadata: r.metadata
      }));

    onFormDataChange({ skillsTestResponses });
    
    // Validate - at least half the questions should be answered
    const answeredCount = skillsTestResponses.length;
    const isValid = answeredCount >= Math.ceil(questions.length / 2);
    onValidationChange(isValid);
  }, [responses, questions.length, onFormDataChange, onValidationChange]);

  const updateResponse = (questionId: string, updates: Partial<SkillsResponse>) => {
    setResponses(prev => prev.map(r => 
      r.questionId === questionId ? { ...r, ...updates } : r
    ));
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'video_upload':
        return Brain;
      case 'file_upload':
      case 'pdf_upload':
        return Upload;
      case 'portfolio_link':
      case 'video_link':
      case 'url_submission':
        return ExternalLink;
      case 'code_submission':
        return Code;
      default:
        return FileText;
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    const labels = {
      text: "Text Response",
      long_text: "Long Text Response",
      video_upload: "Video Upload",
      video_link: "Video Link",
      portfolio_link: "Portfolio Link",
      code_submission: "Code Submission",
      file_upload: "File Upload",
      pdf_upload: "PDF Upload",
      url_submission: "URL Submission"
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getAcceptedFileTypes = (type: string) => {
    switch (type) {
      case 'pdf_upload':
        return 'application/pdf';
      case 'file_upload':
        return '.pdf,.doc,.docx,.txt,.rtf';
      default:
        return '*/*';
    }
  };

  const renderQuestionInput = (question: SkillsQuestion, response: SkillsResponse) => {
    const IconComponent = getQuestionTypeIcon(question.type);

    switch (question.type) {
      case 'video_upload':
        return (
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
        );

      case 'file_upload':
      case 'pdf_upload':
        return (
          <SkillsFileUpload
            questionId={question.id}
            acceptedTypes={getAcceptedFileTypes(question.type)}
            maxSizeMB={50}
            onFileUploaded={(result) => {
              updateResponse(question.id, {
                answer: `File uploaded: ${result.fileName}`,
                fileUrl: result.url,
                fileName: result.fileName,
                fileSize: result.fileSize,
                fileType: result.fileType
              });
            }}
            existingFile={response.fileUrl ? {
              url: response.fileUrl,
              fileName: response.fileName || 'Unknown file',
              fileSize: response.fileSize || 0
            } : undefined}
          />
        );

      case 'portfolio_link':
      case 'video_link':
      case 'url_submission':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <IconComponent className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">
                {question.type === 'portfolio_link' ? 'Portfolio URL' : 
                 question.type === 'video_link' ? 'Video URL' : 'URL'}
              </span>
            </div>
            <Input
              type="url"
              placeholder="https://..."
              value={response.answer}
              onChange={(e) => updateResponse(question.id, { answer: e.target.value })}
              className="w-full"
            />
            {response.answer && (
              <div className="text-xs text-gray-500">
                <a 
                  href={response.answer} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Preview link
                </a>
              </div>
            )}
          </div>
        );

      case 'code_submission':
        return (
          <SkillsCodeEditor
            value={response.answer}
            onChange={(code, language) => {
              updateResponse(question.id, {
                answer: code,
                codeLanguage: language,
                metadata: { language }
              });
            }}
          />
        );

      case 'long_text':
        return (
          <Textarea
            placeholder="Type your detailed response here..."
            value={response.answer}
            onChange={(e) => updateResponse(question.id, { answer: e.target.value })}
            className="min-h-[150px] resize-none"
            rows={8}
          />
        );

      default: // 'text'
        return (
          <Textarea
            placeholder="Type your response here..."
            value={response.answer}
            onChange={(e) => updateResponse(question.id, { answer: e.target.value })}
            className="min-h-[120px] resize-none"
            rows={5}
          />
        );
    }
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

  const answeredCount = responses.filter(r => {
    switch (r.answerType) {
      case 'text':
        return r.answer.trim();
      case 'video':
        return r.videoUrl;
      case 'file':
        return r.fileUrl;
      case 'url':
        return r.answer.trim();
      case 'code':
        return r.answer.trim();
      default:
        return false;
    }
  }).length;
  
  const requiredAnswers = Math.ceil(questions.length / 2);
  const isValid = answeredCount >= requiredAnswers;

  return (
    <div className="space-y-8">
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

      <div className="space-y-8">
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
                    <p className="text-gray-800 leading-relaxed mb-3">
                      {question.question}
                    </p>
                    {question.candidateInstructions && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div 
                          className="text-sm text-blue-800 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: question.candidateInstructions }}
                        />
                      </div>
                    )}
                  </div>
                  <Badge 
                    variant="outline" 
                    className="ml-4 text-purple-600 border-purple-200 bg-purple-50"
                  >
                    {getQuestionTypeLabel(question.type)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {renderQuestionInput(question, response)}
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
