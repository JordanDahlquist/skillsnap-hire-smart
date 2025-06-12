
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApplicationProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  completedSteps: boolean[];
}

export const ApplicationProgress = ({ 
  currentStep, 
  totalSteps, 
  stepLabels, 
  completedSteps 
}: ApplicationProgressProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {stepLabels.map((label, index) => {
          const isCompleted = completedSteps[index];
          const isCurrent = index === currentStep;
          const isAccessible = index <= currentStep;

          return (
            <div key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors",
                    {
                      "bg-green-500 text-white border-green-500": isCompleted,
                      "bg-blue-500 text-white border-blue-500": isCurrent && !isCompleted,
                      "bg-white text-gray-900 border-gray-300": !isCompleted && !isCurrent && isAccessible,
                      "bg-gray-100 text-gray-500 border-gray-200": !isAccessible,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                
                <div className="mt-2 text-center">
                  <div
                    className={cn(
                      "text-sm font-medium",
                      {
                        "text-blue-600": isCurrent,
                        "text-green-600": isCompleted,
                        "text-gray-900": !isCurrent && !isCompleted && isAccessible,
                        "text-gray-500": !isAccessible,
                      }
                    )}
                  >
                    {label}
                  </div>
                </div>
              </div>
              
              {index < totalSteps - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4 transition-colors",
                    {
                      "bg-green-500": isCompleted,
                      "bg-blue-500": isCurrent,
                      "bg-gray-300": !isCompleted,
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
