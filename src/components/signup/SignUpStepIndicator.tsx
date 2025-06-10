
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  title: string;
  description: string;
}

interface SignUpStepIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps: boolean[];
}

export const SignUpStepIndicator = ({ 
  steps, 
  currentStep, 
  completedSteps 
}: SignUpStepIndicatorProps) => {
  return (
    <div className="flex items-center justify-between">
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
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                  {
                    "bg-green-500 text-white shadow-lg": isCompleted,
                    "bg-blue-500 text-white shadow-lg": isCurrent && !isCompleted,
                    "bg-gray-200 text-gray-600": !isAccessible,
                    "bg-gray-100 text-gray-400": isAccessible && !isCurrent && !isCompleted,
                  }
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              
              {/* Step Labels - Only show on larger screens */}
              <div className="mt-3 text-center min-w-0 hidden sm:block">
                <div
                  className={cn(
                    "text-sm font-medium transition-colors",
                    {
                      "text-blue-600": isCurrent,
                      "text-green-600": isCompleted,
                      "text-gray-900": isAccessible && !isCurrent && !isCompleted,
                      "text-gray-400": !isAccessible,
                    }
                  )}
                >
                  {step.title}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {step.description}
                </div>
              </div>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-4 transition-colors duration-200",
                  {
                    "bg-green-500": isCompleted,
                    "bg-blue-500": isCurrent,
                    "bg-gray-200": index < currentStep && !isCompleted,
                    "bg-gray-100": index >= currentStep,
                  }
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
