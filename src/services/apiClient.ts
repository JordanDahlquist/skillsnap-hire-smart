
import { supabase } from "@/integrations/supabase/client";
import { logger } from "./loggerService";

export class ApiError extends Error {
  constructor(message: string, public status?: number, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiClient = {
  async query<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>
  ): Promise<T> {
    const { data, error } = await queryFn();
    
    if (error) {
      logger.error('API Error:', error);
      throw new ApiError(error.message, error.status, error.code);
    }
    
    if (!data) {
      throw new ApiError('No data returned');
    }
    
    return data;
  },

  async mutate<T>(
    mutateFn: () => Promise<{ data: T | null; error: any }>
  ): Promise<T> {
    const { data, error } = await mutateFn();
    
    if (error) {
      logger.error('API Error:', error);
      throw new ApiError(error.message, error.status, error.code);
    }
    
    return data as T;
  }
};
