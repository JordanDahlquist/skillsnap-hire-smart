
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Star, Clock, Eye, ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react";

const mockApplications = [
  {
    id: 1,
    name: "Sarah Chen",
    email: "sarah.chen@email.com",
    portfolio: "https://github.com/sarahchen",
    submittedAt: "2 hours ago",
    rating: 4.5,
    summary: "Strong React developer with 5+ years experience. Excellent problem-solving approach and clean code practices. Provided a well-architected task management solution with proper state management. Demonstrates deep understanding of performance optimization techniques.",
    status: "pending",
    experience: "5+ years in React development, previously worked at tech startups",
    answers: {
      practical: "Implemented a clean task component using React hooks and context for state management...",
      problemSolving: "Would use React DevTools Profiler to identify render bottlenecks, implement memo and useMemo...",
      communication: "Led a team migration from class components to hooks, faced resistance but organized training sessions..."
    }
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    email: "marcus.r@email.com",
    portfolio: "https://github.com/marcusr",
    submittedAt: "1 day ago",
    rating: 3.8,
    summary: "Solid mid-level developer with good technical skills. Task management solution was functional but could use better error handling. Shows promise but may need some guidance on best practices.",
    status: "pending",
    experience: "3 years React experience, fullstack background with Node.js",
    answers: {
      practical: "Built the component using useState and basic CRUD operations...",
      problemSolving: "Would use Chrome DevTools to check bundle size and lazy load components...",
      communication: "Worked on a deadline-critical project where requirements kept changing..."
    }
  },
  {
    id: 3,
    name: "Alex Thompson",
    email: "alex.t@email.com",
    portfolio: "https://github.com/alexthompson",
    submittedAt: "2 days ago",
    rating: 2.1,
    summary: "Junior developer with basic React knowledge. Solution lacks proper structure and error handling. Responses indicate limited experience with performance optimization.",
    status: "rejected",
    experience: "1 year React experience, mostly personal projects",
    answers: {
      practical: "Made a simple component with basic add/remove functionality...",
      problemSolving: "Not sure about performance tools, maybe just remove unused code...",
      communication: "Haven't faced many challenges yet in my projects..."
    }
  }
];

export const Dashboard = () => {
  const [selectedApplication, setSelectedApplication] = useState(mockApplications[0]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Senior React Developer</h1>
              <p className="text-gray-600">Job posted 3 days ago</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Public Page
              </Button>
              <Badge className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ThumbsUp className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Qualified</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                  <p className="text-2xl font-bold text-gray-900">3.8</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Applications List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Applications</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {mockApplications.map((app) => (
                    <div
                      key={app.id}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        selectedApplication.id === app.id ? "bg-purple-50 border-l-4 border-l-purple-600" : ""
                      }`}
                      onClick={() => setSelectedApplication(app)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{app.name}</h3>
                        <Badge className={getStatusColor(app.status)}>
                          {app.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 mb-1">
                        {getRatingStars(app.rating)}
                        <span className="text-sm text-gray-600 ml-1">{app.rating}/5</span>
                      </div>
                      <p className="text-sm text-gray-600">{app.submittedAt}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Application Detail */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selectedApplication.name}</CardTitle>
                    <p className="text-gray-600">{selectedApplication.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <ThumbsDown className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="summary">AI Summary</TabsTrigger>
                    <TabsTrigger value="answers">Test Answers</TabsTrigger>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-1">
                        {getRatingStars(selectedApplication.rating)}
                        <span className="text-lg font-semibold ml-2">{selectedApplication.rating}/5</span>
                      </div>
                      <Badge className={getStatusColor(selectedApplication.status)}>
                        {selectedApplication.status}
                      </Badge>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">AI Assessment Summary</h4>
                      <p className="text-gray-700 leading-relaxed">{selectedApplication.summary}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="answers" className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Practical Challenge</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">{selectedApplication.answers.practical}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Problem Solving</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">{selectedApplication.answers.problemSolving}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Communication</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">{selectedApplication.answers.communication}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="profile" className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                      <p className="text-gray-700">{selectedApplication.email}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Portfolio</h4>
                      <a 
                        href={selectedApplication.portfolio} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700 underline"
                      >
                        {selectedApplication.portfolio}
                      </a>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Experience</h4>
                      <p className="text-gray-700">{selectedApplication.experience}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Submitted</h4>
                      <p className="text-gray-700">{selectedApplication.submittedAt}</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
