
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

interface RejectionConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName: string;
  isUpdating: boolean;
  onConfirm: (reason: string) => void;
}

export const RejectionConfirmationDialog = ({
  open,
  onOpenChange,
  candidateName,
  isUpdating,
  onConfirm
}: RejectionConfirmationDialogProps) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const handleConfirm = () => {
    const finalReason = selectedReason === "Other" ? customReason : selectedReason;
    onConfirm(finalReason);
    // Reset form
    setSelectedReason("");
    setCustomReason("");
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset form
    setSelectedReason("");
    setCustomReason("");
  };

  const isValid = selectedReason && (selectedReason !== "Other" || customReason.trim());

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Reject {candidateName}?</AlertDialogTitle>
          <AlertDialogDescription>
            Please select a reason for rejecting this application. This action can be undone later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4">
          <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
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
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter specific rejection reason..."
                className="min-h-[80px]"
              />
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isUpdating}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isUpdating || !isValid}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isUpdating ? "Rejecting..." : "Confirm Rejection"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
