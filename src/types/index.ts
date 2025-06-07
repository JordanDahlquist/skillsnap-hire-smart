
export interface OrganizationMembership {
  id: string;
  organization_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  organization: {
    id: string;
    name: string;
    slug: string | null;
  };
}

export interface Organization {
  id: string;
  name: string;
  slug: string | null;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  name: string;
  email: string;
  portfolio: string | null;
  created_at: string;
  ai_rating: number | null;
  ai_summary: string | null;
  status: string;
  experience: string | null;
  answer_1: string | null;
  answer_2: string | null;
  answer_3: string | null;
  manual_rating: number | null;
  rejection_reason: string | null;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  role_type: string;
  employment_type: string;
  experience_level: string;
  budget: string;
  duration: string;
  status: string;
  created_at: string;
  updated_at: string;
  ai_mini_description?: string;
  applications?: { count: number }[];
  applicationStatusCounts?: {
    pending: number;
    approved: number;
    rejected: number;
  };
  location_type?: string;
  country?: string;
  state?: string;
  region?: string;
  city?: string;
  required_skills?: string;
  user_id: string;
  organization_id: string;
}

export interface JobFilters {
  employmentType: string;
  locationType: string;
  experienceLevel: string;
  country: string;
  state: string;
  budgetRange: number[];
  duration: string;
}

export interface AvailableOptions {
  employmentTypes: string[];
  locationTypes: string[];
  experienceLevels: string[];
  countries: string[];
  states: string[];
  durations: string[];
}
