
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { SkillsTestData } from "@/types/skillsAssessment";
import { parseMarkdown } from "@/utils/markdownParser";

interface SimplifiedSkillsStepEditorProps {
  skillsTestData: SkillsTestData;
  onChange: (data: SkillsTestData) => void;
  onPreview: () => void;
  jobTitle?: string;
}

export const SimplifiedSkillsStepEditor = ({ 
  skillsTestData, 
  onChange, 
  onPreview,
  jobTitle = "Skills"
}: SimplifiedSkillsStepEditorProps) => {
  const [isEditingInstructions, setIsEditingInstructions] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {jobTitle} Assessment Challenge
          </h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onPreview}
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Preview Assessment
        </Button>
      </div>

      {/* Single Instructions Section */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Instructions</CardTitle>
            {!isEditingInstructions && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsEditingInstructions(true)}
                className="text-xs h-8 px-3 text-gray-600 hover:text-gray-900"
              >
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isEditingInstructions ? (
            <RichTextEditor
              value={skillsTestData.instructions || ""}
              onChange={(value) => onChange({ ...skillsTestData, instructions: value })}
              onSave={() => setIsEditingInstructions(false)}
              onCancel={() => setIsEditingInstructions(false)}
              placeholder="Provide clear instructions for the skills assessment challenge..."
            />
          ) : (
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors min-h-[120px]"
              onClick={() => setIsEditingInstructions(true)}
            >
              {skillsTestData.instructions ? (
                <div 
                  className="prose prose-sm max-w-none 
                    prose-headings:text-gray-900 prose-headings:font-semibold prose-headings:mb-2 prose-headings:mt-3
                    prose-p:mb-3 prose-p:leading-relaxed prose-p:text-gray-700
                    prose-ul:mb-4 prose-ul:space-y-2 prose-li:mb-2 prose-li:text-gray-700 prose-li:leading-relaxed
                    prose-ol:mb-4 prose-ol:space-y-2 prose-li:mb-2 prose-li:text-gray-700 prose-li:leading-relaxed
                    prose-strong:text-gray-900 prose-strong:font-semibold
                    prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(skillsTestData.instructions) }} 
                />
              ) : (
                <p className="text-gray-500 italic">Click to add assessment instructions...</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
