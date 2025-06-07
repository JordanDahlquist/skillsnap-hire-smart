
import { supabase } from "@/integrations/supabase/client";
import { apiClient } from "./apiClient";
import { logger } from "./loggerService";

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

export const invitationService = {
  async sendInvitation(organizationId: string, email: string, role: 'admin' | 'editor' | 'viewer', invitedBy: string) {
    return apiClient.mutate(async () => {
      logger.debug('Sending invitation:', { organizationId, email, role });
      
      // Generate a secure random token
      const token = crypto.randomUUID();
      
      // Create invitation record
      const { data: invitation, error: inviteError } = await supabase
        .from('invitations')
        .insert({
          organization_id: organizationId,
          email: email.toLowerCase(),
          role,
          invited_by: invitedBy,
          token,
        })
        .select()
        .single();

      if (inviteError) throw inviteError;

      // Send invitation email via edge function
      try {
        const { error: emailError } = await supabase.functions.invoke('send-invitation-email', {
          body: {
            email: email.toLowerCase(),
            invitationToken: token,
            organizationId,
            role
          }
        });

        if (emailError) {
          logger.warn('Failed to send invitation email:', emailError);
          // Don't throw here - invitation is created, email is optional
        } else {
          logger.info('Invitation email sent successfully');
        }
      } catch (error) {
        logger.warn('Error sending invitation email:', error);
        // Continue - invitation is still valid even without email
      }

      return { data: invitation, error: null };
    });
  },

  async acceptInvitation(token: string, userId: string) {
    return apiClient.mutate(async () => {
      logger.debug('Accepting invitation with token:', token);
      
      // Find the invitation
      const { data: invitation, error: findError } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (findError || !invitation) {
        throw new Error('Invalid or expired invitation');
      }

      // Create membership - this now works with the new RLS policies
      const { error: membershipError } = await supabase
        .from('organization_memberships')
        .insert({
          organization_id: invitation.organization_id,
          user_id: userId,
          role: invitation.role
        });

      if (membershipError) {
        logger.error('Failed to create membership:', membershipError);
        throw membershipError;
      }

      // Mark invitation as accepted
      const { error: updateError } = await supabase
        .from('invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invitation.id);

      if (updateError) {
        logger.error('Failed to mark invitation as accepted:', updateError);
        throw updateError;
      }

      logger.info('Invitation accepted successfully');
      return { data: invitation, error: null };
    });
  }
};
