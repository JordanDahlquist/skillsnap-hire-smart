
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, FileText, Video, Upload, Link, Code } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { SkillsTestData, SkillsQuestion } from "@/types/skillsAssessment";

interface SimplifiedSkillsStepEditorProps {
  skillsTestData: SkillsTestData;
  onChange: (data: SkillsTestData) => void;
  onPreview: () => void;
}

const getStepTypeIcon = (type: string) => {
  switch (type) {
    case 'video_upload':
    case 'video_link':
      return Video;
    case 'file_upload':
    case 'pdf_upload':
      return Upload;
    case 'portfolio_link':
    case 'url_submission':
      return Link;
    case 'code_submission':
      return Code;
    default:
      return FileText;
  }
};

const getStepTypeLabel = (type: string) => {
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
  return labels[type as keyof typeof labels] || "Text Response";
};

export const SimplifiedSkillsStepEditor = ({ 
  skillsTestData, 
  onChange, 
  onPreview 
}: SimplifiedSkillsStepEditorProps) => {
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [editingOverallInstructions, setEditingOverallInstructions] = useState(false);

  const addStep = () => {
    if (skillsTestData.questions.length >= 10) return;
    
    const newStep: SkillsQuestion = {
      id: crypto.randomUUID(),
      question: `Assessment Step ${skillsTestData.questions.length + 1}`,
      type: "text",
      required: true,
      order: skillsTestData.questions.length + 1,
      candidateInstructions: "",
      evaluationGuidelines: ""
    };
    
    onChange({
      ...skillsTestData,
      questions: [...skillsTestData.questions, newStep]
    });
  };

  const updateStep = (id: string, updates: Partial<SkillsQuestion>) => {
    const updatedQuestions = skillsTestData.questions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    );
    
    onChange({
      ...skillsTestData,
      questions: updatedQuestions
    });
  };

  const removeStep = (id: string) => {
    const filteredQuestions = skillsTestData.questions
      .filter(q => q.id !== id)
      .map((q, index) => ({ ...q, order: index + 1 }));
    
    onChange({
      ...skillsTestData,
      questions: filteredQuestions
    });
  };

  const completedSteps = skillsTestData.questions.filter(q => 
    q.candidateInstructions && q.candidateInstructions.trim().length > 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Skills Assessment</h3>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-sm text-gray-600">
              {completedSteps.length}/{skillsTestData.questions.length} steps completed
            </p>
            <Badge variant="outline" className="text-xs">
              ~{skillsTestData.questions.length * 5} min estimated
            </Badge>
          </div>
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

      {/* Overall Instructions */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Assessment Instructions</CardTitle>
            {!editingOverallInstructions && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setEditingOverallInstructions(true)}
                className="text-xs h-8 px-3 text-gray-600 hover:text-gray-900"
              >
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {editingOverallInstructions ? (
            <RichTextEditor
              value={skillsTestData.instructions || ""}
              onChange={(value) => onChange({ ...skillsTestData, instructions: value })}
              onSave={() => setEditingOverallInstructions(false)}
              onCancel={() => setEditingOverallInstructions(false)}
              placeholder="Provide overall instructions for the skills assessment..."
            />
          ) : (
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors min-h-[100px]"
              onClick={() => setEditingOverallInstructions(true)}
              style={{
                lineHeight: '1.6',
                fontSize: '14px',
                wordWrap: 'break-word'
              }}
            >
              {skillsTestData.instructions ? (
                <div dangerouslySetInnerHTML={{ __html: skillsTestData.instructions }} />
              ) : (
                <p className="text-gray-500 italic">Click to add assessment instructions...</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assessment Steps */}
      <div className="space-y-4">
        {skillsTestData.questions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assessment steps yet</h3>
            <p className="text-gray-600 mb-4">Add your first assessment step to get started</p>
            <Button onClick={addStep} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add First Step
            </Button>
          </div>
        ) : (
          skillsTestData.questions.map((step, index) => {
            const IconComponent = getStepTypeIcon(step.type);
            const isEditing = editingStep === step.id;
            
            return (
              <Card key={step.id} className="border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Input
                            value={step.question}
                            onChange={(e) => updateStep(step.id, { question: e.target.value })}
                            className="text-base font-medium border-none p-0 h-auto bg-transparent focus-visible:ring-0"
                            placeholder="Step title..."
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <IconComponent className="w-4 h-4 text-gray-500" />
                          <Select
                            value={step.type}
                            onValueChange={(value: any) => updateStep(step.id, { type: value })}
                          >
                            <SelectTrigger className="w-auto h-6 border-none p-0 bg-transparent text-xs text-gray-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text Response</SelectItem>
                              <SelectItem value="long_text">Long Text Response</SelectItem>
                              <SelectItem value="file_upload">File Upload</SelectItem>
                              <SelectItem value="video_upload">Video Upload</SelectItem>
                              <SelectItem value="code_submission">Code Submission</SelectItem>
                              <SelectItem value="url_submission">URL Submission</SelectItem>
                            </SelectContent>
                          </Select>
                          <Badge variant={step.required ? "default" : "outline"} className="text-xs">
                            {step.required ? "Required" : "Optional"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isEditing && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingStep(step.id)}
                          className="text-xs h-8 px-3 text-gray-600 hover:text-gray-900"
                        >
                          Edit
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStep(step.id)}
                        className="text-red-600 hover:text-red-700 h-8 px-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isEditing ? (
                    <div className="space-y-4 p-4 border-t border-gray-100">
                      <div>
                        <Label className="text-sm font-medium">Instructions for Candidates</Label>
                        <RichTextEditor
                          value={step.candidateInstructions || ""}
                          onChange={(value) => updateStep(step.id, { candidateInstructions: value })}
                          onSave={() => setEditingStep(null)}
                          onCancel={() => setEditingStep(null)}
                          placeholder="Provide clear instructions for this step..."
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">What You're Looking For</Label>
                        <RichTextEditor
                          value={step.evaluationGuidelines || ""}
                          onChange={(value) => updateStep(step.id, { evaluationGuidelines: value })}
                          onSave={() => setEditingStep(null)}
                          onCancel={() => setEditingStep(null)}
                          placeholder="Describe what you're evaluating in this step..."
                        />
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors border-t border-gray-100"
                      onClick={() => setEditingStep(step.id)}
                    >
                      {step.candidateInstructions ? (
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-1">Instructions</p>
                            <div 
                              className="text-sm text-gray-800"
                              dangerouslySetInnerHTML={{ __html: step.candidateInstructions }} 
                            />
                          </div>
                          {step.evaluationGuidelines && (
                            <div>
                              <p className="text-xs font-medium text-gray-600 mb-1">What You're Looking For</p>
                              <div 
                                className="text-sm text-gray-600"
                                dangerouslySetInnerHTML={{ __html: step.evaluationGuidelines }} 
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic text-sm">Click to add instructions for this step...</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Add Step Button */}
      {skillsTestData.questions.length > 0 && skillsTestData.questions.length < 10 && (
        <Button
          variant="outline"
          onClick={addStep}
          className="w-full border-dashed border-2 border-gray-300 py-6 hover:border-blue-400 hover:text-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Assessment Step ({skillsTestData.questions.length}/10)
        </Button>
      )}

      {skillsTestData.questions.length >= 10 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600">
            Maximum of 10 steps reached. Consider keeping assessments focused for better completion rates.
          </p>
        </div>
      )}
    </div>
  );
};
