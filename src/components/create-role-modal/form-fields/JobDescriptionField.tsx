
import { FormControl, FormDescription, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PdfUpload } from "@/components/PdfUpload";
import { Upload, Sparkles } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "../utils/types";

interface JobDescriptionFieldProps {
  form: UseFormReturn<FormData>;
  uploadedPdfContent: string | null;
  uploadedFileName: string | null;
  rewriteWithAI: boolean;
  onPdfUpload: (content: string, fileName: string) => void;
  onPdfRemove: () => void;
  onRewriteToggle: (checked: boolean) => void;
}

export const JobDescriptionField = ({
  form,
  uploadedPdfContent,
  uploadedFileName,
  rewriteWithAI,
  onPdfUpload,
  onPdfRemove,
  onRewriteToggle
}: JobDescriptionFieldProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="group">
            <FormControl>
              <div className="relative">
                <Textarea 
                  placeholder="Describe the role, key responsibilities, must-have qualifications, and any specific requirements. Be as detailed as you like - the AI will structure this beautifully!" 
                  className="resize-none border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 bg-white/70 backdrop-blur-sm hover:bg-white/90 min-h-[120px]" 
                  rows={6} 
                  {...field} 
                />
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300" />
                
                <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white/80 backdrop-blur-sm px-2 py-1 rounded">
                  {field.value?.length || 0} characters
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
        <div className="flex items-start gap-3">
          <Upload className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-2">Or Upload Existing Job Description</h4>
            <PdfUpload 
              onFileUpload={onPdfUpload}
              onRemove={onPdfRemove}
              uploadedFile={uploadedFileName}
            />
          </div>
        </div>
      </div>
      
      {uploadedPdfContent && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="flex-1">
              <Switch
                id="rewrite-toggle"
                checked={rewriteWithAI}
                onCheckedChange={onRewriteToggle}
                className="data-[state=checked]:bg-emerald-600"
              />
              <label htmlFor="rewrite-toggle" className="text-sm font-medium text-emerald-900 ml-3">
                Let AI enhance and rewrite the uploaded content
              </label>
              <p className="text-xs text-emerald-700 mt-1 ml-8">
                AI will improve structure, clarity, and appeal while preserving key information
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
