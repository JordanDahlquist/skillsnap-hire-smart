
import { supabase } from "@/integrations/supabase/client";
import { apiClient } from "./apiClient";
import { logger } from "./loggerService";
import { Organization } from "@/types";

export const organizationService = {
  async fetchOrganization(organizationId: string): Promise<Organization> {
    return apiClient.query(async () => {
      logger.debug('Fetching organization:', organizationId);
      
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();

      if (error) {
        throw error;
      }
      
      return { data, error: null };
    });
  },

  async updateOrganization(organizationId: string, updates: Partial<Organization>) {
    return apiClient.mutate(async () => {
      logger.debug('Updating organization:', organizationId, updates);
      return await supabase
        .from('organizations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', organizationId)
        .select()
        .single();
    });
  }
};
