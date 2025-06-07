
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Job } from '@/hooks/useJobs';
import { HiringMetrics, PipelineData, TrendData, JobPerformance } from '@/hooks/useHiringAnalytics';

interface ReportData {
  metrics: HiringMetrics;
  pipelineData: PipelineData;
  trendData: TrendData[];
  jobPerformanceData: JobPerformance[];
  jobs: Job[];
  userDisplayName: string;
}

export const generatePDFReport = async (data: ReportData): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let currentY = 20;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredHeight: number) => {
    if (currentY + requiredHeight > pageHeight - 20) {
      pdf.addPage();
      currentY = 20;
    }
  };

  // Helper function to add text with word wrap
  const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return lines.length * (fontSize * 0.5);
  };

  // Title
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Hiring Analytics Report', 20, currentY);
  currentY += 15;

  // Date and user info
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const today = new Date().toLocaleDateString();
  pdf.text(`Generated on: ${today}`, 20, currentY);
  currentY += 8;
  pdf.text(`Report for: ${data.userDisplayName}`, 20, currentY);
  currentY += 20;

  // Executive Summary
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Executive Summary', 20, currentY);
  currentY += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const summaryMetrics = [
    `Total Jobs: ${data.metrics.totalJobs}`,
    `Total Applications: ${data.metrics.totalApplications}`,
    `Approval Rate: ${data.metrics.approvalRate.toFixed(1)}%`,
    `Average Rating: ${data.metrics.avgRating.toFixed(1)}/5`,
    `Applications This Week: ${data.metrics.applicationsThisWeek}`,
    `Applications This Month: ${data.metrics.applicationsThisMonth}`
  ];

  summaryMetrics.forEach((metric, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    pdf.text(metric, 20 + (col * 90), currentY + (row * 8));
  });

  currentY += Math.ceil(summaryMetrics.length / 2) * 8 + 15;

  // Pipeline Status
  checkPageBreak(40);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Application Pipeline', 20, currentY);
  currentY += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const pipelineMetrics = [
    `Pending Review: ${data.pipelineData.pending}`,
    `Approved: ${data.pipelineData.approved}`,
    `Rejected: ${data.pipelineData.rejected}`,
    `Total Applications: ${data.pipelineData.totalApplications}`
  ];

  pipelineMetrics.forEach((metric, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    pdf.text(metric, 20 + (col * 90), currentY + (row * 8));
  });

  currentY += Math.ceil(pipelineMetrics.length / 2) * 8 + 20;

  // Job Performance Table
  checkPageBreak(60);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Top Performing Jobs', 20, currentY);
  currentY += 15;

  // Table headers
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Job Title', 20, currentY);
  pdf.text('Applications', 80, currentY);
  pdf.text('Approval Rate', 120, currentY);
  pdf.text('Avg Rating', 160, currentY);
  currentY += 8;

  // Table data
  pdf.setFont('helvetica', 'normal');
  const topJobs = data.jobPerformanceData.slice(0, 10);
  
  topJobs.forEach((job) => {
    checkPageBreak(8);
    const titleLines = pdf.splitTextToSize(job.jobTitle, 55);
    pdf.text(titleLines[0], 20, currentY);
    pdf.text(job.applications.toString(), 80, currentY);
    pdf.text(`${job.approvalRate.toFixed(1)}%`, 120, currentY);
    pdf.text(job.avgRating.toFixed(1), 160, currentY);
    currentY += 8;
  });

  currentY += 15;

  // Job Listings Section
  checkPageBreak(40);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Active Job Listings', 20, currentY);
  currentY += 15;

  data.jobs.slice(0, 20).forEach((job) => {
    checkPageBreak(35);
    
    // Job title
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    const titleHeight = addText(job.title, 20, currentY, pageWidth - 40, 12);
    currentY += titleHeight + 3;

    // Job details
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    
    const details = [
      `Status: ${job.status}`,
      `Type: ${job.role_type}`,
      `Experience: ${job.experience_level}`,
      `Applications: ${job.applications?.[0]?.count || 0}`,
      `Pending: ${job.applicationStatusCounts?.pending || 0}`,
      `Approved: ${job.applicationStatusCounts?.approved || 0}`
    ];

    details.forEach((detail, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      pdf.text(detail, 20 + (col * 60), currentY + (row * 6));
    });

    currentY += Math.ceil(details.length / 3) * 6 + 3;

    // Job description (truncated)
    if (job.description) {
      const descHeight = addText(
        job.description.length > 200 ? job.description.substring(0, 200) + '...' : job.description,
        20,
        currentY,
        pageWidth - 40,
        8
      );
      currentY += descHeight + 10;
    }
  });

  // Insights and Recommendations
  checkPageBreak(40);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Key Insights & Recommendations', 20, currentY);
  currentY += 15;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');

  const insights = [
    `Your hiring pipeline has ${data.pipelineData.pending} applications pending review.`,
    `Your approval rate of ${data.metrics.approvalRate.toFixed(1)}% is ${data.metrics.approvalRate > 25 ? 'above' : 'below'} industry average.`,
    `You've received ${data.metrics.applicationsThisWeek} new applications this week.`,
    data.metrics.topPerformingJob ? `"${data.metrics.topPerformingJob}" is your top performing job.` : 'Consider optimizing job descriptions for better performance.',
    data.pipelineData.pending > 10 ? 'Consider reviewing pending applications to improve response time.' : 'Your application review process is up to date.'
  ];

  insights.forEach((insight) => {
    checkPageBreak(15);
    const insightHeight = addText(`• ${insight}`, 25, currentY, pageWidth - 50, 10);
    currentY += insightHeight + 5;
  });

  // Footer
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'italic');
  pdf.text(`Report generated on ${today} | Page ${pdf.getNumberOfPages()}`, 20, pageHeight - 10);

  // Save the PDF
  const filename = `hiring-analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
};
