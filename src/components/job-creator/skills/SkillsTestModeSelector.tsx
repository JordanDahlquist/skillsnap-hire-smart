
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wrench, Eye, ArrowLeft } from "lucide-react";

interface SkillsTestModeSelectorProps {
  onSelectMode: (mode: 'ai_generated' | 'custom_builder' | 'preview') => void;
  onBack: () => void;
  isGenerating: boolean;
}

export const SkillsTestModeSelector = ({ 
  onSelectMode, 
  onBack, 
  isGenerating 
}: SkillsTestModeSelectorProps) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="p-1 h-8 w-8"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <CardTitle className="flex items-center gap-2 text-lg">
            Skills Assessment Options
          </CardTitle>
          <Badge variant="outline" className="text-xs text-gray-600 bg-gray-50">
            Optional
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-2xl space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Choose how to create your skills assessment
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* AI Generated Option */}
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200">
                <CardContent className="p-6 text-center" onClick={() => onSelectMode('ai_generated')}>
                  <div className="w-12 h-12 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">AI Generated</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Let AI create targeted questions based on your job post. Fast and intelligent.
                  </p>
                  <Button 
                    disabled={isGenerating}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isGenerating ? 'Generating...' : 'Generate with AI'}
                  </Button>
                </CardContent>
              </Card>

              {/* Custom Builder Option */}
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-green-200">
                <CardContent className="p-6 text-center" onClick={() => onSelectMode('custom_builder')}>
                  <div className="w-12 h-12 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Custom Builder</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Build your own assessment with templates or from scratch. Full control.
                  </p>
                  <Button 
                    variant="outline"
                    className="w-full border-green-600 text-green-600 hover:bg-green-50"
                  >
                    Start Building
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-center">
            <Button 
              variant="ghost"
              onClick={() => onSelectMode('preview')}
              className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview Sample Assessment
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
