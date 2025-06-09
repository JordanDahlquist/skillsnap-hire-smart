
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Edit3, FileText } from "lucide-react";
import { parseMarkdown } from "@/utils/markdownParser";
import { JobFormData, JobCreatorActions } from "./types";

interface Step4ReviewPublishProps {
  formData: JobFormData;
  pdfFileName: string | null;
  useOriginalPdf: boolean | null;
  generatedJobPost: string;
  generatedSkillsTest: string;
  actions: JobCreatorActions;
}

export const Step4ReviewPublish = ({
  formData,
  generatedJobPost,
  generatedSkillsTest,
  actions
}: Step4ReviewPublishProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
          <Eye className="w-5 h-5 text-green-600" />
          Review & Publish
        </h2>
        <p className="text-sm text-gray-600">Review your job details and generated content before publishing</p>
      </div>

      <div className="flex-shrink-0 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="font-medium text-gray-700">Title:</span>
              <p className="text-gray-900 truncate">{formData.title}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Type:</span>
              <p className="text-gray-900">{formData.employmentType}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Level:</span>
              <p className="text-gray-900">{formData.experienceLevel}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto pr-2">
        {generatedJobPost && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Job Post Preview
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => actions.setIsEditingJobPost(true)}
                  className="text-xs h-8 px-3"
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className="prose max-w-none text-sm leading-relaxed bg-gray-50 rounded-lg p-4 border"
                style={{
                  lineHeight: '1.7',
                  fontSize: '14px',
                  wordWrap: 'break-word'
                }}
                dangerouslySetInnerHTML={{ 
                  __html: parseMarkdown(generatedJobPost) 
                }}
              />
            </CardContent>
          </Card>
        )}

        {generatedSkillsTest && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Skills Test Preview
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => actions.setIsEditingSkillsTest(true)}
                  className="text-xs h-8 px-3"
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className="prose max-w-none text-sm leading-relaxed bg-gray-50 rounded-lg p-4 border"
                style={{
                  lineHeight: '1.7',
                  fontSize: '14px',
                  wordWrap: 'break-word'
                }}
                dangerouslySetInnerHTML={{ 
                  __html: parseMarkdown(generatedSkillsTest) 
                }}
              />
            </CardContent>
          </Card>
        )}

        {!generatedJobPost && !generatedSkillsTest && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Generated Yet</h3>
              <p className="text-sm">Please go back to previous steps to generate your job post and skills test.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
