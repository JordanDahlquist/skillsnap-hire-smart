
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useAdminRole = () => {
  const { user } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user?.id) {
        console.log('useAdminRole: No user ID, setting admin to false');
        setIsSuperAdmin(false);
        setIsLoading(false);
        return;
      }

      console.log('useAdminRole: Checking admin role for user:', user.id);

      try {
        // Use the security definer function to check super admin role
        const { data, error } = await supabase
          .rpc('is_super_admin', { _user_id: user.id });

        if (error) {
          console.error('useAdminRole: Error checking admin role:', error);
          setIsSuperAdmin(false);
        } else {
          console.log('useAdminRole: Admin role check result:', data);
          setIsSuperAdmin(!!data);
          if (data) {
            console.log('useAdminRole: User is confirmed super admin');
          }
        }
      } catch (error) {
        console.error('useAdminRole: Exception checking admin role:', error);
        setIsSuperAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminRole();
  }, [user?.id]);

  console.log('useAdminRole: Current state - isSuperAdmin:', isSuperAdmin, 'isLoading:', isLoading);

  return { isSuperAdmin, isLoading };
};
