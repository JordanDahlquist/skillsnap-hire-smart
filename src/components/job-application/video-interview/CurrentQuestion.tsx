
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { parseMarkdown } from "@/utils/markdownParser";

interface CurrentQuestionProps {
  questionNumber: number;
  totalQuestions: number;
  questionText: string;
  isRecorded: boolean;
}

export const CurrentQuestion = ({
  questionNumber,
  totalQuestions,
  questionText,
  isRecorded
}: CurrentQuestionProps) => {
  const formattedQuestion = parseMarkdown(questionText);

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg text-gray-900">
          <span>Question {questionNumber} of {totalQuestions}</span>
          {isRecorded && (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div 
            className="text-gray-900 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formattedQuestion }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
