
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { CustomSpinningLogo } from "@/components/CustomSpinningLogo";

interface JobPostGeneratorInitialStateProps {
  isGenerating: boolean;
  onGenerateJobPost: () => Promise<void>;
}

export const JobPostGeneratorInitialState = ({
  isGenerating,
  onGenerateJobPost
}: JobPostGeneratorInitialStateProps) => {
  if (isGenerating) {
    return (
      <Card className="h-full flex flex-col items-center justify-center">
        <CardContent className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
            <CustomSpinningLogo size={48} animationSpeed="fast" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Generating Your Job Post...
          </h3>
          <p className="text-sm text-gray-600">
            Our AI is crafting the perfect job description. Please wait a moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col items-center justify-center">
      <CardContent className="text-center max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Ready to Generate
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Click the button to generate your job post.
        </p>
        <Button 
          onClick={onGenerateJobPost}
          disabled={isGenerating}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Generate Job Post
          <Sparkles className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};
