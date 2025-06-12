
import { Application, Job } from "@/types";

export class ExportService {
  static generateCSVContent(applications: Application[]): string {
    const headers = ['Name', 'Email', 'Applied Date', 'AI Rating', 'Status'];
    const rows = applications.map(app => [
      app.name,
      app.email,
      new Date(app.created_at).toLocaleDateString(),
      app.ai_rating || 'N/A',
      app.status
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  static downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  static exportApplicationsToCSV(job: Job, applications: Application[]): void {
    const csvContent = this.generateCSVContent(applications);
    const filename = `${job.title.replace(/[^a-zA-Z0-9]/g, '_')}_applications.csv`;
    this.downloadCSV(csvContent, filename);
  }

  static async copyJobLinkToClipboard(jobId: string): Promise<void> {
    const jobUrl = `${window.location.origin}/apply/${jobId}`;
    await navigator.clipboard.writeText(jobUrl);
  }
}
