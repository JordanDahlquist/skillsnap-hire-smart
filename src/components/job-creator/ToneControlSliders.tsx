
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { WritingTone } from "@/types/jobForm";

interface ToneControlSlidersProps {
  writingTone: WritingTone;
  onToneChange: (field: keyof WritingTone, value: number) => void;
}

export const ToneControlSliders = ({ writingTone, onToneChange }: ToneControlSlidersProps) => {
  const toneSettings = [
    {
      key: 'professional' as keyof WritingTone,
      label: 'Professional',
      description: 'Formal, business-oriented language',
      value: writingTone.professional
    },
    {
      key: 'friendly' as keyof WritingTone,
      label: 'Friendly',
      description: 'Approachable, warm tone',
      value: writingTone.friendly
    },
    {
      key: 'excited' as keyof WritingTone,
      label: 'Excited',
      description: 'Energetic, enthusiastic language',
      value: writingTone.excited
    }
  ];

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Writing Tone</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-3 gap-4">
          {toneSettings.map((setting) => (
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
                  onValueChange={(values) => onToneChange(setting.key, values[0])}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between mt-0.5">
                  {[1, 2, 3, 4, 5].map((dot) => (
                    <div
                      key={dot}
                      className={`w-1 h-1 rounded-full ${
                        dot === setting.value 
                          ? 'bg-primary' 
                          : 'bg-gray-300'
                      }`}
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
