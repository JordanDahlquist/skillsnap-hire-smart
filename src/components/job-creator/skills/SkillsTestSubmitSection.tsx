
import { Button } from "@/components/ui/button";

export const SkillsTestSubmitSection = () => {
  return (
    <div className="text-center pt-6 border-t border-gray-200">
      <Button size="lg" disabled className="px-8">
        Submit Assessment
      </Button>
      <p className="text-xs text-gray-500 mt-2">
        This is a preview - candidates will see a functional form
      </p>
    </div>
  );
};
