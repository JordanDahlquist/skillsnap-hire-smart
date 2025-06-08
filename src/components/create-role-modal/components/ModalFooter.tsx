
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { FileText, Sparkles, Loader2 } from "lucide-react";

interface ModalFooterProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSaving: boolean;
  allTabsComplete: boolean;
  onSubmitAsDraft: () => Promise<void>;
  onSubmitAsPublished: (allTabsComplete: boolean, getIncompleteTabsMessage: () => string) => Promise<void>;
  getIncompleteTabsMessage: () => string;
}

export const ModalFooter = ({
  activeTab,
  setActiveTab,
  isSaving,
  allTabsComplete,
  onSubmitAsDraft,
  onSubmitAsPublished,
  getIncompleteTabsMessage
}: ModalFooterProps) => {
  return (
    <DialogFooter className="flex justify-between">
      <div className="flex gap-2">
        {activeTab !== "1" && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setActiveTab((parseInt(activeTab) - 1).toString())}
          >
            Previous
          </Button>
        )}
        {activeTab !== "4" && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setActiveTab((parseInt(activeTab) + 1).toString())}
          >
            Next
          </Button>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isSaving}
          onClick={onSubmitAsDraft}
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <FileText className="w-4 h-4 mr-2" />
          )}
          Save as Draft
        </Button>
        <Button
          type="button"
          disabled={isSaving || !allTabsComplete}
          onClick={() => onSubmitAsPublished(allTabsComplete, getIncompleteTabsMessage)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          Publish Job
        </Button>
      </div>
    </DialogFooter>
  );
};
