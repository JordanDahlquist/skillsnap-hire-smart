
interface ExportableJob {
  title: string;
  status: string;
  applications?: { count: number }[];
  created_at: string;
  role_type: string;
  experience_level: string;
  location_type?: string;
}

interface ExportableApplication {
  name: string;
  email: string;
  created_at: string;
  ai_rating: number | null;
  status: string;
}

export const exportJobsToCSV = (jobs: ExportableJob[], filename: string = 'jobs-export.csv'): void => {
  const csvContent = [
    ['Title', 'Status', 'Applications', 'Created', 'Type', 'Experience', 'Location'].join(','),
    ...jobs.map(job => [
      job.title,
      job.status,
      job.applications?.[0]?.count || 0,
      new Date(job.created_at).toLocaleDateString(),
      job.role_type,
      job.experience_level,
      job.location_type || 'Not specified'
    ].join(','))
  ].join('\n');

  downloadCSV(csvContent, filename);
};

export const exportApplicationsToCSV = (applications: ExportableApplication[], jobTitle: string): void => {
  const csvContent = [
    ['Name', 'Email', 'Applied Date', 'AI Rating', 'Status'].join(','),
    ...applications.map(app => [
      app.name,
      app.email,
      new Date(app.created_at).toLocaleDateString(),
      app.ai_rating || 'N/A',
      app.status
    ].join(','))
  ].join('\n');

  const filename = `${jobTitle.replace(/[^a-zA-Z0-9]/g, '_')}_applications.csv`;
  downloadCSV(csvContent, filename);
};

const downloadCSV = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};
