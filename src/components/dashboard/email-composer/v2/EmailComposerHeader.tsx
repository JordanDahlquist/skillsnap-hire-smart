
import { X, Users, Mail, Check, Loader2 } from 'lucide-react';
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
    compose: { label: 'Compose Email', icon: Mail, color: 'bg-blue-500' },
    preview: { label: 'Preview & Send', icon: Users, color: 'bg-purple-500' },
    sending: { label: 'Sending...', icon: Loader2, color: 'bg-green-500' }
  };

  const currentConfig = stepConfig[currentStep];
  const IconComponent = currentConfig.icon;

  return (
    <div className="relative">
      {/* Header background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 via-purple-600/80 to-pink-600/80" />
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
      
      <div className="relative px-8 py-6 flex items-center justify-between">
        {/* Left side - Step indicator */}
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${currentConfig.color} shadow-lg`}>
            <IconComponent className={`w-6 h-6 text-white ${currentStep === 'sending' ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{currentConfig.label}</h2>
            <p className="text-white/80 text-sm">
              {currentStep === 'sending' 
                ? `Sending to ${recipientCount} recipient${recipientCount > 1 ? 's' : ''}...`
                : `Composing email for ${recipientCount} recipient${recipientCount > 1 ? 's' : ''}`
              }
            </p>
          </div>
        </div>

        {/* Right side - Recipients badge and close */}
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-white/20 text-white border-0 px-4 py-2 text-sm font-medium">
            <Users className="w-4 h-4 mr-2" />
            {recipientCount} Recipients
          </Badge>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="text-white hover:bg-white/10 rounded-xl p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Progress indicators */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div 
          className="h-full bg-white transition-all duration-500 ease-out"
          style={{ 
            width: currentStep === 'compose' ? '33%' : 
                   currentStep === 'preview' ? '66%' : '100%' 
          }}
        />
      </div>
    </div>
  );
};
