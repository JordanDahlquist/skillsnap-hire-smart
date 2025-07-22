
import { DatabaseApplication, DatabaseJob, ApplicationStatusCounts } from "./supabase";

// Extend Supabase types with UI-specific computed properties
export interface Job extends DatabaseJob {
  applications?: { count: number }[];
  applicationStatusCounts?: ApplicationStatusCounts;
  needsReview?: boolean;
}

export interface Application extends DatabaseApplication {
  // All properties come from DatabaseApplication, no additional fields needed
  // The skills_test_responses field is already Json type from Supabase
  // Map database fields to expected property names
  stage?: string; // maps to pipeline_stage
  additional_questions?: Record<string, any>; // for backwards compatibility
}

export interface Profile {
  id: string;
  full_name: string | null;
  company_name: string;
  email: string | null;
  unique_email: string;
  industry: string | null;
  default_location: string | null;
  company_website: string | null;
  profile_picture_url: string | null;
  phone: string | null;
  job_title: string | null;
  created_at: string;
  updated_at: string;
  last_regeneration_date: string | null;
  daily_briefing_regenerations: number | null;
}
