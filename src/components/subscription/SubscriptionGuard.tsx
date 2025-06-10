
import { ReactNode } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Crown, Lock } from "lucide-react";

interface SubscriptionGuardProps {
  children: ReactNode;
  feature: 'create_job' | 'create_application' | 'scout_ai';
  fallback?: ReactNode;
}

export const SubscriptionGuard = ({ children, feature, fallback }: SubscriptionGuardProps) => {
  const { hasActiveAccess, planLimits, subscription, canCreateJobs, canCreateApplications, loading } = useSubscription();
  const navigate = useNavigate();

  if (loading) {
    return <div>Loading...</div>;
  }

  // Check access based on feature
  let hasAccess = false;
  let limitMessage = "";

  switch (feature) {
    case 'create_job':
      hasAccess = hasActiveAccess && canCreateJobs;
      if (!canCreateJobs && planLimits) {
        limitMessage = `You've reached your limit of ${planLimits.max_jobs} jobs. Upgrade to create more.`;
      }
      break;
    case 'create_application':
      hasAccess = hasActiveAccess && canCreateApplications;
      if (!canCreateApplications && planLimits) {
        limitMessage = `You've reached your monthly limit of ${planLimits.max_applications} applications. Upgrade for more.`;
      }
      break;
    case 'scout_ai':
      hasAccess = hasActiveAccess && (planLimits?.has_scout_ai || false);
      if (!planLimits?.has_scout_ai) {
        limitMessage = "Scout AI is available on Professional and Enterprise plans.";
      }
      break;
  }

  if (!hasActiveAccess) {
    return fallback || (
      <Alert className="border-red-200 bg-red-50">
        <Lock className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <div className="flex items-center justify-between">
            <span>Your trial has expired. Upgrade to continue using this feature.</span>
            <Button 
              size="sm" 
              onClick={() => navigate('/pricing')}
              className="bg-red-600 hover:bg-red-700 text-white ml-4"
            >
              Upgrade Now
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (!hasAccess && limitMessage) {
    return fallback || (
      <Alert className="border-orange-200 bg-orange-50">
        <Crown className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <div className="flex items-center justify-between">
            <span>{limitMessage}</span>
            <Button 
              size="sm" 
              onClick={() => navigate('/pricing')}
              className="bg-orange-600 hover:bg-orange-700 text-white ml-4"
            >
              Upgrade Plan
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};
