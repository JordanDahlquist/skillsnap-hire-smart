
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Plus, RefreshCw, Loader2 } from "lucide-react";
import { useDailyBriefing } from "@/hooks/useDailyBriefing";
import { useRegenerateBriefing } from "@/hooks/useRegenerateBriefing";

interface AIDailyBriefingProps {
  userDisplayName: string;
  onCreateJob: () => void;
}

export const AIDailyBriefing = ({ userDisplayName, onCreateJob }: AIDailyBriefingProps) => {
  const { data: briefingData, isLoading, refetch } = useDailyBriefing();
  const { regenerateBriefing, isRegenerating } = useRegenerateBriefing(refetch);

  const handleRegenerate = () => {
    regenerateBriefing();
  };

  if (isLoading) {
    return (
      <div className="px-6 sm:px-8 lg:px-12 py-6">
        <div className="max-w-7xl mx-auto">
          <Card className="relative overflow-hidden border-0 bg-white/95 backdrop-blur-sm shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-70" />
            <CardContent className="relative p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const briefing = briefingData?.briefing;
  const greeting = briefingData?.greeting || `Good morning, ${userDisplayName}! 👋`;

  return (
    <div className="px-6 sm:px-8 lg:px-12 py-6">
      <div className="max-w-7xl mx-auto">
        <Card className="relative overflow-hidden border-0 bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-70" />
          <CardContent className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{greeting}</h2>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">
                      AI Daily Briefing
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="text-gray-600 hover:text-gray-800"
                >
                  {isRegenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
                <Button 
                  onClick={onCreateJob}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Job
                </Button>
              </div>
            </div>
            
            {briefing ? (
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: briefing }} />
              </div>
            ) : (
              <p className="text-gray-600 italic">
                Your personalized briefing will appear here. Click the refresh button to generate insights about your hiring activity.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
