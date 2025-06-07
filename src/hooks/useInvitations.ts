
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { invitationService, type Invitation } from "@/services/invitationService";
import { logger } from "@/services/loggerService";

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
      
      logger.debug('Fetching organization members for:', organizationId);
      
      // First get the memberships
      const { data: memberships, error: membershipsError } = await supabase
        .from('organization_memberships')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: true });
      
      if (membershipsError) throw membershipsError;
      if (!memberships || memberships.length === 0) return [];

      // Get user IDs from memberships
      const userIds = memberships.map(m => m.user_id);
      
      // Get profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;

      // Combine the data
      const result = memberships.map(membership => ({
        ...membership,
        profiles: profiles?.find(profile => profile.id === membership.user_id) || null
      }));
      
      logger.debug('Fetched organization members:', result.length);
      return result as OrganizationMember[];
    },
    enabled: !!organizationId,
  });
};

export const useInvitations = (organizationId: string | undefined) => {
  return useQuery({
    queryKey: ['invitations', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      
      logger.debug('Fetching invitations for organization:', organizationId);
      
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('organization_id', organizationId)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      logger.debug('Fetched invitations:', data?.length || 0);
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

      return await invitationService.sendInvitation(organizationId, email, role, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast({
        title: "Invitation sent",
        description: "The invitation has been sent successfully.",
      });
    },
    onError: (error: any) => {
      logger.error('Failed to send invitation:', error);
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
      logger.debug('Updating member role:', { membershipId, role });
      
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
    onError: (error) => {
      logger.error('Failed to update member role:', error);
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
      logger.debug('Removing member:', membershipId);
      
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
    onError: (error) => {
      logger.error('Failed to remove team member:', error);
      toast({
        title: "Error",
        description: "Failed to remove team member. Please try again.",
        variant: "destructive",
      });
    },
  });
};
