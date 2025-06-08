
import { Button } from "@/components/ui/button";
import { ThumbsDown, RotateCcw, Mail, UserCheck } from "lucide-react";

interface ApplicationActionButtonsProps {
  status: string;
  isUpdating: boolean;
  onReject: () => void;
  onUnreject: () => void;
  onEmail: () => void;
}

export const ApplicationActionButtons = ({
  status,
  isUpdating,
  onReject,
  onUnreject,
  onEmail
}: ApplicationActionButtonsProps) => {
  return (
    <div className="flex gap-2">
      {status === 'rejected' ? (
        <Button 
          size="sm" 
          variant="outline"
          onClick={onUnreject}
          disabled={isUpdating}
          className="border-green-200 text-green-600 hover:bg-green-50"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Unreject
        </Button>
      ) : (
        <Button 
          size="sm" 
          variant="outline"
          onClick={onReject}
          disabled={isUpdating}
          className="border-red-200 text-red-600 hover:bg-red-50"
        >
          <ThumbsDown className="w-4 h-4 mr-2" />
          Reject
        </Button>
      )}
      <Button 
        size="sm" 
        onClick={onEmail}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <Mail className="w-4 h-4 mr-2" />
        Email
      </Button>
      <Button 
        size="sm" 
        disabled={true}
        className="bg-green-600 hover:bg-green-700 opacity-50 cursor-not-allowed"
      >
        <UserCheck className="w-4 h-4 mr-2" />
        Hire (Coming Soon)
      </Button>
    </div>
  );
};
