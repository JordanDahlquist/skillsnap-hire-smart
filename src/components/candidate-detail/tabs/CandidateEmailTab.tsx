
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, RefreshCw } from 'lucide-react';
import { CandidateInboxSection } from '../CandidateInboxSection';
import { useCandidateInboxData } from '@/hooks/useCandidateInboxData';
import type { Application, Job } from '@/types';

interface CandidateEmailTabProps {
  application: Application;
  job: Job;
}

export const CandidateEmailTab = ({ application, job }: CandidateEmailTabProps) => {
  const { refetchThreads, isLoading } = useCandidateInboxData(application.id);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg dark:bg-blue-950">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-foreground">Email Conversation</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Direct communication with {application.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={refetchThreads}
                disabled={isLoading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Badge variant="outline" className="text-xs">
                <MessageSquare className="w-3 h-3 mr-1" />
                {application.email}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Email Interface */}
      <CandidateInboxSection 
        application={application}
        job={job}
      />
    </div>
  );
};
