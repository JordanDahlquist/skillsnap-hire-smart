import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AdminUser } from "@/types/admin";
import { Loader2 } from "lucide-react";

interface UpdateUserStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  newStatus: 'active' | 'inactive' | 'deleted';
  onConfirm: () => void;
  isUpdating: boolean;
}

const getStatusChangeMessage = (currentStatus: string, newStatus: string, userName: string) => {
  const statusActions = {
    active: 'activate',
    inactive: 'deactivate', 
    deleted: 'mark as deleted'
  };
  
  return `Are you sure you want to ${statusActions[newStatus]} ${userName}'s account?`;
};

const getStatusDescription = (newStatus: string) => {
  const descriptions = {
    active: "The user will regain full access to their account and all features.",
    inactive: "The user will lose access to their account but all data will be preserved.",
    deleted: "The user will be marked as deleted but all data will be preserved. This can be reversed by changing the status back to active."
  };
  
  return descriptions[newStatus];
};

export const UpdateUserStatusDialog = ({ 
  open, 
  onOpenChange, 
  user, 
  newStatus, 
  onConfirm, 
  isUpdating 
}: UpdateUserStatusDialogProps) => {
  if (!user) return null;

  const userName = user.full_name || user.email;
  const isDestructive = newStatus === 'inactive' || newStatus === 'deleted';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className={isDestructive ? "text-destructive" : ""}>
            Update User Status
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              {getStatusChangeMessage(user.status, newStatus, userName)}
            </p>
            <p className="text-sm text-muted-foreground">
              {getStatusDescription(newStatus)}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isUpdating}
            className={isDestructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              `Update to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};