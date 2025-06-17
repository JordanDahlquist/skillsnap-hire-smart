
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { parseMarkdown } from "@/utils/markdownParser";
import { Eye, X } from "lucide-react";
import { UnifiedJobFormData } from "@/types/jobForm";

interface JobPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobPost: string;
  formData: UnifiedJobFormData;
}

export const JobPreviewModal = ({
  open,
  onOpenChange,
  jobPost,
  formData
}: JobPreviewModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Eye className="w-5 h-5 text-blue-600" />
              Job Post Preview
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            This is how your job post will appear to candidates
          </p>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full w-full">
            <div className="p-6 bg-white border-2 border-gray-100 rounded-lg">
              {/* Job Header */}
              <div className="mb-8 pb-6 border-b border-gray-200">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {formData.title || "Job Title"}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    {formData.employmentType || "Full-time"}
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    {formData.locationType || "Remote"}
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                    {formData.experienceLevel || "Mid-level"}
                  </span>
                  {formData.location && (
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                      📍 {formData.location}
                    </span>
                  )}
                </div>
                {formData.companyName && (
                  <div className="mt-4">
                    <p className="text-lg text-gray-700">
                      <strong>Company:</strong> {formData.companyName}
                    </p>
                  </div>
                )}
              </div>

              {/* Job Description */}
              <div 
                className="prose prose-lg max-w-none"
                style={{
                  lineHeight: '1.8',
                  fontSize: '18px',
                  wordWrap: 'break-word'
                }}
                dangerouslySetInnerHTML={{ 
                  __html: parseMarkdown(jobPost) 
                }}
              />

              {/* Additional Information */}
              {(formData.salary || formData.budget || formData.benefits) && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">Compensation & Benefits</h2>
                  <div className="space-y-3">
                    {formData.salary && (
                      <p className="text-lg text-gray-700">
                        <strong>Salary:</strong> {formData.salary}
                      </p>
                    )}
                    {formData.budget && !formData.salary && (
                      <p className="text-lg text-gray-700">
                        <strong>Budget:</strong> {formData.budget}
                      </p>
                    )}
                    {formData.benefits && (
                      <div>
                        <strong className="text-lg text-gray-700">Benefits:</strong>
                        <div 
                          className="mt-2 text-gray-700"
                          dangerouslySetInnerHTML={{ 
                            __html: parseMarkdown(formData.benefits) 
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
