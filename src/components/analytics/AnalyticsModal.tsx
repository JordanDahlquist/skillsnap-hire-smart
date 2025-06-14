
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { X, Download, RefreshCw } from "lucide-react";
import { OverviewTab } from "./OverviewTab";
import { PipelineTab } from "./PipelineTab";
import { TrendsTab } from "./TrendsTab";
import { InsightsTab } from "./InsightsTab";
import { useHiringAnalytics } from "@/hooks/useHiringAnalytics";
import { useToast } from "@/hooks/use-toast";
import { generateAnalyticsReport } from "@/utils/analyticsReportGenerator";

interface AnalyticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userDisplayName?: string;
}

export const AnalyticsModal = ({ open, onOpenChange, userDisplayName = "User" }: AnalyticsModalProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isExporting, setIsExporting] = useState(false);
  const analytics = useHiringAnalytics();
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      toast({
        title: "Generating Report",
        description: "Creating your comprehensive analytics report with visual charts...",
      });

      const reportData = {
        metrics: analytics.metrics,
        pipelineData: analytics.pipelineData,
        trendData: analytics.trendData,
        jobPerformanceData: analytics.jobPerformanceData,
        userDisplayName
      };

      await generateAnalyticsReport(reportData, activeTab, setActiveTab);
      
      toast({
        title: "Report Generated",
        description: "Your visual analytics report has been downloaded as a PDF.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "There was an error generating your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await analytics.refreshAnalytics();
      toast({
        title: "Analytics Refreshed",
        description: "Your analytics data has been updated with the latest information.",
      });
    } catch (error) {
      console.error("Failed to refresh analytics:", error);
      toast({
        title: "Refresh Failed",
        description: "There was an error refreshing your analytics data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-20">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        
        <DialogHeader className="pb-4 border-b pr-12">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Hiring Analytics Dashboard
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={analytics.isRefreshing}
                className="text-xs"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${analytics.isRefreshing ? 'animate-spin' : ''}`} />
                {analytics.isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={isExporting || analytics.isLoading}
                className="text-xs"
              >
                {isExporting ? (
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-1" />
                )}
                {isExporting ? 'Generating...' : 'Export'}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview" className="text-sm font-medium">
                Overview
              </TabsTrigger>
              <TabsTrigger value="pipeline" className="text-sm font-medium">
                Pipeline
              </TabsTrigger>
              <TabsTrigger value="trends" className="text-sm font-medium">
                Trends
              </TabsTrigger>
              <TabsTrigger value="insights" className="text-sm font-medium">
                Insights
              </TabsTrigger>
            </TabsList>

            <div className="h-[calc(90vh-200px)] overflow-y-auto relative">
              {(analytics.isRefreshing || isExporting) && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-lg">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="text-sm text-gray-600">
                      {isExporting ? 'Generating PDF report...' : 'Updating analytics...'}
                    </span>
                  </div>
                </div>
              )}
              
              <TabsContent value="overview" data-value="overview" className="mt-0">
                <OverviewTab analytics={analytics} />
              </TabsContent>
              
              <TabsContent value="pipeline" data-value="pipeline" className="mt-0">
                <PipelineTab analytics={analytics} />
              </TabsContent>
              
              <TabsContent value="trends" data-value="trends" className="mt-0">
                <TrendsTab analytics={analytics} />
              </TabsContent>
              
              <TabsContent value="insights" data-value="insights" className="mt-0">
                <InsightsTab analytics={analytics} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="mt-4 pt-4 border-t text-xs text-gray-500 text-center">
          Last updated: {new Date().toLocaleString()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
