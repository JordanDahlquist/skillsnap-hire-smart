
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface Invitation {
  id: string;
  organization_id: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    full_name: string | null;
    email: string | null;
  };
}

export const useOrganizationMembers = (organizationId: string | undefined) => {
  return useQuery({
    queryKey: ['organization-members', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      
      const { data, error } = await supabase
        .from('organization_memberships')
        .select(`
          *,
          profiles (
            id,
            full_name,
            email
          )
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as OrganizationMember[];
    },
    enabled: !!organizationId,
  });
};

export const useInvitations = (organizationId: string | undefined) => {
  return useQuery({
    queryKey: ['invitations', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('organization_id', organizationId)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Invitation[];
    },
    enabled: !!organizationId,
  });
};

export const useSendInvitation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      organizationId, 
      email, 
      role 
    }: { 
      organizationId: string; 
      email: string; 
      role: 'admin' | 'editor' | 'viewer';
    }) => {
      if (!user?.id) {
        throw new Error('User must be logged in to send invitations');
      }

      // Generate a secure random token
      const token = crypto.randomUUID();
      
      const { data, error } = await supabase
        .from('invitations')
        .insert({
          organization_id: organizationId,
          email: email.toLowerCase(),
          role,
          invited_by: user.id,
          token,
        })
        .select()
        .single();

      if (error) throw error;
      
      // TODO: Send invitation email
      // For now, we'll just create the invitation record
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast({
        title: "Invitation sent",
        description: "The invitation has been sent successfully.",
      });
    },
    onError: (error: any) => {
      let message = "Failed to send invitation. Please try again.";
      if (error.code === '23505') {
        message = "This email has already been invited to this organization.";
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      membershipId, 
      role 
    }: { 
      membershipId: string; 
      role: 'admin' | 'editor' | 'viewer';
    }) => {
      const { data, error } = await supabase
        .from('organization_memberships')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', membershipId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-members'] });
      toast({
        title: "Role updated",
        description: "Member role has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update member role. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (membershipId: string) => {
      const { error } = await supabase
        .from('organization_memberships')
        .delete()
        .eq('id', membershipId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-members'] });
      toast({
        title: "Member removed",
        description: "Team member has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove team member. Please try again.",
        variant: "destructive",
      });
    },
  });
};
