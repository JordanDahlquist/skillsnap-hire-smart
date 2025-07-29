import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, FileText } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { SkillsTestData, SkillsQuestion } from "@/types/skillsAssessment";
import { parseMarkdown } from "@/utils/markdownParser";

interface CleanSkillsEditorProps {
  skillsTestData: SkillsTestData;
  onChange: (data: SkillsTestData) => void;
  onPreview: () => void;
  jobTitle?: string;
}

export const CleanSkillsEditor = ({ 
  skillsTestData, 
  onChange, 
  onPreview,
  jobTitle = "Position"
}: CleanSkillsEditorProps) => {
  const [editingChallenge, setEditingChallenge] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);

  const addChallenge = () => {
    if (skillsTestData.questions.length >= 10) return;
    
    const newChallenge: SkillsQuestion = {
      id: crypto.randomUUID(),
      question: `Challenge ${skillsTestData.questions.length + 1}`,
      type: "text",
      required: true,
      order: skillsTestData.questions.length + 1,
      candidateInstructions: ""
    };
    
    onChange({
      ...skillsTestData,
      questions: [...skillsTestData.questions, newChallenge]
    });
  };

  const updateChallenge = (id: string, updates: Partial<SkillsQuestion>) => {
    const updatedQuestions = skillsTestData.questions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    );
    
    onChange({
      ...skillsTestData,
      questions: updatedQuestions
    });
  };

  const removeChallenge = (id: string) => {
    const filteredQuestions = skillsTestData.questions
      .filter(q => q.id !== id)
      .map((q, index) => ({ ...q, order: index + 1 }));
    
    onChange({
      ...skillsTestData,
      questions: filteredQuestions
    });
  };

  const getResponseTypeLabel = (type: string) => {
    const labels = {
      text: "Text Response",
      long_text: "Long Text Response",
      multiple_choice: "Multiple Choice",
      video_upload: "Video Upload",
      file_upload: "File Upload",
      code_submission: "Code Submission",
      url_submission: "URL Submission"
    };
    return labels[type as keyof typeof labels] || "Text Response";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {jobTitle} Skills Assessment Challenge
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {skillsTestData.questions.length} challenge{skillsTestData.questions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onPreview}
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Preview
        </Button>
      </div>

      {/* Challenge Parts */}
      <div className="space-y-4">
        {skillsTestData.questions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges yet</h3>
            <p className="text-gray-600 mb-4">Add your first challenge to get started</p>
            <Button onClick={addChallenge} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add First Challenge
            </Button>
          </div>
        ) : (
          skillsTestData.questions.map((challenge, index) => {
            const isEditingInstructions = editingChallenge === challenge.id;
            const isEditingChallengeTitle = editingTitle === challenge.id;
            
            return (
              <Card key={challenge.id} className="border border-gray-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Challenge Title
                          </label>
                          {isEditingChallengeTitle ? (
                            <div className="space-y-2">
                              <Textarea
                                value={challenge.question}
                                onChange={(e) => updateChallenge(challenge.id, { question: e.target.value })}
                                className="text-lg font-semibold border-gray-300 bg-white px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                placeholder="Enter challenge title..."
                                rows={2}
                                autoFocus
                              />
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => setEditingTitle(null)}
                                  className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700"
                                >
                                  Save
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingTitle(null)}
                                  className="h-7 px-3 text-xs"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="cursor-pointer hover:bg-gray-50 transition-colors p-3 rounded-lg border border-gray-200 min-h-[60px] flex items-center"
                              onClick={() => setEditingTitle(challenge.id)}
                            >
                              {challenge.question ? (
                                <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                                  {challenge.question}
                                </h3>
                              ) : (
                                <p className="text-gray-500 italic text-sm">Click to add challenge title...</p>
                              )}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Response Type
                          </label>
                          <Select
                            value={challenge.type}
                            onValueChange={(value: any) => {
                              const updates: Partial<SkillsQuestion> = { type: value };
                              
                              // Initialize multipleChoice object when type changes to multiple_choice
                              if (value === 'multiple_choice' && !challenge.multipleChoice) {
                                updates.multipleChoice = {
                                  options: [''],
                                  allowMultiple: false
                                };
                              }
                              
                              updateChallenge(challenge.id, updates);
                            }}
                          >
                            <SelectTrigger className="w-full h-10 bg-white border-gray-300 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text Response</SelectItem>
                              <SelectItem value="long_text">Long Text Response</SelectItem>
                              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                              <SelectItem value="file_upload">File Upload</SelectItem>
                              <SelectItem value="video_upload">Video Upload</SelectItem>
                              <SelectItem value="code_submission">Code Submission</SelectItem>
                              <SelectItem value="url_submission">URL Submission</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Multiple Choice Options Configuration */}
                        {challenge.type === 'multiple_choice' && (
                          <div className="space-y-3 mt-4">
                            <div className="flex items-center justify-between">
                              <label className="block text-sm font-medium text-gray-700">
                                Answer Options
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`allow-multiple-${challenge.id}`}
                                  checked={challenge.multipleChoice?.allowMultiple || false}
                                  onChange={(e) => updateChallenge(challenge.id, {
                                    multipleChoice: {
                                      options: challenge.multipleChoice?.options || [],
                                      allowMultiple: e.target.checked
                                    }
                                  })}
                                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor={`allow-multiple-${challenge.id}`} className="text-sm text-gray-600">
                                  Allow multiple selections
                                </label>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {(challenge.multipleChoice?.options || []).map((option, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Input
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...(challenge.multipleChoice?.options || [])];
                                      newOptions[index] = e.target.value;
                                      updateChallenge(challenge.id, {
                                        multipleChoice: {
                                          options: newOptions,
                                          allowMultiple: challenge.multipleChoice?.allowMultiple || false
                                        }
                                      });
                                    }}
                                    placeholder={`Option ${index + 1}`}
                                    className="flex-1"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const newOptions = (challenge.multipleChoice?.options || []).filter((_, i) => i !== index);
                                      updateChallenge(challenge.id, {
                                        multipleChoice: {
                                          options: newOptions,
                                          allowMultiple: challenge.multipleChoice?.allowMultiple || false
                                        }
                                      });
                                    }}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newOptions = [...(challenge.multipleChoice?.options || []), ''];
                                  updateChallenge(challenge.id, {
                                    multipleChoice: {
                                      options: newOptions,
                                      allowMultiple: challenge.multipleChoice?.allowMultiple || false
                                    }
                                  });
                                }}
                                className="w-full border-dashed"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Option
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!isEditingInstructions && !isEditingChallengeTitle && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingChallenge(challenge.id)}
                          className="text-xs h-8 px-3 text-gray-600 hover:text-gray-900"
                        >
                          Edit
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeChallenge(challenge.id)}
                        className="text-red-600 hover:text-red-700 h-8 px-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isEditingInstructions ? (
                    <div className="p-4 border-t border-gray-100">
                      <RichTextEditor
                        value={challenge.candidateInstructions || ""}
                        onChange={(value) => updateChallenge(challenge.id, { candidateInstructions: value })}
                        onSave={() => setEditingChallenge(null)}
                        onCancel={() => setEditingChallenge(null)}
                        placeholder="Write the challenge instructions..."
                      />
                    </div>
                  ) : (
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors border-t border-gray-100 min-h-[80px]"
                      onClick={() => setEditingChallenge(challenge.id)}
                    >
                      {challenge.candidateInstructions ? (
                        <div 
                          className="prose prose-sm max-w-none 
                            prose-headings:text-gray-900 prose-headings:font-semibold prose-headings:mb-3 prose-headings:mt-4 prose-headings:leading-tight
                            prose-p:mb-4 prose-p:leading-relaxed prose-p:text-gray-700
                            prose-ul:mb-5 prose-ul:space-y-2 prose-li:mb-2 prose-li:text-gray-700 prose-li:leading-relaxed prose-li:pl-1
                            prose-ol:mb-5 prose-ol:space-y-2 prose-li:mb-2 prose-li:text-gray-700 prose-li:leading-relaxed prose-li:pl-1
                            prose-strong:text-gray-900 prose-strong:font-semibold
                            prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
                            prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:my-4 prose-blockquote:text-gray-600
                            prose-hr:my-6 prose-hr:border-gray-300"
                          dangerouslySetInnerHTML={{ __html: parseMarkdown(challenge.candidateInstructions) }} 
                        />
                      ) : (
                        <p className="text-gray-500 italic text-sm">Click to add challenge instructions...</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Add Challenge Button */}
      {skillsTestData.questions.length > 0 && skillsTestData.questions.length < 10 && (
        <Button
          variant="outline"
          onClick={addChallenge}
          className="w-full border-dashed border-2 border-gray-300 py-6 hover:border-blue-400 hover:text-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Challenge ({skillsTestData.questions.length}/10)
        </Button>
      )}

      {skillsTestData.questions.length >= 10 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600">
            Maximum of 10 challenges reached. Consider keeping assessments focused for better completion rates.
          </p>
        </div>
      )}
    </div>
  );
};
