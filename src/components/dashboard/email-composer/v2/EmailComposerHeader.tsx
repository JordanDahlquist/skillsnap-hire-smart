
import { X, Users, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  const stepConfig = {
    compose: { label: 'Compose Email', icon: Mail },
    preview: { label: 'Preview & Send', icon: Users },
    sending: { label: 'Sending...', icon: Loader2 }
  };

  const currentConfig = stepConfig[currentStep];
  const IconComponent = currentConfig.icon;

  return (
    <div className="flex-shrink-0 glass-content border-b border-white/20">
      <div className="flex items-center justify-between p-4">
        {/* Left - Title and step */}
        <div className="flex items-center gap-3">
          <div className="p-2 glass-button rounded-lg">
            <IconComponent className={`w-5 h-5 text-blue-600 ${currentStep === 'sending' ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-contrast-safe">{currentConfig.label}</h2>
            <p className="text-contrast-safe-light text-sm">
              {currentStep === 'sending' 
                ? `Sending to ${recipientCount} recipient${recipientCount > 1 ? 's' : ''}...`
                : `Email campaign for ${recipientCount} recipient${recipientCount > 1 ? 's' : ''}`
              }
            </p>
          </div>
        </div>

        {/* Right - Recipients count and close */}
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="glass-button border-0 text-blue-600">
            {recipientCount}
          </Badge>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="glass-button hover:bg-white/20 h-8 w-8 p-0 text-gray-600 hover:text-gray-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
