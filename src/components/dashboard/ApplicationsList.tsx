
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Star } from "lucide-react";

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

interface ApplicationsListProps {
  applications: Application[];
  selectedApplication: Application | null;
  onSelectApplication: (app: Application) => void;
  getStatusColor: (status: string) => string;
  getRatingStars: (rating: number | null) => JSX.Element[];
  getTimeAgo: (dateString: string) => string;
}

export const ApplicationsList = ({ 
  applications, 
  selectedApplication, 
  onSelectApplication,
  getStatusColor,
  getRatingStars,
  getTimeAgo 
}: ApplicationsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Applications</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {applications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No applications yet</p>
            <p className="text-sm">Applications will appear here when candidates apply</p>
          </div>
        ) : (
          <div className="space-y-0">
            {applications.map((app) => (
              <div
                key={app.id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedApplication?.id === app.id ? "bg-purple-50 border-l-4 border-l-purple-600" : ""
                }`}
                onClick={() => onSelectApplication(app)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{app.name}</h3>
                  <Badge className={getStatusColor(app.status)}>
                    {app.status}
                  </Badge>
                </div>
                {app.ai_rating && (
                  <div className="flex items-center gap-1 mb-1">
                    {getRatingStars(app.ai_rating)}
                    <span className="text-sm text-gray-600 ml-1">{app.ai_rating.toFixed(1)}/5</span>
                  </div>
                )}
                <p className="text-sm text-gray-600">{getTimeAgo(app.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
