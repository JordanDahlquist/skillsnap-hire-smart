
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, HelpCircle, LucideIcon } from "lucide-react";

interface EnhancedMetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  description: string;
  trend?: {
    direction: 'up' | 'down';
    value: string;
    isPositive: boolean;
  };
  suggestion?: string;
  benchmark?: {
    label: string;
    value: string;
  };
}

export const EnhancedMetricCard = ({
  title,
  value,
  icon: IconComponent,
  color,
  bgColor,
  description,
  trend,
  suggestion,
  benchmark
}: EnhancedMetricCardProps) => {
  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${bgColor}`}>
              <IconComponent className={`w-5 h-5 ${color}`} />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-4 h-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {trend && (
            <div className="flex items-center gap-1">
              {trend.direction === 'up' ? (
                <TrendingUp className={`w-4 h-4 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`} />
              ) : (
                <TrendingDown className={`w-4 h-4 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`} />
              )}
              <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.value}
              </span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          
          {benchmark && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {benchmark.label}: {benchmark.value}
              </Badge>
            </div>
          )}
          
          {suggestion && (
            <p className="text-xs text-gray-500 mt-2 italic">{suggestion}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
