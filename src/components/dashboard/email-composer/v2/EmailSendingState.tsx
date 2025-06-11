
import { SendingProgress } from './SendingProgress';

interface EmailSendingStateProps {
  totalRecipients: number;
}

export const EmailSendingState = ({ totalRecipients }: EmailSendingStateProps) => {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <SendingProgress 
        totalRecipients={totalRecipients}
        currentRecipient={0}
        isComplete={false}
      />
    </div>
  );
};
