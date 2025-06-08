
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormDescription } from "@/components/ui/form";
import { User, DollarSign, FileEdit } from "lucide-react";
import { BasicInfoFields } from "../form-fields/BasicInfoFields";
import { ProjectDetailsFields } from "../form-fields/ProjectDetailsFields";
import { JobDescriptionField } from "../form-fields/JobDescriptionField";

interface RoleDetailsTabProps {
  form: any;
  uploadedPdfContent: string | null;
  uploadedFileName: string | null;
  rewriteWithAI: boolean;
  onPdfUpload: (content: string, fileName: string) => void;
  onPdfRemove: () => void;
  onRewriteToggle: (checked: boolean) => void;
}

export const RoleDetailsTab = ({
  form,
  uploadedPdfContent,
  uploadedFileName,
  rewriteWithAI,
  onPdfUpload,
  onPdfRemove,
  onRewriteToggle
}: RoleDetailsTabProps) => {
  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 rounded-xl -z-10" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                <User className="w-5 h-5 text-blue-600" />
                Basic Information
              </CardTitle>
              <div className="h-0.5 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
            </CardHeader>
            <CardContent className="space-y-6">
              <BasicInfoFields form={form} />
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                <DollarSign className="w-5 h-5 text-green-600" />
                Project Details
              </CardTitle>
              <div className="h-0.5 w-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full" />
            </CardHeader>
            <CardContent className="space-y-6">
              <ProjectDetailsFields form={form} />
            </CardContent>
          </Card>
        </div>

        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              <FileEdit className="w-5 h-5 text-purple-600" />
              Job Requirements & Description (AI Input)
              <span className="text-red-500 ml-1 text-base">*</span>
            </CardTitle>
            <div className="h-0.5 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
            <FormDescription className="mt-2 text-sm text-gray-600 leading-relaxed">
              Provide general requirements and description. The AI will transform this into a polished, professional job posting.
            </FormDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <JobDescriptionField
              form={form}
              uploadedPdfContent={uploadedPdfContent}
              uploadedFileName={uploadedFileName}
              rewriteWithAI={rewriteWithAI}
              onPdfUpload={onPdfUpload}
              onPdfRemove={onPdfRemove}
              onRewriteToggle={onRewriteToggle}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
