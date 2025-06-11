
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Mail, Check, Clock } from 'lucide-react';

interface SendingProgressProps {
  totalRecipients: number;
  currentRecipient: number;
  isComplete: boolean;
}

export const SendingProgress = ({
  totalRecipients,
  currentRecipient,
  isComplete
}: SendingProgressProps) => {
  const progress = (currentRecipient / totalRecipients) * 100;

  return (
    <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-0 shadow-xl">
      <CardContent className="p-12 text-center">
        <div className="max-w-md mx-auto space-y-8">
          {/* Animation */}
          <div className="relative">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl">
              {isComplete ? (
                <Check className="w-12 h-12 text-white" />
              ) : (
                <Mail className="w-12 h-12 text-white animate-pulse" />
              )}
            </div>
            {!isComplete && (
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin absolute -bottom-2 -right-2 bg-white rounded-full p-1" />
            )}
          </div>

          {/* Status */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {isComplete ? 'Emails Sent Successfully!' : 'Sending Emails...'}
            </h3>
            <p className="text-gray-600">
              {isComplete 
                ? `All ${totalRecipients} emails have been sent successfully`
                : `Sending to ${totalRecipients} recipients`
              }
            </p>
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{currentRecipient} sent</span>
              <span>{totalRecipients - currentRecipient} remaining</span>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-green-600">
              <Check className="w-4 h-4" />
              <span>{currentRecipient} Sent</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{totalRecipients - currentRecipient} Pending</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
