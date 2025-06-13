
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Job } from "@/types";

interface ApplicationFormData {
  name: string;
  email: string;
  portfolio: string;
  resumeUrl: string | null;
  answer1: string;
  answer2: string;
  answer3: string;
  skillsTestResponses: Array<{
    question: string;
    answer: string;
  }>;
  videoUrl: string | null;
}

interface SkillsAssessmentStepProps {
  job: Job;
  formData: ApplicationFormData;
  onFormDataChange: (updates: Partial<ApplicationFormData>) => void;
  onValidationChange: (isValid: boolean) => void;
}

const parseSkillsTestQuestions = (testContent: string): string[] => {
  if (!testContent) return [];
  
  console.log('Raw test content:', testContent);
  
  // Remove markdown headers and clean up the content
  let cleanContent = testContent
    .replace(/^#{1,6}\s+.*$/gm, '') // Remove markdown headers
    .replace(/\*\*Skills Assessment.*?\*\*/gi, '') // Remove assessment headers
    .replace(/Skills Assessment.*?Position/gi, '') // Remove title lines
    .replace(/Instructions?:.*?(?=\d+\.|$)/gis, '') // Remove instruction blocks
    .trim();
  
  console.log('Cleaned content:', cleanContent);
  
  // First try: Split by numbered questions (1., 2., etc.)
  let questionMatches = cleanContent.match(/(?:^|\n)\s*(\d+)\.\s+(.+?)(?=(?:\n\s*\d+\.|$))/gs);
  
  if (questionMatches && questionMatches.length > 0) {
    const questions = questionMatches
      .map(match => {
        // Extract just the question text after the number
        const questionText = match.replace(/^\s*\d+\.\s*/, '').trim();
        return questionText;
      })
      .filter(q => q.length > 10 && !q.toLowerCase().includes('skills test'))
      .filter(q => !q.toLowerCase().includes('instructions'))
      .filter(q => !q.toLowerCase().includes('assessment'));
    
    if (questions.length > 0) {
      console.log('Parsed numbered questions:', questions);
      return questions;
    }
  }
  
  // Second try: Split by bullet points or dashes
  let bulletQuestions = cleanContent
    .split(/\n\s*[-*•]\s+/)
    .map(q => q.trim())
    .filter(q => q.length > 15)
    .filter(q => !q.toLowerCase().includes('skills test'))
    .filter(q => !q.toLowerCase().includes('instructions'))
    .filter(q => !q.toLowerCase().includes('assessment'));
  
  if (bulletQuestions.length > 1) {
    // Remove the first item if it's likely a header
    if (bulletQuestions[0].length < 50) {
      bulletQuestions = bulletQuestions.slice(1);
    }
    console.log('Parsed bullet questions:', bulletQuestions);
    return bulletQuestions;
  }
  
  // Third try: Split by double newlines and filter for question-like content
  let paragraphQuestions = cleanContent
    .split(/\n\s*\n/)
    .map(q => q.trim())
    .filter(q => q.length > 20)
    .filter(q => q.includes('?') || q.toLowerCase().includes('describe') || q.toLowerCase().includes('explain') || q.toLowerCase().includes('how'))
    .filter(q => !q.toLowerCase().includes('assessment'))
    .filter(q => !q.toLowerCase().includes('instructions'));
  
  console.log('Final paragraph questions:', paragraphQuestions);
  return paragraphQuestions;
};

export const SkillsAssessmentStep = ({ 
  job, 
  formData, 
  onFormDataChange, 
  onValidationChange 
}: SkillsAssessmentStepProps) => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<{ [key: number]: string }>({});

  // Parse questions from the generated test
  useEffect(() => {
    if (job.generated_test) {
      const parsedQuestions = parseSkillsTestQuestions(job.generated_test);
      setQuestions(parsedQuestions);
      console.log('Final questions set:', parsedQuestions);
    }
  }, [job.generated_test]);

  // Load existing responses
  useEffect(() => {
    if (formData.skillsTestResponses.length > 0) {
      const responseMap: { [key: number]: string } = {};
      formData.skillsTestResponses.forEach((response, index) => {
        responseMap[index] = response.answer;
      });
      setResponses(responseMap);
    }
  }, [formData.skillsTestResponses]);

  // Validate when responses change
  useEffect(() => {
    if (!job.generated_test) {
      onValidationChange(true); // No test means this step is valid
      return;
    }

    const allAnswered = questions.every((_, index) => 
      responses[index] && responses[index].trim().length > 0
    );
    onValidationChange(allAnswered);
  }, [responses, questions, job.generated_test, onValidationChange]);

  const handleResponseChange = (questionIndex: number, answer: string) => {
    const newResponses = { ...responses, [questionIndex]: answer };
    setResponses(newResponses);

    // Update form data
    const skillsTestResponses = questions.map((question, index) => ({
      question,
      answer: newResponses[index] || ''
    }));
    
    onFormDataChange({ skillsTestResponses });
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // If no test is generated, show a message
  if (!job.generated_test) {
    useEffect(() => {
      onValidationChange(true);
    }, [onValidationChange]);

    return (
      <div className="text-center space-y-6">
        <div className="bg-blue-50 rounded-lg p-8">
          <CheckCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Skills Assessment Required</h2>
          <p className="text-gray-600">
            This position doesn't require a skills assessment. You can proceed to the next step.
          </p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center space-y-6">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-900">Unable to Parse Assessment</h2>
        <p className="text-gray-600">
          The skills assessment content could not be properly parsed. Please contact support.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg text-left max-w-2xl mx-auto">
          <p className="text-sm text-gray-700 font-medium mb-2">Raw Content:</p>
          <pre className="text-xs text-gray-600 whitespace-pre-wrap">{job.generated_test}</pre>
        </div>
      </div>
    );
  }

  const completedQuestions = Object.keys(responses).filter(key => responses[parseInt(key)]?.trim()).length;
  const progressPercentage = (completedQuestions / questions.length) * 100;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Skills Assessment</h2>
        <p className="text-gray-600 mt-2">
          Please answer all questions to the best of your ability
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500">
            Progress: {completedQuestions} of {questions.length} questions
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Question Navigation */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {questions.map((_, index) => (
          <Button
            key={index}
            variant={index === currentQuestionIndex ? "default" : responses[index] ? "secondary" : "outline"}
            size="sm"
            onClick={() => goToQuestion(index)}
            className={`w-10 h-10 p-0 ${
              responses[index] 
                ? 'bg-green-100 hover:bg-green-200 text-green-800 border-green-300' 
                : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
            }`}
          >
            {responses[index] ? <CheckCircle className="w-4 h-4 text-green-600" /> : index + 1}
          </Button>
        ))}
      </div>

      {/* Current Question */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            {responses[currentQuestionIndex] && (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-800 leading-relaxed">
              {questions[currentQuestionIndex]}
            </p>
          </div>
          
          <div>
            <Label htmlFor={`question-${currentQuestionIndex}`}>Your Answer</Label>
            <Textarea
              id={`question-${currentQuestionIndex}`}
              value={responses[currentQuestionIndex] || ''}
              onChange={(e) => handleResponseChange(currentQuestionIndex, e.target.value)}
              rows={6}
              placeholder="Type your answer here..."
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevQuestion}
          disabled={currentQuestionIndex === 0}
          className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
        >
          Previous Question
        </Button>
        
        <Button
          onClick={nextQuestion}
          disabled={currentQuestionIndex === questions.length - 1}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Next Question
        </Button>
      </div>

      {/* Summary */}
      {completedQuestions === questions.length && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-900">
              All questions completed! You can now proceed to the next step.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
