
import { AlertCircle, Crown, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const TrialBanner = () => {
  const { subscription, isTrialActive, trialDaysRemaining, hasActiveAccess } = useSubscription();
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  // Don't show banner for new signups - hide it completely
  return null;

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  return (
    <Alert className="border-orange-200 bg-orange-50 relative" data-trial-banner>
      <Crown className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800 pr-8">
        <div className="flex items-center justify-between">
          <span>
            {trialDaysRemaining > 0 
              ? `${trialDaysRemaining} day${trialDaysRemaining === 1 ? '' : 's'} left in your free trial.`
              : 'Your free trial has expired.'
            } Upgrade now to continue using all features.
          </span>
          <Button 
            size="sm" 
            onClick={handleUpgrade}
            className="bg-orange-600 hover:bg-orange-700 text-white ml-4"
          >
            Upgrade Now
          </Button>
        </div>
      </AlertDescription>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-2 h-6 w-6 p-0 text-orange-600 hover:text-orange-800"
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
};
