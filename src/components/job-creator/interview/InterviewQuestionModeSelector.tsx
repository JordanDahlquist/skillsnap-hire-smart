
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Sparkles, Edit3 } from "lucide-react";

interface InterviewQuestionModeSelectorProps {
  onSelectMode: (mode: 'ai_generated' | 'template_based' | 'custom') => void;
}

export const InterviewQuestionModeSelector = ({ onSelectMode }: InterviewQuestionModeSelectorProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSelectMode('ai_generated')}>
        <CardHeader className="text-center pb-4">
          <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <CardTitle className="text-lg">AI Generated</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Let AI create targeted interview questions based on your job description and requirements.
          </p>
          <Button variant="outline" className="w-full">
            Generate with AI
          </Button>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSelectMode('template_based')}>
        <CardHeader className="text-center pb-4">
          <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
            <Video className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-lg">Use Template</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Choose from pre-built interview question templates designed for specific roles.
          </p>
          <Button variant="outline" className="w-full">
            Browse Templates
          </Button>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSelectMode('custom')}>
        <CardHeader className="text-center pb-4">
          <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
            <Edit3 className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-lg">Build Custom</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Create your own custom interview questions with specific requirements and evaluation criteria.
          </p>
          <Button variant="outline" className="w-full">
            Build Custom
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
