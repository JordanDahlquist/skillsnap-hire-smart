export interface Job {
  id: string;
  title: string;
  description: string;
  ai_mini_description?: string | null;
  role_type: string;
  experience_level: string;
  location_type?: string | null;
  country?: string | null;
  state?: string | null;
  region?: string | null;
  city?: string | null;
  budget?: string | null;
  duration?: string | null;
  created_at: string;
  updated_at: string;
  status: string;
  user_id: string;
  view_count?: number;
  required_skills: string;
  employment_type: string;
  company_name?: string | null;
  generated_job_post?: string | null;
  generated_test?: string | null;
  applications?: { count: number }[];
  applicationStatusCounts?: {
    pending?: number;
    approved?: number;
    rejected?: number;
  };
}

export interface Application {
  id: string;
  job_id: string;
  name: string;
  email: string;
  portfolio: string | null;
  resume_file_path: string | null;
  cover_letter: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  pipeline_stage: string | null;
  rejection_reason: string | null;
  location: string | null;
  phone: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  available_start_date: string | null;
  ai_rating: number | null;
  parsed_resume_data: any;
  work_experience: any;
  education: any;
  skills: any;
  manual_rating: number | null;
  ai_summary: string | null;
  answer_1: string | null;
  answer_2: string | null;
  answer_3: string | null;
  experience: string | null;
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
