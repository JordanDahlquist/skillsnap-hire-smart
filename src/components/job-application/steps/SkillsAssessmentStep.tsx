
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Clock, FileText, Upload, Link, Type, AlertCircle, Info, List } from "lucide-react";
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
    case 'video_upload':
    case 'video_link':
      return Link;
    case 'multiple_choice':
      return List;
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
    case 'multiple_choice':
      return 'Multiple Choice';
    case 'file_upload':
      return 'File Upload';
    case 'url_submission':
      return 'URL Submission';
    case 'portfolio_link':
      return 'Portfolio Link';
    case 'video_upload':
    case 'video_link':
      return 'Video/Audio Link';
    default:
      return 'Text Response';
  }
};

const getPlaceholderText = (type: string) => {
  switch (type) {
    case 'url_submission':
    case 'portfolio_link':
      return 'Share a public Google Drive link, Dropbox link, or website URL...';
    case 'video_upload':
    case 'video_link':
      return 'Share a public link to your video/audio recording (Google Drive, Dropbox, YouTube, etc.)...';
    case 'long_text':
      return 'Provide your detailed response here...';
    default:
      return 'Enter your response here...';
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
        } else if (question.type === 'url_submission' || question.type === 'portfolio_link' || question.type === 'video_upload' || question.type === 'video_link') {
          // For URL submissions, only check if answer (URL) exists and is not empty
          if (!response.answer?.trim()) {
            errors[question.id] = 'Please provide a valid URL';
            isValid = false;
          }
        } else if (question.type === 'multiple_choice') {
          // For multiple choice, check if at least one option is selected
          if (!response.answer?.trim()) {
            errors[question.id] = 'Please select at least one option';
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
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <CardTitle className="text-2xl text-blue-900">Skills Assessment</CardTitle>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm text-blue-700">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>~{skillsData.questions.length * 15} minutes</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span>{skillsData.questions.length} challenge{skillsData.questions.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Instructions */}
      {skillsData.instructions && (
        <Card className="border-blue-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg text-blue-900">Instructions</CardTitle>
            </div>
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
            <Card key={question.id} className={`transition-all ${hasError ? 'border-orange-300 bg-orange-50' : 'border-gray-200 hover:border-blue-300'}`}>
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
                        <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                          Required
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Question Title */}
                {question.title && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 leading-relaxed mb-2">
                      {question.title}
                    </h3>
                  </div>
                )}

                {/* Question */}
                <div>
                  <Label className="text-base text-gray-800 leading-relaxed font-medium">
                    {question.question}
                  </Label>
                </div>

                {/* Instructions */}
                {question.candidateInstructions && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <MarkdownTextRenderer text={question.candidateInstructions} />
                    </CardContent>
                  </Card>
                )}

                {/* Submission Guidelines */}
                {(question.type === 'url_submission' || question.type === 'portfolio_link' || question.type === 'file_upload' || question.type === 'video_upload' || question.type === 'video_link') && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-green-600 mt-0.5" />
                      <div className="text-sm text-green-800">
                        <p className="font-medium mb-1">Submission Guidelines:</p>
                        <ul className="space-y-1 text-green-700">
                          <li>• Upload your work to Google Drive, Dropbox, YouTube, or similar platform</li>
                          <li>• Make sure the link is publicly accessible (anyone with the link can view)</li>
                          <li>• For audio/video: Record your response and upload to a cloud service</li>
                          <li>• Paste the shareable link in the field below</li>
                          <li>• Double-check that the link works before submitting</li>
                        </ul>
                      </div>
                    </div>
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
                  ) : question.type === 'multiple_choice' && question.multipleChoice?.options ? (
                    <div className="space-y-3">
                      {question.multipleChoice?.options?.map((option, index) => {
                        const selectedAnswers = response?.answer ? response.answer.split(',') : [];
                        const isSelected = selectedAnswers.includes(option);
                        
                        return (
                          <label
                            key={index}
                            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <input
                              type={question.multipleChoice?.allowMultiple ? "checkbox" : "radio"}
                              name={`question-${question.id}`}
                              value={option}
                              checked={isSelected}
                              onChange={(e) => {
                                if (question.multipleChoice?.allowMultiple) {
                                  // Handle multiple selection
                                  let newAnswers = selectedAnswers.filter(a => a !== option);
                                  if (e.target.checked) {
                                    newAnswers.push(option);
                                  }
                                  updateResponse(question.id, { answer: newAnswers.join(',') });
                                } else {
                                  // Handle single selection
                                  updateResponse(question.id, { answer: option });
                                }
                              }}
                              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-gray-700 flex-1">{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : question.type === 'long_text' ? (
                    <Textarea
                      value={response?.answer || ''}
                      onChange={(e) => updateResponse(question.id, { answer: e.target.value })}
                      placeholder={getPlaceholderText(question.type)}
                      className="min-h-[120px] border-gray-300 focus:border-blue-500"
                      rows={6}
                    />
                  ) : question.type === 'multiple_choice' ? (
                    <div className="space-y-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-600">This question has no available options.</p>
                      <p className="text-xs text-gray-500">Please contact the employer for clarification.</p>
                    </div>
                  ) : (
                    <Input
                      type={question.type === 'url_submission' || question.type === 'portfolio_link' || question.type === 'video_upload' || question.type === 'video_link' ? 'url' : 'text'}
                      value={response?.answer || ''}
                      onChange={(e) => updateResponse(question.id, { answer: e.target.value })}
                      placeholder={getPlaceholderText(question.type)}
                      className="border-gray-300 focus:border-blue-500"
                    />
                  )}
                  
                  {hasError && (
                    <p className="text-sm text-orange-600 flex items-center gap-1">
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
        <Button variant="solid" onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
          Continue to Next Step
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
