
import { Sparkles } from "lucide-react";

interface LoadingStateProps {
  title: string;
  description: string;
  color?: string;
}

export const LoadingState = ({ title, description, color = "purple" }: LoadingStateProps) => (
  <div className="text-center py-12">
    <div className="animate-pulse flex flex-col items-center">
      <Sparkles className={`w-12 h-12 text-${color}-600 animate-spin mb-4`} />
      <p className="text-lg font-medium">{title}</p>
      <p className="text-sm text-gray-500 mt-2">{description}</p>
    </div>
  </div>
);
