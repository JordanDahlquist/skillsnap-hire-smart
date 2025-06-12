
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Clock } from "lucide-react";

interface SkillsAssessmentProps {
  testContent: string;
  responses: Array<{ question: string; answer: string }>;
  onChange: (responses: Array<{ question: string; answer: string }>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const SkillsAssessment = ({ 
  testContent, 
  responses, 
  onChange, 
  onNext, 
  onBack 
}: SkillsAssessmentProps) => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    // Parse questions from test content
    const parsedQuestions = testContent
      .split(/\d+\.|\n-|\n\*/)
      .map(q => q.trim())
      .filter(q => q.length > 10 && !q.toLowerCase().includes('skills test'))
      .slice(0, 10); // Limit to 10 questions
    
    setQuestions(parsedQuestions);
  }, [testContent]);

  useEffect(() => {
    // Load existing responses
    const answerMap: { [key: number]: string } = {};
    responses.forEach((response, index) => {
      answerMap[index] = response.answer;
    });
    setAnswers(answerMap);
  }, [responses]);

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    const newAnswers = { ...answers, [questionIndex]: answer };
    setAnswers(newAnswers);

    // Update responses
    const newResponses = questions.map((question, index) => ({
      question,
      answer: newAnswers[index] || ''
    }));
    onChange(newResponses);
  };

  const completedQuestions = Object.keys(answers).filter(key => 
    answers[parseInt(key)]?.trim()
  ).length;

  const allCompleted = completedQuestions === questions.length;

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Loading Assessment...</h3>
        <p className="text-gray-700">Please wait while we prepare your skills assessment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Skills Assessment
          </CardTitle>
          <p className="text-gray-700">
            Please answer all questions to demonstrate your skills and knowledge
          </p>
          <div className="flex items-center gap-2 mt-4">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">
              Progress: {completedQuestions} of {questions.length} questions completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedQuestions / questions.length) * 100}%` }}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Question Navigation */}
      <div className="flex flex-wrap gap-2 justify-center">
        {questions.map((_, index) => (
          <Button
            key={index}
            variant={index === currentQuestion ? "default" : answers[index] ? "outline" : "ghost"}
            size="sm"
            onClick={() => setCurrentQuestion(index)}
            className={`w-10 h-10 p-0 ${answers[index] ? 'bg-green-50 border-green-200' : ''}`}
          >
            {answers[index] ? <CheckCircle className="w-4 h-4 text-green-600" /> : index + 1}
          </Button>
        ))}
      </div>

      {/* Current Question */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg text-gray-900">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            {answers[currentQuestion] && (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <p className="text-gray-900 leading-relaxed">
              {questions[currentQuestion]}
            </p>
          </div>
          
          <div>
            <Label htmlFor={`question-${currentQuestion}`} className="text-gray-800">
              Your Answer
            </Label>
            <Textarea
              id={`question-${currentQuestion}`}
              value={answers[currentQuestion] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
              rows={6}
              placeholder="Type your answer here..."
              className="mt-1 text-gray-900"
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            Previous Question
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
            disabled={currentQuestion === questions.length - 1}
          >
            Next Question
          </Button>
          <Button onClick={onNext} disabled={!allCompleted}>
            Continue
          </Button>
        </div>
      </div>

      {allCompleted && (
        <Card className="bg-green-50 border border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">
                All questions completed! You can now proceed to the next step.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
