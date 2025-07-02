
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TopPickBadgeProps {
  className?: string;
}

export const TopPickBadge = ({ className = "" }: TopPickBadgeProps) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Badge 
            className={`bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 font-semibold text-xs px-2 py-1 gap-1 ${className}`}
          >
            <Star className="w-3 h-3 fill-current" />
            Top Pick
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="z-[9999]">
          <p>This candidate is in the top 10% based on AI analysis</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
