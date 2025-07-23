import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { productionLogger } from "@/services/productionLoggerService";

export const useSessionRevocation = () => {
  const { user, signOut } = useAuth();
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const checkSessionRevocation = async () => {
      try {
        // First check user's current status
        const { data: profile } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', user.id)
          .single();

        // If user is active, don't check for revocations
        if (profile?.status === 'active') {
          return;
        }

        const { data, error } = await supabase
          .from('session_revocations')
          .select('revoked_at')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 is "not found", which is expected if no revocation exists
          productionLogger.error('Error checking session revocation', {
            component: 'useSessionRevocation',
            metadata: { error: error.message }
          });
          return;
        }

        if (data?.revoked_at) {
          const revokedAt = new Date(data.revoked_at);
          const now = new Date();
          
          // If session was revoked and it's recent (within last hour to handle timing issues)
          // and user is still inactive/deleted
          if (revokedAt <= now && 
              (now.getTime() - revokedAt.getTime()) < 60 * 60 * 1000 &&
              (profile?.status === 'inactive' || profile?.status === 'deleted')) {
            productionLogger.info('User session revoked, signing out', {
              component: 'useSessionRevocation',
              metadata: { userId: user.id, revokedAt: data.revoked_at, userStatus: profile?.status }
            });
            
            await signOut();
          }
        }
      } catch (error) {
        productionLogger.error('Error in session revocation check', {
          component: 'useSessionRevocation',
          metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
        });
      }
    };

    // Check immediately
    checkSessionRevocation();

    // Set up periodic check every 30 seconds
    checkIntervalRef.current = setInterval(checkSessionRevocation, 30000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [user?.id, signOut]);
};