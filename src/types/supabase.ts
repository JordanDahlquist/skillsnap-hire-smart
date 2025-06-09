
import { Database } from "@/integrations/supabase/types";

// Base Supabase types
export type DatabaseApplication = Database['public']['Tables']['applications']['Row'];
export type DatabaseJob = Database['public']['Tables']['jobs']['Row'];

// Skills test response structure - compatible with Json type
export interface SkillsTestResponse {
  question: string;
  answer: string;
  questionType?: string;
  [key: string]: any; // Index signature to make it compatible with Json type
}

// Application status counts for UI
export interface ApplicationStatusCounts {
  pending?: number;
  approved?: number;
  rejected?: number;
}
