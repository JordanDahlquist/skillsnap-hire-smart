
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Clock, FileText, Upload, Link, Type, AlertCircle } from "lucide-react";
import { Job } from "@/types";
import { SkillsQuestion, SkillsResponse } from "@/types/skillsAssessment";
import { SkillsFileUpload } from "../SkillsFileUpload";
import { MarkdownTextRenderer } from "../MarkdownTextRenderer";
import { toast } from "sonner";

interface SkillsAssessmentStepProps {
  job: Job;
  formData: any;
  onFormDataChange: (updates: any) => void;
  onValidationChange: (isValid: boolean) => void;
  onNext: () => void;
  onBack: () => void;
}

const getQuestionTypeIcon = (type: string) => {
  switch (type) {
    case 'file_upload':
      return Upload;
    case 'url_submission':
    case 'portfolio_link':
      return Link;
    case 'text':
    case 'long_text':
    default:
      return Type;
  }
};

const getQuestionTypeLabel = (type: string) => {
  switch (type) {
    case 'text':
      return 'Text Response';
    case 'long_text':
      return 'Long Text Response';
    case 'file_upload':
      return 'File Upload';
    case 'url_submission':
      return 'URL Submission';
    case 'portfolio_link':
      return 'Portfolio Link';
    default:
      return 'Text Response';
  }
};

export const SkillsAssessmentStep = ({
  job,
  formData,
  onFormDataChange,
  onValidationChange,
  onNext,
  onBack
}: SkillsAssessmentStepProps) => {
  const [responses, setResponses] = useState<{ [key: string]: SkillsResponse }>({});
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  let skillsData: { questions: SkillsQuestion[], instructions?: string } = { questions: [] };
  
  try {
    if (job.generated_test) {
      skillsData = JSON.parse(job.generated_test);
    }
  } catch (error) {
    console.error('Error parsing skills test data:', error);
  }

  // Initialize responses
  useEffect(() => {
    if (formData.skillsTestResponses) {
      const responseMap: { [key: string]: SkillsResponse } = {};
      formData.skillsTestResponses.forEach((response: SkillsResponse) => {
        responseMap[response.questionId] = response;
      });
      setResponses(responseMap);
    }
  }, [formData.skillsTestResponses]);

  // Enhanced validation logic
  useEffect(() => {
    const errors: { [key: string]: string } = {};
    let isValid = true;

    skillsData.questions.forEach((question) => {
      if (question.required) {
        const response = responses[question.id];
        
        // Check if response exists and has appropriate content based on question type
        if (!response) {
          errors[question.id] = 'This field is required';
          isValid = false;
        } else if (question.type === 'file_upload') {
          // For file uploads, check if we have a file URL
          if (!response.fileUrl || !response.answer?.trim()) {
            errors[question.id] = 'Please upload a file';
            isValid = false;
          }
        } else {
          // For text responses, check if answer exists and is not empty
          if (!response.answer?.trim()) {
            errors[question.id] = 'This field is required';
            isValid = false;
          }
        }
      }
    });

    console.log('Validation state:', { errors, isValid, responses });
    setValidationErrors(errors);
    onValidationChange(isValid);
  }, [responses, skillsData.questions, onValidationChange]);

  const updateResponse = (questionId: string, updates: Partial<SkillsResponse>) => {
    const updatedResponses = {
      ...responses,
      [questionId]: {
        ...responses[questionId],
        questionId,
        submittedAt: new Date().toISOString(),
        ...updates
      }
    };
    
    console.log('Updating response:', { questionId, updates, updatedResponses });
    setResponses(updatedResponses);
    
    // Convert to array for form data
    const responseArray = Object.values(updatedResponses);
    onFormDataChange({ skillsTestResponses: responseArray });
  };

  const handleSubmit = () => {
    const hasErrors = Object.keys(validationErrors).length > 0;
    console.log('Submit attempt:', { hasErrors, validationErrors, responses });
    
    if (hasErrors) {
      toast.error("Please complete all required fields before continuing.");
      return;
    }
    onNext();
  };

  if (skillsData.questions.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Skills Assessment</h3>
          <p className="text-gray-600 mb-6">This position doesn't require a skills assessment.</p>
          <Button variant="solid" onClick={onNext}>Continue to Next Step</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <CardTitle className="text-2xl">Skills Assessment</CardTitle>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>~{skillsData.questions.length * 5} minutes</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span>{skillsData.questions.length} questions</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Instructions */}
      {skillsData.instructions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <MarkdownTextRenderer text={skillsData.instructions} />
          </CardContent>
        </Card>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {skillsData.questions.map((question, index) => {
          const TypeIcon = getQuestionTypeIcon(question.type);
          const response = responses[question.id];
          const hasError = validationErrors[question.id];

          return (
            <Card key={question.id} className={`border-l-4 ${hasError ? 'border-l-red-500' : 'border-l-blue-500'}`}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      <span className="text-sm font-semibold text-blue-700">{index + 1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TypeIcon className="w-4 h-4 text-blue-600" />
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {getQuestionTypeLabel(question.type)}
                      </Badge>
                      {question.required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Question */}
                <div>
                  <Label className="text-lg font-semibold text-gray-900 leading-relaxed">
                    {question.question}
                  </Label>
                </div>

                {/* Instructions */}
                {question.candidateInstructions && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <MarkdownTextRenderer text={question.candidateInstructions} />
                  </div>
                )}

                {/* Input Field */}
                <div className="space-y-2">
                  {question.type === 'file_upload' ? (
                    <SkillsFileUpload
                      questionId={question.id}
                      onFileUploaded={(result) => {
                        console.log('File uploaded for question:', question.id, result);
                        updateResponse(question.id, {
                          answer: result.fileName,
                          fileUrl: result.url,
                          fileName: result.fileName,
                          fileSize: result.fileSize
                        });
                      }}
                      existingFile={response?.fileUrl ? {
                        url: response.fileUrl,
                        fileName: response.fileName || response.answer,
                        fileSize: response.fileSize || 0
                      } : undefined}
                    />
                  ) : question.type === 'long_text' ? (
                    <Textarea
                      value={response?.answer || ''}
                      onChange={(e) => updateResponse(question.id, { answer: e.target.value })}
                      placeholder="Enter your detailed response here..."
                      className="min-h-[120px]"
                    />
                  ) : (
                    <Input
                      type={question.type === 'url_submission' || question.type === 'portfolio_link' ? 'url' : 'text'}
                      value={response?.answer || ''}
                      onChange={(e) => updateResponse(question.id, { answer: e.target.value })}
                      placeholder={
                        question.type === 'url_submission' || question.type === 'portfolio_link' 
                          ? 'https://...' 
                          : 'Enter your response here...'
                      }
                    />
                  )}
                  
                  {hasError && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {hasError}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button variant="solid" onClick={handleSubmit}>
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
