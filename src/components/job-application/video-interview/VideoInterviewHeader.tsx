
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera } from "lucide-react";

interface VideoInterviewHeaderProps {
  maxLength: number;
  completedVideos: number;
  totalQuestions: number;
}

export const VideoInterviewHeader = ({ 
  maxLength, 
  completedVideos, 
  totalQuestions 
}: VideoInterviewHeaderProps) => {
  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Video Interview
        </CardTitle>
        <p className="text-gray-700">
          Record your responses to the interview questions (max {maxLength} minutes each)
        </p>
        <div className="flex items-center gap-2 mt-4">
          <Camera className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-700">
            Progress: {completedVideos} of {totalQuestions} questions recorded
          </span>
        </div>
      </CardHeader>
    </Card>
  );
};
