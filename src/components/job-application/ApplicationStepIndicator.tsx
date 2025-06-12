
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  title: string;
  description: string;
}

interface ApplicationStepIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps: boolean[];
}

export const ApplicationStepIndicator = ({ 
  steps, 
  currentStep, 
  completedSteps 
}: ApplicationStepIndicatorProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const isCompleted = completedSteps[index];
          const isCurrent = index === currentStep;
          const isAccessible = index <= currentStep;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors border-2",
                    {
                      "bg-green-500 text-white border-green-500": isCompleted,
                      "bg-blue-500 text-white border-blue-500": isCurrent && !isCompleted,
                      "bg-white text-muted-foreground border-border": !isCompleted && !isCurrent,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                
                {/* Step Labels */}
                <div className="mt-2 text-center min-w-0">
                  <div
                    className={cn(
                      "text-sm font-medium",
                      {
                        "text-blue-600": isCurrent,
                        "text-green-600": isCompleted,
                        "text-foreground": !isCurrent && !isCompleted && isAccessible,
                        "text-muted-foreground": !isAccessible,
                      }
                    )}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    {step.description}
                  </div>
                </div>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4 transition-colors",
                    {
                      "bg-green-500": isCompleted,
                      "bg-blue-500": isCurrent,
                      "bg-border": !isCompleted,
                    }
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
