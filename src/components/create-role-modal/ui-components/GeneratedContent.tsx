
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/RichTextEditor";
import { parseMarkdown } from "@/utils/markdownParser";
import { Sparkles, Loader2, CheckCircle } from "lucide-react";

interface GeneratedContentProps {
  content: string;
  isEditing: boolean;
  isGenerating: boolean;
  isSkipped: boolean;
  onEdit: () => void;
  onRegenerate: () => void;
  onUndoSkip: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChange: (value: string) => void;
  placeholder: string;
  gradientFrom: string;
  gradientTo: string;
}

export const GeneratedContent = ({
  content,
  isEditing,
  isGenerating,
  isSkipped,
  onEdit,
  onRegenerate,
  onUndoSkip,
  onSave,
  onCancel,
  onChange,
  placeholder,
  gradientFrom,
  gradientTo
}: GeneratedContentProps) => {
  if (isSkipped) {
    return (
      <div className="text-center py-12 text-gray-500">
        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
        <p className="text-lg mb-2">Content Skipped</p>
        <p className="text-sm">You can publish without AI-generated content.</p>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse flex flex-col items-center">
          <Sparkles className={`w-12 h-12 text-${gradientFrom}-600 animate-spin mb-4`} />
          <p className="text-lg font-medium">AI is crafting your content...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return null;
  }

  if (isEditing) {
    return (
      <RichTextEditor
        value={content}
        onChange={onChange}
        onSave={onSave}
        onCancel={onCancel}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-end">
        <Button type="button" onClick={onEdit} variant="outline" size="sm">
          Edit Content
        </Button>
        <Button type="button" onClick={onRegenerate} variant="outline" size="sm">
          <Sparkles className="w-4 h-4 mr-2" />
          Regenerate
        </Button>
        {isSkipped && (
          <Button type="button" onClick={onUndoSkip} variant="outline" size="sm">
            Undo Skip
          </Button>
        )}
      </div>
      <div 
        className={`min-h-[300px] p-4 border rounded-lg bg-gradient-to-br from-${gradientFrom}-50 to-${gradientTo}-50 prose max-w-none`}
        dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
      />
    </div>
  );
};
