
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, GripVertical, ExternalLink, Link, Type, Upload } from "lucide-react";
import { SkillsQuestion, SkillsTestData } from "@/types/skillsAssessment";

interface SkillsQuestionEditorProps {
  skillsTestData: SkillsTestData;
  onChange: (data: SkillsTestData) => void;
}

const getQuestionTypeIcon = (type: string) => {
  switch (type) {
    case 'text':
      return Type;
    case 'url_submission':
      return Link;
    case 'portfolio_link':
      return ExternalLink;
    case 'file_upload':
      return Upload;
    default:
      return Type;
  }
};

const getQuestionTypeLabel = (type: string) => {
  switch (type) {
    case 'text':
      return 'Text Response';
    case 'url_submission':
      return 'URL Submission';
    case 'portfolio_link':
      return 'Portfolio Link';
    case 'file_upload':
      return 'File Upload';
    default:
      return 'Text Response';
  }
};

export const SkillsQuestionEditor = ({ skillsTestData, onChange }: SkillsQuestionEditorProps) => {
  const addQuestion = () => {
    if (skillsTestData.questions.length >= 10) return;
    
    const newQuestion: SkillsQuestion = {
      id: crypto.randomUUID(),
      question: "",
      type: "text", // Default to text, most common type
      required: true,
      order: skillsTestData.questions.length + 1
    };
    
    console.log('Adding new question with type:', newQuestion.type);
    
    onChange({
      ...skillsTestData,
      questions: [...skillsTestData.questions, newQuestion]
    });
  };

  const updateQuestion = (id: string, updates: Partial<SkillsQuestion>) => {
    console.log('Updating question', id, 'with updates:', updates);
    
    const updatedQuestions = skillsTestData.questions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    );
    
    // Log the updated question for debugging
    const updatedQuestion = updatedQuestions.find(q => q.id === id);
    console.log('Updated question:', updatedQuestion);
    
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Skills Assessment Questions</h3>
        <span className="text-sm text-gray-600">
          {skillsTestData.questions.length}/10 questions
        </span>
      </div>

      {skillsTestData.questions.map((question, index) => {
        const TypeIcon = getQuestionTypeIcon(question.type);
        
        return (
          <Card key={question.id} className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <TypeIcon className="w-4 h-4 text-blue-600" />
                  <span>Question {index + 1}</span>
                  <span className="text-sm text-gray-500">({getQuestionTypeLabel(question.type)})</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeQuestion(question.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor={`question-${question.id}`}>Question</Label>
                <Textarea
                  id={`question-${question.id}`}
                  value={question.question}
                  onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                  placeholder="Enter your question here..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor={`instructions-${question.id}`}>Instructions (Optional)</Label>
                <Input
                  id={`instructions-${question.id}`}
                  value={question.candidateInstructions || ""}
                  onChange={(e) => updateQuestion(question.id, { candidateInstructions: e.target.value })}
                  placeholder="Additional context or instructions..."
                  className="mt-1"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor={`type-${question.id}`}>Response Type</Label>
                  <Select
                    value={question.type}
                    onValueChange={(value: 'text' | 'url_submission' | 'portfolio_link' | 'file_upload') => {
                      console.log('Changing question type from', question.type, 'to', value);
                      updateQuestion(question.id, { type: value });
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">
                        <div className="flex items-center gap-2">
                          <Type className="w-4 h-4" />
                          Text Response
                        </div>
                      </SelectItem>
                      <SelectItem value="url_submission">
                        <div className="flex items-center gap-2">
                          <Link className="w-4 h-4" />
                          URL Submission
                        </div>
                      </SelectItem>
                      <SelectItem value="portfolio_link">
                        <div className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Portfolio Link
                        </div>
                      </SelectItem>
                      <SelectItem value="file_upload">
                        <div className="flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          File Upload
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

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
