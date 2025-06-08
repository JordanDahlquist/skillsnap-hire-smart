
import { ApplicationTrendsChart } from "./ApplicationTrendsChart";
import { PerformanceMetrics } from "./PerformanceMetrics";

interface Application {
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

interface Job {
  id: string;
  title: string;
  description: string;
  role_type: string;
  experience_level: string;
  required_skills: string;
  budget: string;
  duration: string;
  status: string;
  created_at: string;
}

interface DashboardAnalyticsProps {
  applications: Application[];
  job: Job;
}

export const DashboardAnalytics = ({ applications, job }: DashboardAnalyticsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <ApplicationTrendsChart applications={applications} />
      <PerformanceMetrics applications={applications} job={job} />
    </div>
  );
};
