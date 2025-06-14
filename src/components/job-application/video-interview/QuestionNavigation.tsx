
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface QuestionNavigationProps {
  questions: string[];
  currentQuestion: number;
  recordedVideos: { [key: number]: string };
  onQuestionChange: (index: number) => void;
}

export const QuestionNavigation = ({
  questions,
  currentQuestion,
  recordedVideos,
  onQuestionChange
}: QuestionNavigationProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {questions.map((_, index) => (
        <Button
          key={index}
          variant={index === currentQuestion ? "default" : recordedVideos[index] ? "outline" : "ghost"}
          size="sm"
          onClick={() => onQuestionChange(index)}
          className={`w-10 h-10 p-0 ${recordedVideos[index] ? 'bg-green-50 border-green-200 hover:bg-green-100' : 'bg-white hover:bg-gray-50'}`}
        >
          {recordedVideos[index] ? <CheckCircle className="w-4 h-4 text-green-600" /> : index + 1}
        </Button>
      ))}
    </div>
  );
};
