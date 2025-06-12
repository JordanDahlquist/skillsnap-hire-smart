
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/types";
import { DASHBOARD_ACTION_CONSTANTS } from "@/constants/dashboardActions";

export interface StatusUpdateError {
  code?: string;
  message: string;
  needsRefresh?: boolean;
}

export class JobStatusService {
  static async validateUser(): Promise<{ user: any; error?: StatusUpdateError }> {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return { user: null, error: { message: 'Authentication error: Unable to verify session' } };
    }

    if (!session?.user) {
      console.error('No authenticated user found');
      return { user: null, error: { message: 'You must be logged in to update job status' } };
    }

    return { user: session.user };
  }

  static validateJobOwnership(job: Job, userId: string): StatusUpdateError | null {
    if (job.user_id !== userId) {
      console.error('User does not own this job:', { jobUserId: job.user_id, currentUserId: userId });
      return { message: 'You can only update jobs that you own' };
    }
    return null;
  }

  static parseUpdateError(error: any): StatusUpdateError {
    const { ERROR_CODES } = DASHBOARD_ACTION_CONSTANTS;
    
    if (error.code === ERROR_CODES.NOT_FOUND) {
      return { message: 'Job not found or access denied' };
    } else if (error.message.includes(ERROR_CODES.RLS_VIOLATION)) {
      return { message: 'You do not have permission to update this job' };
    } else if (error.code === ERROR_CODES.PERMISSION_DENIED) {
      return { message: 'Insufficient permissions to update job status' };
    } else if (error.message.includes(ERROR_CODES.JWT_ERROR)) {
      return { message: 'Authentication token expired. Please refresh and try again.', needsRefresh: true };
    }
    
    return { message: `Update failed: ${error.message}` };
  }

  static async updateJobStatus(job: Job, newStatus: string): Promise<{ success: boolean; error?: StatusUpdateError }> {
    console.log('Status change initiated:', { jobId: job.id, from: job.status, to: newStatus });

    try {
      // Validate user authentication
      const { user, error: userError } = await this.validateUser();
      if (userError) {
        return { success: false, error: userError };
      }

      console.log('Authentication validated:', { userId: user.id, jobUserId: job.user_id });

      // Verify job ownership
      const ownershipError = this.validateJobOwnership(job, user.id);
      if (ownershipError) {
        return { success: false, error: ownershipError };
      }

      console.log('Attempting database update with enhanced error handling...');

      // Perform the status update
      const { data, error } = await supabase
        .from('jobs')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', job.id)
        .eq('user_id', user.id)
        .select();

      if (error) {
        console.error('Database update error:', error);
        return { success: false, error: this.parseUpdateError(error) };
      }

      if (!data || data.length === 0) {
        return { success: false, error: { message: 'No job was updated. Please check your permissions.' } };
      }

      console.log('Status update successful:', data);
      return { success: true };
    } catch (error) {
      console.error('Status update failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update job status';
      return { success: false, error: { message: errorMessage } };
    }
  }
}
