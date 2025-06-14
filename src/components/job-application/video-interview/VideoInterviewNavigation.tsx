
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

interface VideoInterviewNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  isCurrentQuestionRecorded: boolean;
  allCompleted: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onContinueToReview: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export const VideoInterviewNavigation = ({
  currentQuestion,
  totalQuestions,
  isCurrentQuestionRecorded,
  allCompleted,
  onPrevious,
  onNext,
  onContinueToReview,
  canGoPrevious,
  canGoNext
}: VideoInterviewNavigationProps) => {
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  return (
    <div className="flex justify-between items-center">
      <Button 
        variant="outline" 
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous Question
      </Button>

      <div className="flex gap-3">
        {!allCompleted && (
          <Button 
            onClick={onNext} 
            disabled={!canGoNext || !isCurrentQuestionRecorded}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            {isLastQuestion ? 'Finish Recording' : 'Next Question'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}

        {allCompleted && (
          <Button 
            onClick={onContinueToReview}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Continue to Review
          </Button>
        )}
      </div>
    </div>
  );
};
