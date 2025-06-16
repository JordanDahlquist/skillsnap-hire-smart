
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, GripVertical, ChevronDown, ChevronRight, Eye, Settings } from "lucide-react";
import { SkillsQuestion, SkillsTestData } from "@/types/skillsAssessment";

interface EnhancedSkillsQuestionEditorProps {
  skillsTestData: SkillsTestData;
  onChange: (data: SkillsTestData) => void;
  onPreview: () => void;
}

export const EnhancedSkillsQuestionEditor = ({ 
  skillsTestData, 
  onChange, 
  onPreview 
}: EnhancedSkillsQuestionEditorProps) => {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

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

    // Auto-expand the new question
    setExpandedQuestions(prev => new Set([...prev, newQuestion.id]));
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

    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const toggleExpanded = (questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const getQuestionTypeLabel = (type: string) => {
    const labels = {
      text: "Short Text",
      long_text: "Long Text",
      multiple_choice: "Multiple Choice",
      file_upload: "File Upload",
      video_upload: "Video Upload",
      video_link: "Video Link",
      portfolio_link: "Portfolio Link",
      code_submission: "Code Submission",
      pdf_upload: "PDF Upload",
      url_submission: "URL Submission"
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Skills Assessment Questions</h3>
          <p className="text-sm text-gray-600">
            {skillsTestData.questions.length}/10 questions • Mode: {skillsTestData.mode === 'ai_generated' ? 'AI Generated' : 'Custom Builder'}
          </p>
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
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Assessment Instructions</CardTitle>
          <p className="text-sm text-gray-600">
            Provide clear, well-formatted instructions for candidates. Use markdown for better formatting.
          </p>
        </CardHeader>
        <CardContent>
          <Textarea
            value={skillsTestData.instructions || ""}
            onChange={(e) => onChange({ ...skillsTestData, instructions: e.target.value })}
            placeholder={`Welcome to the skills assessment! Please follow these guidelines:

**Before you begin:**
- Set aside approximately ${skillsTestData.estimatedCompletionTime || skillsTestData.questions.length * 5} minutes to complete this assessment
- Ensure you have a stable internet connection
- Prepare any materials you might need

**Instructions:**
- Read each question carefully before responding
- Provide detailed, thoughtful answers
- Take your time - quality is more important than speed

**Technical Requirements:**
- Some questions may require file uploads or video recordings
- Make sure your browser allows camera/microphone access if needed

Good luck!`}
            rows={8}
            className="font-mono text-sm"
          />
          <div className="mt-2 text-xs text-gray-500">
            <span className="font-medium">Formatting tips:</span> Use **bold** for emphasis, bullet points with -, numbered lists with 1., and ## for headings
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      {skillsTestData.questions.map((question, index) => {
        const isExpanded = expandedQuestions.has(question.id);
        
        return (
          <Card key={question.id} className="border border-gray-200">
            <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(question.id)}>
              <CardHeader className="pb-3">
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="font-medium">
                          Question {index + 1}: {question.question || 'Untitled Question'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {getQuestionTypeLabel(question.type)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeQuestion(question.id);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CollapsibleTrigger>
              </CardHeader>

              <CollapsibleContent>
                <CardContent className="space-y-4 pt-0">
                  {/* Basic Question Fields */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`question-${question.id}`}>Question *</Label>
                      <Textarea
                        id={`question-${question.id}`}
                        value={question.question}
                        onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                        placeholder="Enter your question here..."
                        rows={2}
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`type-${question.id}`}>Response Type</Label>
                        <Select
                          value={question.type}
                          onValueChange={(value: any) => updateQuestion(question.id, { type: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Short Text</SelectItem>
                            <SelectItem value="long_text">Long Text</SelectItem>
                            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                            <SelectItem value="file_upload">File Upload</SelectItem>
                            <SelectItem value="video_upload">Video Upload</SelectItem>
                            <SelectItem value="video_link">Video Link</SelectItem>
                            <SelectItem value="portfolio_link">Portfolio Link</SelectItem>
                            <SelectItem value="code_submission">Code Submission</SelectItem>
                            <SelectItem value="pdf_upload">PDF Upload</SelectItem>
                            <SelectItem value="url_submission">URL Submission</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2 mt-6">
                        <Switch
                          id={`required-${question.id}`}
                          checked={question.required}
                          onCheckedChange={(checked) => updateQuestion(question.id, { required: checked })}
                        />
                        <Label htmlFor={`required-${question.id}`}>Required</Label>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`instructions-${question.id}`}>Instructions for Candidates</Label>
                      <p className="text-xs text-gray-600 mb-2">
                        Use markdown formatting for better presentation. This will be displayed to candidates.
                      </p>
                      <Textarea
                        id={`instructions-${question.id}`}
                        value={question.candidateInstructions || ""}
                        onChange={(e) => updateQuestion(question.id, { candidateInstructions: e.target.value })}
                        placeholder={`Please provide detailed instructions here. For example:

**What we're looking for:**
- Clear communication skills
- Technical knowledge demonstration
- Problem-solving approach

**Requirements:**
- Include specific examples
- Explain your reasoning
- Keep your response between 200-500 words

**Tips:**
- Take your time to think through your answer
- Use bullet points for clarity where appropriate`}
                        rows={6}
                        className="mt-1 font-mono text-sm"
                      />
                      <div className="mt-1 text-xs text-gray-500">
                        Use **bold**, bullet points with -, numbered lists with 1., and ## for headings
                      </div>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-0 h-auto text-gray-600 hover:text-gray-800">
                        <Settings className="w-4 h-4 mr-2" />
                        Advanced Options
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 mt-4 pt-4 border-t border-gray-100">
                      <div>
                        <Label htmlFor={`evaluation-${question.id}`}>Evaluation Guidelines (Hidden from candidates)</Label>
                        <Textarea
                          id={`evaluation-${question.id}`}
                          value={question.evaluationGuidelines || ""}
                          onChange={(e) => updateQuestion(question.id, { evaluationGuidelines: e.target.value })}
                          placeholder="What should reviewers look for in the response?"
                          rows={3}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`scoring-${question.id}`}>Scoring Criteria</Label>
                        <Textarea
                          id={`scoring-${question.id}`}
                          value={question.scoringCriteria || ""}
                          onChange={(e) => updateQuestion(question.id, { scoringCriteria: e.target.value })}
                          placeholder="What constitutes a good response?"
                          rows={2}
                          className="mt-1"
                        />
                      </div>

                      {/* Type-specific options */}
                      {(question.type === 'text' || question.type === 'long_text') && (
                        <div>
                          <Label htmlFor={`char-limit-${question.id}`}>Character Limit</Label>
                          <Input
                            id={`char-limit-${question.id}`}
                            type="number"
                            value={question.characterLimit || ""}
                            onChange={(e) => updateQuestion(question.id, { characterLimit: parseInt(e.target.value) || undefined })}
                            placeholder="Optional character limit"
                            className="mt-1"
                          />
                        </div>
                      )}

                      {question.type === 'video_upload' && (
                        <div>
                          <Label htmlFor={`time-limit-${question.id}`}>Time Limit (minutes)</Label>
                          <Input
                            id={`time-limit-${question.id}`}
                            type="number"
                            value={question.timeLimit || ""}
                            onChange={(e) => updateQuestion(question.id, { timeLimit: parseInt(e.target.value) || undefined })}
                            placeholder="e.g. 5"
                            className="mt-1"
                          />
                        </div>
                      )}

                      <div>
                        <Label htmlFor={`example-${question.id}`}>Example Response</Label>
                        <Textarea
                          id={`example-${question.id}`}
                          value={question.exampleResponse || ""}
                          onChange={(e) => updateQuestion(question.id, { exampleResponse: e.target.value })}
                          placeholder="Optional example of a good response (supports markdown formatting)"
                          rows={2}
                          className="mt-1"
                        />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}

      {/* Add Question Button */}
      {skillsTestData.questions.length < 10 && (
        <Button
          variant="outline"
          onClick={addQuestion}
          className="w-full border-dashed border-2 border-gray-300 py-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Question ({skillsTestData.questions.length}/10)
        </Button>
      )}
    </div>
  );
};
