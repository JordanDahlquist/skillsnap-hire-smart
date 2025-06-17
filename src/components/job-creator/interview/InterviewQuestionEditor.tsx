
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, GripVertical, ArrowLeft, Eye, Sparkles } from "lucide-react";
import { InterviewQuestion, InterviewQuestionsData } from "@/types/interviewQuestions";

interface InterviewQuestionEditorProps {
  interviewQuestionsData: InterviewQuestionsData;
  onInterviewQuestionsDataChange: (data: InterviewQuestionsData) => void;
  onBack: () => void;
  onPreview: () => void;
  onRegenerate?: () => void;
  isGenerating?: boolean;
}

export const InterviewQuestionEditor = ({
  interviewQuestionsData,
  onInterviewQuestionsDataChange,
  onBack,
  onPreview,
  onRegenerate,
  isGenerating = false
}: InterviewQuestionEditorProps) => {
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);

  const addQuestion = () => {
    const newQuestion: InterviewQuestion = {
      id: crypto.randomUUID(),
      question: '',
      type: 'video_response',
      required: true,
      order: interviewQuestionsData.questions.length + 1,
      videoMaxLength: 1 // Default to 1 minute for new video questions
    };

    onInterviewQuestionsDataChange({
      ...interviewQuestionsData,
      questions: [...interviewQuestionsData.questions, newQuestion]
    });
    setEditingQuestion(newQuestion.id);
  };

  const updateQuestion = (questionId: string, updates: Partial<InterviewQuestion>) => {
    onInterviewQuestionsDataChange({
      ...interviewQuestionsData,
      questions: interviewQuestionsData.questions.map(q =>
        q.id === questionId ? { ...q, ...updates } : q
      )
    });
  };

  const removeQuestion = (questionId: string) => {
    onInterviewQuestionsDataChange({
      ...interviewQuestionsData,
      questions: interviewQuestionsData.questions.filter(q => q.id !== questionId)
    });
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'video_response': return 'bg-purple-100 text-purple-800';
      case 'text_response': return 'bg-blue-100 text-blue-800';
      case 'behavioral': return 'bg-green-100 text-green-800';
      case 'technical': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={onBack} className="h-8 px-3">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <CardTitle className="text-sm font-medium">Edit Interview Questions</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {onRegenerate && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRegenerate}
                  disabled={isGenerating}
                  className="h-8 px-3 text-xs"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  {isGenerating ? 'Regenerating...' : 'Regenerate'}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onPreview} className="h-8 px-3 text-xs">
                <Eye className="w-3 h-3 mr-1" />
                Preview
              </Button>
              <Button size="sm" onClick={addQuestion} className="h-8 px-3 text-xs">
                <Plus className="w-3 h-3 mr-1" />
                Add Question
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Interview Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="instructions">Instructions for Candidates</Label>
            <Textarea
              id="instructions"
              value={interviewQuestionsData.instructions || ''}
              onChange={(e) => onInterviewQuestionsDataChange({
                ...interviewQuestionsData,
                instructions: e.target.value
              })}
              placeholder="Provide any special instructions for candidates..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {interviewQuestionsData.questions.map((question, index) => (
          <Card key={question.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">Question {index + 1}</span>
                  <Badge className="bg-purple-100 text-purple-800">
                    Video Response
                  </Badge>
                  {question.required && (
                    <Badge variant="outline" className="text-red-600 border-red-200">
                      Required
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeQuestion(question.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingQuestion === question.id ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`question-${question.id}`}>Question</Label>
                    <Textarea
                      id={`question-${question.id}`}
                      value={question.question}
                      onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                      placeholder="Enter your interview question..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`videoLength-${question.id}`}>Video Length (minutes)</Label>
                    <Select
                      value={(question.videoMaxLength || 1).toString()}
                      onValueChange={(value) => updateQuestion(question.id, { videoMaxLength: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 minute</SelectItem>
                        <SelectItem value="3">3 minutes</SelectItem>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`instructions-${question.id}`}>Candidate Instructions</Label>
                    <Textarea
                      id={`instructions-${question.id}`}
                      value={question.candidateInstructions || ''}
                      onChange={(e) => updateQuestion(question.id, { candidateInstructions: e.target.value })}
                      placeholder="Any specific instructions for this question..."
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`criteria-${question.id}`}>Evaluation Criteria</Label>
                    <Textarea
                      id={`criteria-${question.id}`}
                      value={question.evaluationCriteria || ''}
                      onChange={(e) => updateQuestion(question.id, { evaluationCriteria: e.target.value })}
                      placeholder="What should you look for in the response..."
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`required-${question.id}`}
                      checked={question.required}
                      onCheckedChange={(checked) => updateQuestion(question.id, { required: checked })}
                    />
                    <Label htmlFor={`required-${question.id}`}>Required question</Label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingQuestion(null)} className="h-8 px-3 text-xs">
                      Cancel
                    </Button>
                    <Button size="sm" onClick={() => setEditingQuestion(null)} className="h-8 px-3 text-xs">
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-gray-900">{question.question || 'Click to edit question...'}</p>
                  {question.candidateInstructions && (
                    <p className="text-sm text-gray-600 italic">{question.candidateInstructions}</p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingQuestion(question.id)}
                    className="mt-2 h-8 px-3 text-xs"
                  >
                    Edit Question
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {interviewQuestionsData.questions.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-600 mb-4">No interview questions yet</p>
              <Button onClick={addQuestion}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Question
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
