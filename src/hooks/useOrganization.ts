
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

export interface Organization {
  id: string;
  name: string;
  slug: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMembership {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  created_at: string;
  updated_at: string;
  organization?: Organization;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

export const useOrganizations = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['organizations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        const { data, error } = await supabase
          .from('organization_memberships')
          .select(`
            *,
            organization:organizations(*)
          `)
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error fetching organizations:', error);
          return [];
        }
        
        return data || [];
      } catch (error) {
        console.error('Exception fetching organizations:', error);
        return [];
      }
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 30000,
  });
};

export const useCurrentOrganization = () => {
  const { organizationMembership } = useAuth();
  
  return useQuery({
    queryKey: ['current-organization', organizationMembership?.organization_id],
    queryFn: async () => {
      if (!organizationMembership?.organization_id) return null;
      
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', organizationMembership.organization_id)
          .single();
        
        if (error) {
          console.error('Error fetching current organization:', error);
          return null;
        }
        
        return data as Organization;
      } catch (error) {
        console.error('Exception fetching current organization:', error);
        return null;
      }
    },
    enabled: !!organizationMembership?.organization_id,
    retry: 2,
    staleTime: 30000,
  });
};

export const useOrganizationMembers = (organizationId: string | undefined) => {
  return useQuery({
    queryKey: ['organization-members', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      
      try {
        const { data, error } = await supabase
          .from('organization_memberships')
          .select(`
            *,
            profiles!inner(full_name, email)
          `)
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error('Error fetching organization members:', error);
          return [];
        }
        
        return data || [];
      } catch (error) {
        console.error('Exception fetching organization members:', error);
        return [];
      }
    },
    enabled: !!organizationId,
    retry: 2,
    staleTime: 30000,
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
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['current-organization'] });
      toast({
        title: "Organization updated",
        description: "Organization details have been saved successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating organization:', error);
      toast({
        title: "Error",
        description: "Failed to update organization. Please try again.",
        variant: "destructive",
      });
    },
  });
};
