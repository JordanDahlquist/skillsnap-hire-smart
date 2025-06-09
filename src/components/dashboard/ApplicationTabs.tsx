

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, FileText, MessageSquare, Brain, Video } from "lucide-react";
import { Application } from "@/types";
import { safeParseSkillsTestResponses } from "@/utils/typeGuards";

interface ApplicationTabsProps {
  application: Application;
  getStatusColor: (status: string, manualRating?: number | null) => string;
  getRatingStars: (rating: number | null) => JSX.Element[];
  getTimeAgo: (dateString: string) => string;
}

export const ApplicationTabs = ({
  application,
  getStatusColor,
  getRatingStars,
  getTimeAgo,
}: ApplicationTabsProps) => {
  const skillsTestResponses = safeParseSkillsTestResponses(application.skills_test_responses);
  const hasSkillsTest = skillsTestResponses.length > 0;

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className={`grid w-full grid-cols-2 ${hasSkillsTest ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
        <TabsTrigger value="overview" className="flex items-center gap-1">
          <User className="w-4 h-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="responses" className="flex items-center gap-1">
          <MessageSquare className="w-4 h-4" />
          Responses
        </TabsTrigger>
        {hasSkillsTest && (
          <TabsTrigger value="skills" className="flex items-center gap-1">
            <Brain className="w-4 h-4" />
            Skills Test
          </TabsTrigger>
        )}
        <TabsTrigger value="video" className="flex items-center gap-1">
          <Video className="w-4 h-4" />
          Video Interview
        </TabsTrigger>
        <TabsTrigger value="files" className="flex items-center gap-1">
          <FileText className="w-4 h-4" />
          Resume
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Application Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Status</span>
              <Badge className={getStatusColor(application.status)}>
                {application.status}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Applied</span>
              <span className="text-sm font-medium">
                {getTimeAgo(application.created_at)}
              </span>
            </div>

            {application.ai_rating && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">AI Rating</span>
                <div className="flex items-center gap-1">
                  {getRatingStars(application.ai_rating)}
                  <span className="text-sm ml-1">({application.ai_rating}/3)</span>
                </div>
              </div>
            )}

            {application.manual_rating && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Manual Rating</span>
                <div className="flex items-center gap-1">
                  {getRatingStars(application.manual_rating)}
                  <span className="text-sm ml-1">({application.manual_rating}/3)</span>
                </div>
              </div>
            )}

            {application.portfolio && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Portfolio</span>
                <a
                  href={application.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline max-w-[200px] truncate"
                >
                  View Portfolio
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {application.ai_summary && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 leading-relaxed">
                {application.ai_summary}
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="responses" className="space-y-4">
        {[
          { label: "Why are you a good fit for this role?", value: application.answer_1 },
          { label: "What is your experience in this field?", value: application.answer_2 },
          { label: "What are your salary expectations?", value: application.answer_3 },
        ].map((item, index) => (
          item.value && (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-sm">{item.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {item.value}
                </p>
              </CardContent>
            </Card>
          )
        ))}
      </TabsContent>

      {hasSkillsTest && (
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Skills Assessment Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {skillsTestResponses.map((response, index) => (
                <div key={index} className="space-y-2">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-sm text-gray-900 mb-2">
                      Question {index + 1}
                    </h4>
                    <p className="text-sm text-gray-700">
                      {response.question}
                    </p>
                  </div>
                  <div className="pl-4 border-l-2 border-blue-200">
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {response.answer}
                    </p>
                  </div>
                  {index < skillsTestResponses.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      )}

      <TabsContent value="video" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Video className="w-4 h-4" />
              Video Interview Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!application.interview_video_url ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 font-medium mb-1">No Video Interview Submitted</p>
                <p className="text-xs text-gray-500">
                  The candidate has not provided a video interview link yet (e.g., Loom recording)
                </p>
              </div>
            ) : application.interview_video_url === 'recorded' ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <Video className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-blue-900 font-medium">Video Interview Completed</p>
                <p className="text-xs text-blue-700 mt-1">
                  The candidate has recorded their video responses
                </p>
              </div>
            ) : (
              <video
                src={application.interview_video_url}
                controls
                className="w-full rounded-lg"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="files" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Resume</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {application.resume_file_path ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium">Resume</p>
                    <p className="text-xs text-gray-500">
                      {application.resume_file_path.split('/').pop()}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">PDF</Badge>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No resume uploaded
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
