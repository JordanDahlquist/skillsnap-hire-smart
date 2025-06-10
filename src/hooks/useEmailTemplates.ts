
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedAuth } from './useOptimizedAuth';
import type { EmailTemplate } from '@/types/emailComposer';

export const useEmailTemplates = (isOpen: boolean) => {
  const { user } = useOptimizedAuth();

  return useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as EmailTemplate[];
    },
    enabled: !!user && isOpen,
  });
};
