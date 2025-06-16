
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Writing Tone</CardTitle>
        <p className="text-xs text-gray-600">Adjust the style of your job description</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {toneSettings.map((setting) => (
          <div key={setting.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{setting.label}</Label>
              <span className="text-xs text-gray-500">{setting.value}/5</span>
            </div>
            <div className="px-2">
              <Slider
                value={[setting.value]}
                onValueChange={(values) => onToneChange(setting.key, values[0])}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-1">
                {[1, 2, 3, 4, 5].map((dot) => (
                  <div
                    key={dot}
                    className={`w-2 h-2 rounded-full ${
                      dot === setting.value 
                        ? 'bg-primary' 
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500">{setting.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
