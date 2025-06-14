
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit, Eye, FileText, HelpCircle, Video, Clock } from "lucide-react";
import { parseMarkdown } from "@/utils/markdownParser";
import { renderSkillsTestAsMarkdown } from "@/utils/skillsTestRenderer";
import { JobFormData, JobCreatorActions } from "./types";
import { SkillsTestData } from "@/types/skillsAssessment";

interface Step5ReviewPublishProps {
  formData: JobFormData;
  pdfFileName: string | null;
  useOriginalPdf: boolean | null;
  generatedJobPost: string;
  generatedSkillsTest: string;
  generatedInterviewQuestions: string;
  interviewVideoMaxLength: number;
  actions: JobCreatorActions;
}

export const Step5ReviewPublish = ({
  formData,
  pdfFileName,
  useOriginalPdf,
  generatedJobPost,
  generatedSkillsTest,
  generatedInterviewQuestions,
  interviewVideoMaxLength,
  actions
}: Step5ReviewPublishProps) => {
  // Parse skills test data if it's a JSON string
  let skillsTestData: SkillsTestData | null = null;
  if (generatedSkillsTest) {
    try {
      skillsTestData = JSON.parse(generatedSkillsTest);
    } catch (error) {
      console.error('Error parsing skills test data:', error);
    }
  }

  const skillsTestMarkdown = skillsTestData ? renderSkillsTestAsMarkdown(skillsTestData) : "";

  const handleEditSkillsTest = () => {
    actions.setSkillsTestViewState('editor');
    actions.setCurrentStep(3);
  };

  // Format work arrangement for display
  const workArrangementDisplay = formData.locationType === 'on-site' ? 'On-site' : 
                               formData.locationType === 'remote' ? 'Remote' : 
                               formData.locationType === 'hybrid' ? 'Hybrid' : formData.locationType;

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Publish Your Job</h2>
          <p className="text-gray-600">Review all sections before publishing your job posting</p>
        </div>

        <div className="grid gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Basic Information
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => actions.setCurrentStep(1)}
                  className="flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Company:</strong> {formData.companyName}
                </div>
                <div>
                  <strong>Title:</strong> {formData.title}
                </div>
                <div>
                  <strong>Employment Type:</strong> {formData.employmentType}
                </div>
                <div>
                  <strong>Experience Level:</strong> {formData.experienceLevel}
                </div>
                <div>
                  <strong>Work Arrangement:</strong> {workArrangementDisplay}
                </div>
                <div>
                  <strong>Location:</strong> {formData.location || 'Not specified'}
                </div>
                {formData.budget && (
                  <div>
                    <strong>Budget:</strong> {formData.budget}
                  </div>
                )}
                {formData.duration && (
                  <div>
                    <strong>Duration:</strong> {formData.duration}
                  </div>
                )}
              </div>
              {formData.description && (
                <div className="mt-4">
                  <strong>Description:</strong>
                  <p className="mt-1 text-gray-700">{formData.description}</p>
                </div>
              )}
              {formData.skills && (
                <div className="mt-4">
                  <strong>Required Skills:</strong>
                  <p className="mt-1 text-gray-700">{formData.skills}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Post */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Eye className="w-5 h-5 text-green-600" />
                  Generated Job Post
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => actions.setIsEditingJobPost(true)}
                  className="flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div 
                className="prose max-w-none text-sm"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(generatedJobPost) }}
              />
            </CardContent>
          </Card>

          {/* Skills Test */}
          {skillsTestMarkdown && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <HelpCircle className="w-5 h-5 text-orange-600" />
                      Skills Assessment
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleEditSkillsTest}
                    className="flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div 
                  className="prose max-w-none text-sm"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(skillsTestMarkdown) }}
                />
              </CardContent>
            </Card>
          )}

          {/* Interview Questions */}
          {generatedInterviewQuestions && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Video className="w-5 h-5 text-purple-600" />
                      Interview Questions
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      Max {interviewVideoMaxLength} min per question
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => actions.setIsEditingInterviewQuestions(true)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-purple-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-purple-700">
                    <strong>Note:</strong> Candidates will record a separate video response for each question below. 
                    Each individual video response is limited to {interviewVideoMaxLength} minutes.
                  </p>
                </div>
                <div 
                  className="prose max-w-none text-sm"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(generatedInterviewQuestions) }}
                />
              </CardContent>
            </Card>
          )}

          {/* PDF Upload Summary */}
          {pdfFileName && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-gray-600" />
                  PDF Document
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm">
                  <strong>File:</strong> {pdfFileName}
                </p>
                <p className="text-sm mt-1">
                  <strong>Usage:</strong> {useOriginalPdf ? 'Used as job post content' : 'Used to enhance AI generation'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator className="my-6" />

        <div className="text-center text-sm text-gray-600 pb-6">
          <p>Once published, your job will be live and candidates can start applying.</p>
          <p>You can always edit the job details later from your dashboard.</p>
        </div>
      </div>
    </div>
  );
};
