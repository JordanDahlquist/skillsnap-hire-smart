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

export const exportApplicationsToCSV = (applications: any[], jobTitle: string) => {
  const headers = [
    'Name',
    'Email',
    'Status',
    'Manual Rating',
    'AI Rating',
    'Pipeline Stage',
    'Applied Date',
    'Experience',
    'Location',
    'Phone'
  ];

  const csvContent = [
    headers.join(','),
    ...applications.map(app => [
      `"${app.name || ''}"`,
      `"${app.email || ''}"`,
      `"${app.status || ''}"`,
      app.manual_rating || '',
      app.ai_rating || '',
      `"${app.pipeline_stage || 'applied'}"`,
      app.created_at ? new Date(app.created_at).toLocaleDateString() : '',
      `"${app.experience || ''}"`,
      `"${app.location || ''}"`,
      `"${app.phone || ''}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${jobTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_applications.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
