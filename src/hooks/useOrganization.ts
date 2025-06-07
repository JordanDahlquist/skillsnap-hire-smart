
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { authService } from "@/services/authService";
import { useToast } from "@/components/ui/use-toast";
import { OrganizationMembership, Organization } from "@/types";
import { useLogger } from "./useLogger";

export const useOrganizationMembership = (userId: string | undefined) => {
  const { logDebug, logError, logInfo, logWarn } = useLogger('useOrganizationMembership');
  const [organizationMembership, setOrganizationMembership] = useState<OrganizationMembership | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrganizationMembership = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      logDebug('Loading organization membership for user:', id);
      const response = await authService.fetchOrganizationMembership(id);
      
      if (response?.data) {
        setOrganizationMembership(response.data as OrganizationMembership);
        logInfo('Organization membership loaded successfully:', response.data.role || 'No role');
      } else {
        logWarn('No organization membership found for user');
        setOrganizationMembership(null);
        setError('No organization found. You may need to be invited to an organization.');
      }
    } catch (error) {
      logError('Failed to load organization membership:', error);
      setOrganizationMembership(null);
      setError('Failed to load organization information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadOrganizationMembership(userId);
    } else {
      setOrganizationMembership(null);
      setLoading(false);
      setError(null);
    }
  }, [userId]);

  const refreshOrganization = () => {
    if (userId) {
      loadOrganizationMembership(userId);
    }
  };

  return {
    organizationMembership,
    loading,
    error,
    refreshOrganization
  };
};

export const useCurrentOrganization = () => {
  const { logDebug, logError } = useLogger('useCurrentOrganization');
  
  // Get organization membership from auth hook
  const { data: authData } = useQuery({
    queryKey: ['auth-data'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return null;
      
      const response = await authService.fetchOrganizationMembership(session.user.id);
      return response?.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  return useQuery({
    queryKey: ['organization', authData?.organization_id],
    queryFn: async () => {
      if (!authData?.organization_id) {
        logDebug('No organization ID available');
        return null;
      }
      
      logDebug('Fetching organization details for:', authData.organization_id);
      
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', authData.organization_id)
        .single();
      
      if (error) {
        logError('Error fetching organization:', error);
        throw error;
      }
      
      logDebug('Organization details loaded successfully');
      return data as Organization;
    },
    enabled: !!authData?.organization_id,
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { logDebug, logError } = useLogger('useUpdateOrganization');

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Organization> }) => {
      logDebug('Updating organization:', id, updates);
      
      const { data, error } = await supabase
        .from('organizations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logError('Failed to update organization:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      queryClient.invalidateQueries({ queryKey: ['auth-data'] });
      toast({
        title: "Organization updated",
        description: "Organization settings have been saved successfully.",
      });
    },
    onError: (error) => {
      logError('Organization update failed:', error);
      toast({
        title: "Error",
        description: "Failed to update organization. Please try again.",
        variant: "destructive",
      });
    },
  });
};
