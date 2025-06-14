
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, FileText, Video, Link, Code, Upload } from "lucide-react";
import { SkillsTestData } from "@/types/skillsAssessment";

interface SkillsTestPreviewProps {
  skillsTestData: SkillsTestData;
  onBack: () => void;
}

export const SkillsTestPreview = ({ skillsTestData, onBack }: SkillsTestPreviewProps) => {
  const getQuestionIcon = (type: string) => {
    const icons = {
      text: FileText,
      long_text: FileText,
      video_upload: Video,
      video_link: Link,
      portfolio_link: Link,
      code_submission: Code,
      file_upload: Upload,
      pdf_upload: Upload,
      url_submission: Link
    };
    return icons[type as keyof typeof icons] || FileText;
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

  const estimatedTime = skillsTestData.estimatedCompletionTime || 
    skillsTestData.questions.length * 5; // 5 minutes per question as default

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="p-1 h-8 w-8"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <CardTitle className="text-lg">Assessment Preview</CardTitle>
          <Badge variant="outline" className="text-xs">
            Candidate View
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">Skills Assessment</h1>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>~{estimatedTime} minutes</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>{skillsTestData.questions.length} questions</span>
              </div>
            </div>
            
            {skillsTestData.instructions && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h3 className="font-medium text-blue-900 mb-2">Instructions</h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  {skillsTestData.instructions}
                </p>
              </div>
            )}
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {skillsTestData.questions.map((question, index) => {
              const IconComponent = getQuestionIcon(question.type);
              
              return (
                <Card key={question.id} className="border border-gray-200">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-gray-900">{question.question}</h3>
                            {question.required && (
                              <span className="text-red-500 text-sm">*</span>
                            )}
                          </div>
                          
                          {question.candidateInstructions && (
                            <p className="text-gray-600 text-sm mb-3">
                              {question.candidateInstructions}
                            </p>
                          )}

                          <div className="flex items-center gap-2 mb-4">
                            <IconComponent className="w-4 h-4 text-gray-500" />
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {getQuestionTypeLabel(question.type)}
                            </span>
                            {question.timeLimit && (
                              <span className="text-xs text-gray-500 bg-yellow-100 px-2 py-1 rounded">
                                {question.timeLimit} min limit
                              </span>
                            )}
                            {question.characterLimit && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {question.characterLimit} char limit
                              </span>
                            )}
                          </div>

                          {/* Mock input based on question type */}
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            {question.type === 'text' && (
                              <input 
                                type="text" 
                                placeholder="Your answer here..." 
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2"
                                disabled 
                              />
                            )}
                            {question.type === 'long_text' && (
                              <textarea 
                                placeholder="Your detailed response here..." 
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2 h-20 resize-none"
                                disabled 
                              />
                            )}
                            {(question.type === 'video_upload' || question.type === 'file_upload' || question.type === 'pdf_upload') && (
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500 text-sm">
                                  {question.type === 'video_upload' ? 'Click to upload video or record' : 'Click to upload file'}
                                </p>
                              </div>
                            )}
                            {(question.type === 'portfolio_link' || question.type === 'video_link' || question.type === 'url_submission') && (
                              <input 
                                type="url" 
                                placeholder="https://..." 
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2"
                                disabled 
                              />
                            )}
                            {question.type === 'code_submission' && (
                              <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                                <div className="text-gray-500">// Your code here...</div>
                                <div className="text-gray-600">function solution() {'{'}  </div>
                                <div className="text-gray-600 ml-4">// Implementation</div>
                                <div className="text-gray-600">{'}'}</div>
                              </div>
                            )}
                          </div>

                          {question.exampleResponse && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <h4 className="text-sm font-medium text-green-900 mb-1">Example Response:</h4>
                              <p className="text-sm text-green-800">{question.exampleResponse}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Submit Button Preview */}
          <div className="text-center pt-6 border-t border-gray-200">
            <Button size="lg" disabled className="px-8">
              Submit Assessment
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              This is a preview - candidates will see a functional form
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
