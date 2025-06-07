
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface Application {
  id: string;
  name: string;
  email: string;
  portfolio: string | null;
  created_at: string;
  ai_rating: number | null;
  ai_summary: string | null;
  status: string;
  experience: string | null;
  answer_1: string | null;
  answer_2: string | null;
  answer_3: string | null;
}

interface ApplicationTabsProps {
  application: Application;
  getStatusColor: (status: string) => string;
  getRatingStars: (rating: number | null) => JSX.Element[];
  getTimeAgo: (dateString: string) => string;
}

export const ApplicationTabs = ({ 
  application, 
  getStatusColor, 
  getRatingStars, 
  getTimeAgo 
}: ApplicationTabsProps) => {
  return (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="summary">AI Summary</TabsTrigger>
        <TabsTrigger value="answers">Test Answers</TabsTrigger>
        <TabsTrigger value="profile">Profile</TabsTrigger>
      </TabsList>

      <TabsContent value="summary" className="space-y-4">
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <Badge className={getStatusColor(application.status)}>
            {application.status}
          </Badge>
        </div>
        
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">AI Assessment Summary</h4>
          <p className="text-gray-700 leading-relaxed">
            {application.ai_summary || "AI analysis is being processed..."}
          </p>
        </div>
      </TabsContent>

      <TabsContent value="answers" className="space-y-6">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Answer 1</h4>
          <p className="text-gray-700 text-sm leading-relaxed">
            {application.answer_1 || "No answer provided"}
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Answer 2</h4>
          <p className="text-gray-700 text-sm leading-relaxed">
            {application.answer_2 || "No answer provided"}
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Answer 3</h4>
          <p className="text-gray-700 text-sm leading-relaxed">
            {application.answer_3 || "No answer provided"}
          </p>
        </div>
      </TabsContent>

      <TabsContent value="profile" className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
          <p className="text-gray-700">{application.email}</p>
        </div>
        
        {application.portfolio && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Portfolio</h4>
            <a 
              href={application.portfolio} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700 underline"
            >
              {application.portfolio}
            </a>
          </div>
        )}
        
        {application.experience && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Experience</h4>
            <p className="text-gray-700">{application.experience}</p>
          </div>
        )}
        
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Submitted</h4>
          <p className="text-gray-700">{getTimeAgo(application.created_at)}</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};
