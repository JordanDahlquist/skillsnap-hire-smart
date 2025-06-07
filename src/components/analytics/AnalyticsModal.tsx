
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { X, Download, RefreshCw } from "lucide-react";
import { OverviewTab } from "./OverviewTab";
import { PipelineTab } from "./PipelineTab";
import { TrendsTab } from "./TrendsTab";
import { InsightsTab } from "./InsightsTab";
import { useHiringAnalytics } from "@/hooks/useHiringAnalytics";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AnalyticsModal = ({ open, onOpenChange }: AnalyticsModalProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const analytics = useHiringAnalytics();
  const { toast } = useToast();

  const handleExport = () => {
    // Mock export functionality
    console.log("Exporting analytics data...");
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
                className="text-xs"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
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
              {analytics.isRefreshing && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-lg">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="text-sm text-gray-600">Updating analytics...</span>
                  </div>
                </div>
              )}
              
              <TabsContent value="overview" className="mt-0">
                <OverviewTab analytics={analytics} />
              </TabsContent>
              
              <TabsContent value="pipeline" className="mt-0">
                <PipelineTab analytics={analytics} />
              </TabsContent>
              
              <TabsContent value="trends" className="mt-0">
                <TrendsTab analytics={analytics} />
              </TabsContent>
              
              <TabsContent value="insights" className="mt-0">
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
