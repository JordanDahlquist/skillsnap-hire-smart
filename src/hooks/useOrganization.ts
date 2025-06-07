
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { authService } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

interface OrganizationMembership {
  id: string;
  organization_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  organization: {
    id: string;
    name: string;
    slug: string | null;
  };
}

interface Organization {
  id: string;
  name: string;
  slug: string | null;
  created_at: string;
  updated_at: string;
}

export const useOrganizationMembership = (userId: string | undefined) => {
  const [organizationMembership, setOrganizationMembership] = useState<OrganizationMembership | null>(null);
  const [loading, setLoading] = useState(false);

  const loadOrganizationMembership = async (id: string) => {
    setLoading(true);
    try {
      const membershipData = await authService.fetchOrganizationMembership(id);
      setOrganizationMembership(membershipData as OrganizationMembership);
      console.log('Organization membership loaded:', (membershipData as OrganizationMembership)?.role || 'No membership');
    } catch (error) {
      console.warn('Failed to load organization membership:', error);
      setOrganizationMembership(null);
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
    refreshOrganization
  };
};

export const useCurrentOrganization = () => {
  const { organizationMembership } = useAuth();
  
  return useQuery({
    queryKey: ['organization', organizationMembership?.organization_id],
    queryFn: async () => {
      if (!organizationMembership?.organization_id) return null;
      
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationMembership.organization_id)
        .single();
      
      if (error) throw error;
      return data as Organization;
    },
    enabled: !!organizationMembership?.organization_id,
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Organization> }) => {
      const { data, error } = await supabase
        .from('organizations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      toast({
        title: "Organization updated",
        description: "Organization settings have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update organization. Please try again.",
        variant: "destructive",
      });
    },
  });
};
