
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
    <div className="flex justify-center items-center gap-3">
      <span className="text-sm text-gray-600 font-medium">Progress:</span>
      <div className="flex gap-2">
        {questions.map((_, index) => (
          <button
            key={index}
            onClick={() => onQuestionChange(index)}
            className={`w-8 h-8 rounded-full text-xs font-medium transition-all duration-200 flex items-center justify-center ${
              index === currentQuestion
                ? 'bg-blue-600 text-white shadow-md'
                : recordedVideos[index]
                ? 'bg-green-100 border border-green-300 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 border border-gray-300 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {recordedVideos[index] ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              index + 1
            )}
          </button>
        ))}
      </div>
      <span className="text-sm text-gray-500">
        {Object.keys(recordedVideos).length} of {questions.length} completed
      </span>
    </div>
  );
};
