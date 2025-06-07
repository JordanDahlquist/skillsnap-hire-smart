
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { HiringMetrics, PipelineData, TrendData, JobPerformance } from '@/hooks/useHiringAnalytics';

interface AnalyticsReportData {
  metrics: HiringMetrics;
  pipelineData: PipelineData;
  trendData: TrendData[];
  jobPerformanceData: JobPerformance[];
  userDisplayName: string;
}

export const generateAnalyticsReport = async (
  data: AnalyticsReportData,
  activeTab: string,
  setActiveTab: (tab: string) => void
): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let currentY = 20;

  // Helper to add page break
  const checkPageBreak = (requiredHeight: number) => {
    if (currentY + requiredHeight > pageHeight - 20) {
      pdf.addPage();
      currentY = 20;
    }
  };

  // Add report header
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Hiring Analytics Dashboard Report', 20, currentY);
  currentY += 15;

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

  currentY += Math.ceil(summaryMetrics.length / 2) * 8 + 20;

  // Function to capture and add tab content
  const captureTabContent = async (tabName: string, tabDisplayName: string) => {
    // Switch to the tab
    setActiveTab(tabName);
    
    // Wait for tab content to render
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find the tab content
    const tabContent = document.querySelector(`[data-state="active"][data-value="${tabName}"]`);
    
    if (tabContent) {
      try {
        const canvas = await html2canvas(tabContent as HTMLElement, {
          scale: 1,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          height: Math.min((tabContent as HTMLElement).scrollHeight, 800),
          windowWidth: 1200,
          windowHeight: 800
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Check if we need a new page
        checkPageBreak(imgHeight + 30);
        
        // Add section title
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(tabDisplayName, 20, currentY);
        currentY += 15;
        
        // Add the captured image
        pdf.addImage(imgData, 'PNG', 20, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 20;
        
      } catch (error) {
        console.error(`Error capturing ${tabName} tab:`, error);
        
        // Fallback text if capture fails
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${tabDisplayName} content could not be captured.`, 20, currentY);
        currentY += 20;
      }
    }
  };

  // Capture each tab
  const tabs = [
    { name: 'overview', display: 'Overview' },
    { name: 'pipeline', display: 'Pipeline Analysis' },
    { name: 'trends', display: 'Trends & Analytics' },
    { name: 'insights', display: 'Insights & Recommendations' }
  ];

  for (const tab of tabs) {
    await captureTabContent(tab.name, tab.display);
  }

  // Restore original tab
  setActiveTab(activeTab);

  // Add footer
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text(
      `Hiring Analytics Report - Generated on ${today} - Page ${i} of ${pageCount}`,
      20,
      pageHeight - 10
    );
  }

  // Save the PDF
  const filename = `hiring-analytics-dashboard-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
};
