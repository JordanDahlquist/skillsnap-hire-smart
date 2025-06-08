
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const rejectionReasons = [
  "Insufficient Experience",
  "Skills Mismatch", 
  "Unsuccessful Assessment",
  "Unsuccessful Interview",
  "Overqualified",
  "Location Requirements",
  "Salary Expectations",
  "Poor Application Quality",
  "Position Filled",
  "Other"
];

interface ApplicationRejectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName: string;
  selectedReason: string;
  customReason: string;
  isUpdating: boolean;
  onReasonChange: (reason: string) => void;
  onCustomReasonChange: (reason: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ApplicationRejectionDialog = ({
  open,
  onOpenChange,
  candidateName,
  selectedReason,
  customReason,
  isUpdating,
  onReasonChange,
  onCustomReasonChange,
  onConfirm,
  onCancel
}: ApplicationRejectionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject {candidateName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Please select a reason for rejecting this application:
          </p>
          
          <RadioGroup value={selectedReason} onValueChange={onReasonChange}>
            {rejectionReasons.map((reason) => (
              <div key={reason} className="flex items-center space-x-2">
                <RadioGroupItem value={reason} id={reason} />
                <Label htmlFor={reason} className="text-sm cursor-pointer">
                  {reason}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {selectedReason === "Other" && (
            <div className="space-y-2">
              <Label htmlFor="custom-reason" className="text-sm font-medium">
                Please specify:
              </Label>
              <Textarea
                id="custom-reason"
                value={customReason}
                onChange={(e) => onCustomReasonChange(e.target.value)}
                placeholder="Enter specific rejection reason..."
                className="min-h-[80px]"
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={onConfirm}
            disabled={isUpdating || !selectedReason || (selectedReason === "Other" && !customReason.trim())}
          >
            {isUpdating ? "Rejecting..." : "Confirm Rejection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
