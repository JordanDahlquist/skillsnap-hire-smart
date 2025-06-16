
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { WritingTone } from "@/types/jobForm";

interface ToneControlSlidersProps {
  writingTone: WritingTone;
  onToneChange: (field: keyof WritingTone, value: number) => void;
  onRegenerate?: () => void;
  isGenerating?: boolean;
}

export const ToneControlSliders = ({
  writingTone,
  onToneChange,
  onRegenerate,
  isGenerating = false
}: ToneControlSlidersProps) => {
  const toneSettings = [{
    key: 'professional' as keyof WritingTone,
    label: 'Professional',
    description: 'Formal, business-oriented language',
    value: writingTone.professional
  }, {
    key: 'friendly' as keyof WritingTone,
    label: 'Friendly',
    description: 'Approachable, warm tone',
    value: writingTone.friendly
  }, {
    key: 'excited' as keyof WritingTone,
    label: 'Excited',
    description: 'Energetic, enthusiastic language',
    value: writingTone.excited
  }];

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Writing Tone</CardTitle>
          {onRegenerate && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRegenerate} 
              disabled={isGenerating} 
              className="text-xs h-8 px-3"
            >
              {isGenerating ? 'Regenerating...' : 'Regenerate'}
              <Sparkles className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-3 gap-4">
          {toneSettings.map(setting => (
            <div key={setting.key} className="space-y-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label className="text-xs font-medium cursor-help">
                      {setting.label} ({setting.value})
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{setting.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="px-1">
                <Slider 
                  value={[setting.value]} 
                  onValueChange={values => onToneChange(setting.key, values[0])} 
                  min={1} 
                  max={5} 
                  step={1} 
                  className="w-full" 
                />
                <div className="relative mt-1 h-2 mx-2">
                  {[1, 2, 3, 4, 5].map(dot => (
                    <div
                      key={dot}
                      className={`absolute w-1.5 h-1.5 rounded-full transform -translate-x-1/2 ${
                        dot === setting.value ? 'bg-primary' : 'bg-gray-300'
                      }`}
                      style={{
                        left: `${6 + ((dot - 1) / 4) * 88}%`
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
