
import { X, Mail, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmailComposerHeaderProps {
  currentStep: 'compose' | 'preview' | 'sending';
  recipientCount: number;
  onClose: () => void;
  isLoading: boolean;
}

export const EmailComposerHeader = ({
  currentStep,
  recipientCount,
  onClose,
  isLoading
}: EmailComposerHeaderProps) => {
  const getHeaderInfo = () => {
    switch (currentStep) {
      case 'sending':
        return {
          title: 'Sending Emails...',
          subtitle: `Sending to ${recipientCount} recipient${recipientCount > 1 ? 's' : ''}`,
          icon: Loader2,
          animate: true
        };
      default:
        return {
          title: 'Compose Email',
          subtitle: `${recipientCount} recipient${recipientCount > 1 ? 's' : ''} selected`,
          icon: Mail,
          animate: false
        };
    }
  };

  const { title, subtitle, icon: Icon, animate } = getHeaderInfo();

  return (
    <div className="flex-shrink-0 bg-blue-600 text-white p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${animate ? 'animate-spin' : ''}`} />
          <div>
            <h2 className="text-sm font-semibold">{title}</h2>
            <p className="text-xs text-white/80">{subtitle}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={isLoading}
          className="text-white hover:bg-white/10 h-6 w-6 p-0"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};
