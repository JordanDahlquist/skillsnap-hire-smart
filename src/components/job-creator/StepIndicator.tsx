
interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-center py-4 px-4 border-b flex-shrink-0">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {step}
          </div>
          {step < totalSteps && (
            <div className={`w-12 h-1 mx-3 ${
              currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
};
