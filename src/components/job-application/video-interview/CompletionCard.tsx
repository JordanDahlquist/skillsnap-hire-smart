
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface CompletionCardProps {
  isAllCompleted: boolean;
}

export const CompletionCard = ({ isAllCompleted }: CompletionCardProps) => {
  if (!isAllCompleted) return null;

  return (
    <Card className="bg-green-50 border border-green-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="font-medium text-green-900">
            All video responses recorded! You can now proceed to review your application.
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
