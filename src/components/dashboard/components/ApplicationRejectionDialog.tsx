
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, AlertTriangle, Clock, MapPin, DollarSign, FileX, Briefcase, Users } from "lucide-react";

const rejectionReasons = [
  { value: "Skills Mismatch", label: "Skills Mismatch", icon: XCircle, priority: "high", description: "Required skills don't align with candidate's expertise" },
  { value: "Insufficient Experience", label: "Insufficient Experience", icon: Clock, priority: "high", description: "Candidate doesn't meet experience requirements" },
  { value: "Unsuccessful Assessment", label: "Unsuccessful Assessment", icon: AlertTriangle, priority: "high", description: "Did not pass skills assessment or screening" },
  { value: "Unsuccessful Interview", label: "Unsuccessful Interview", icon: Users, priority: "medium", description: "Interview performance didn't meet expectations" },
  { value: "Position Filled", label: "Position Filled", icon: CheckCircle2, priority: "medium", description: "Role has been filled by another candidate" },
  { value: "Overqualified", label: "Overqualified", icon: Briefcase, priority: "medium", description: "Candidate's qualifications exceed role requirements" },
  { value: "Location Requirements", label: "Location Requirements", icon: MapPin, priority: "low", description: "Geographic or remote work constraints" },
  { value: "Salary Expectations", label: "Salary Expectations", icon: DollarSign, priority: "low", description: "Compensation expectations don't align" },
  { value: "Poor Application Quality", label: "Poor Application Quality", icon: FileX, priority: "low", description: "Application lacks required information or quality" },
  { value: "Other", label: "Other Reason", icon: AlertTriangle, priority: "low", description: "Specify custom rejection reason" }
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
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50/50';
      case 'medium': return 'border-orange-200 bg-orange-50/50';
      case 'low': return 'border-gray-200 bg-gray-50/50';
      default: return 'border-gray-200 bg-gray-50/50';
    }
  };

  const getSelectedColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-100 ring-2 ring-red-200';
      case 'medium': return 'border-orange-500 bg-orange-100 ring-2 ring-orange-200';
      case 'low': return 'border-blue-500 bg-blue-100 ring-2 ring-blue-200';
      default: return 'border-blue-500 bg-blue-100 ring-2 ring-blue-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold">
            Reject Application - {candidateName}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Select a reason for rejection. This information will help improve your hiring process and can be shared with the candidate if needed.
          </p>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <Label className="text-base font-medium text-foreground">Rejection Reason</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rejectionReasons.map((reason) => {
                const Icon = reason.icon;
                const isSelected = selectedReason === reason.value;
                
                return (
                  <div
                    key={reason.value}
                    onClick={() => onReasonChange(reason.value)}
                    className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-md ${
                      isSelected 
                        ? getSelectedColor(reason.priority)
                        : `${getPriorityColor(reason.priority)} hover:border-gray-300`
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        isSelected ? 'text-current' : 'text-muted-foreground'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium text-sm ${
                            isSelected ? 'text-current' : 'text-foreground'
                          }`}>
                            {reason.label}
                          </h4>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-current flex-shrink-0" />
                          )}
                        </div>
                        <p className={`text-xs mt-1 leading-relaxed ${
                          isSelected ? 'text-current/80' : 'text-muted-foreground'
                        }`}>
                          {reason.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedReason === "Other" && (
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
              <Label htmlFor="custom-reason" className="text-sm font-medium text-foreground">
                Please specify the rejection reason:
              </Label>
              <Textarea
                id="custom-reason"
                value={customReason}
                onChange={(e) => onCustomReasonChange(e.target.value)}
                placeholder="Enter specific rejection reason..."
                className="min-h-[100px] resize-none"
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-3 pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isUpdating}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isUpdating || !selectedReason || (selectedReason === "Other" && !customReason.trim())}
            className="bg-red-600 hover:bg-red-700 text-white min-w-[140px]"
          >
            {isUpdating ? "Rejecting..." : "Confirm Rejection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
