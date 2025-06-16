
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Shuffle } from "lucide-react";
import { SkillsQuestion, SkillsTestData } from "@/types/skillsAssessment";
import { QuestionCard } from "./QuestionCard";
import { parseMarkdown } from "@/utils/markdownParser";

interface RedesignedSkillsQuestionEditorProps {
  skillsTestData: SkillsTestData;
  onChange: (data: SkillsTestData) => void;
  onPreview: () => void;
}

export const RedesignedSkillsQuestionEditor = ({ 
  skillsTestData, 
  onChange, 
  onPreview 
}: RedesignedSkillsQuestionEditorProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addQuestion = () => {
    if (skillsTestData.questions.length >= 10) return;
    
    const newQuestion: SkillsQuestion = {
      id: crypto.randomUUID(),
      question: "",
      type: "text",
      required: true,
      order: skillsTestData.questions.length + 1
    };
    
    onChange({
      ...skillsTestData,
      questions: [...skillsTestData.questions, newQuestion]
    });
  };

  const updateQuestion = (id: string, updates: Partial<SkillsQuestion>) => {
    const updatedQuestions = skillsTestData.questions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    );
    
    onChange({
      ...skillsTestData,
      questions: updatedQuestions
    });
  };

  const removeQuestion = (id: string) => {
    const filteredQuestions = skillsTestData.questions
      .filter(q => q.id !== id)
      .map((q, index) => ({ ...q, order: index + 1 }));
    
    onChange({
      ...skillsTestData,
      questions: filteredQuestions
    });
  };

  const moveQuestion = (fromIndex: number, toIndex: number) => {
    const newQuestions = [...skillsTestData.questions];
    const [movedQuestion] = newQuestions.splice(fromIndex, 1);
    newQuestions.splice(toIndex, 0, movedQuestion);
    
    // Update order
    const updatedQuestions = newQuestions.map((q, index) => ({ ...q, order: index + 1 }));
    
    onChange({
      ...skillsTestData,
      questions: updatedQuestions
    });
  };

  const completedQuestions = skillsTestData.questions.filter(q => q.question.trim().length > 0);
  const estimatedTime = skillsTestData.estimatedCompletionTime || skillsTestData.questions.length * 5;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Skills Assessment Questions</h3>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-sm text-gray-600">
              {completedQuestions.length}/{skillsTestData.questions.length} questions completed
            </p>
            <Badge variant="outline" className="text-xs">
              ~{estimatedTime} min estimated
            </Badge>
            <Badge variant={skillsTestData.mode === 'ai_generated' ? 'default' : 'outline'} className="text-xs">
              {skillsTestData.mode === 'ai_generated' ? 'AI Generated' : 'Custom Builder'}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreview}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview Test
          </Button>
        </div>
      </div>

      {/* Overall Instructions */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="mb-3">
          <Label htmlFor="instructions" className="text-sm font-medium">
            Assessment Instructions
          </Label>
          <p className="text-xs text-gray-600 mt-1">
            Provide clear instructions for candidates. Use markdown for formatting.
          </p>
        </div>
        <Textarea
          id="instructions"
          value={skillsTestData.instructions || ""}
          onChange={(e) => onChange({ ...skillsTestData, instructions: e.target.value })}
          placeholder={`Welcome to the skills assessment! Please follow these guidelines:

**Before you begin:**
- Set aside approximately ${estimatedTime} minutes to complete this assessment
- Ensure you have a stable internet connection
- Prepare any materials you might need

**Instructions:**
- Read each question carefully before responding
- Provide detailed, thoughtful answers
- Take your time - quality is more important than speed

Good luck!`}
          className="resize-none font-mono text-sm"
          rows={8}
        />
        <div className="mt-2 text-xs text-gray-500">
          <span className="font-medium">Formatting:</span> Use **bold**, bullet points with -, numbered lists with 1., and ## for headings
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {skillsTestData.questions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
            <p className="text-gray-600 mb-4">Add your first question to get started</p>
            <Button onClick={addQuestion} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add First Question
            </Button>
          </div>
        ) : (
          skillsTestData.questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              onUpdate={(updates) => updateQuestion(question.id, updates)}
              onDelete={() => removeQuestion(question.id)}
              onPreview={onPreview}
            />
          ))
        )}
      </div>

      {/* Add Question Button */}
      {skillsTestData.questions.length > 0 && skillsTestData.questions.length < 10 && (
        <Button
          variant="outline"
          onClick={addQuestion}
          className="w-full border-dashed border-2 border-gray-300 py-6 hover:border-blue-400 hover:text-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Question ({skillsTestData.questions.length}/10)
        </Button>
      )}

      {skillsTestData.questions.length >= 10 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600">
            Maximum of 10 questions reached. Consider keeping assessments focused for better completion rates.
          </p>
        </div>
      )}
    </div>
  );
};
