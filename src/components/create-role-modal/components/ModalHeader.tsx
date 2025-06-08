
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";

export const ModalHeader = () => {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-blue-600" />
        Create AI-Powered Job
      </DialogTitle>
      <DialogDescription>
        Create a professional job posting with AI-generated content and skills assessments.
      </DialogDescription>
    </DialogHeader>
  );
};
