
import { Application, Job } from "@/types";

export class ExportService {
  static generateCSVContent(applications: Application[]): string {
    // Full-field export: include every available application column
    const fields = [
      // Core identifiers and timestamps
      'id','job_id','created_at','updated_at','transcript_last_processed_at','available_start_date',
      // Person & contact
      'name','email','phone','location',
      // Status & pipeline
      'status','pipeline_stage','previous_pipeline_stage','rejection_reason','transcript_processing_status',
      // Ratings & AI
      'manual_rating','ai_rating','ai_summary','resume_summary',
      // Links & portfolio
      'portfolio','portfolio_url','linkedin_url','github_url','resume_file_path','interview_video_url',
      // Answers & experience
      'experience','answer_1','answer_2','answer_3','cover_letter',
      // JSON-rich fields
      'parsed_resume_data','work_experience','education','skills',
      'skills_test_responses','interview_video_responses','skills_video_transcripts','interview_video_transcripts',
    ];

    const escapeCSV = (value: string): string => {
      // Wrap in quotes and escape internal quotes
      const safe = (value ?? '').replace(/"/g, '""');
      return `"${safe}"`;
    };

    const formatValue = (val: unknown): string => {
      if (val === null || val === undefined) return '';
      // Dates: prefer ISO for robustness
      if (val instanceof Date) return val.toISOString();
      // Numbers/booleans
      if (typeof val === 'number' || typeof val === 'boolean') return String(val);
      // Objects/arrays -> JSON
      if (typeof val === 'object') {
        try { return JSON.stringify(val as any); } catch { return String(val); }
      }
      // Strings (may contain commas/newlines)
      return String(val);
    };

    const headers = fields.map(f => f).join(',');
    const rows = applications.map((app) =>
      fields
        .map((key) => escapeCSV(formatValue((app as any)[key])))
        .join(',')
    );

    return [headers, ...rows].join('\n');
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
