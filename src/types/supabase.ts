
import { Database } from "@/integrations/supabase/types";

// Base Supabase types
export type DatabaseApplication = Database['public']['Tables']['applications']['Row'];
export type DatabaseJob = Database['public']['Tables']['jobs']['Row'];

// Skills test response structure
export interface SkillsTestResponse {
  question: string;
  answer: string;
  questionType?: string;
}

// Application status counts for UI
export interface ApplicationStatusCounts {
  pending?: number;
  approved?: number;
  rejected?: number;
}
