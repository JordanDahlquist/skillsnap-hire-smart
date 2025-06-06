
import { useState, useEffect } from "react";
import { UnifiedHeader } from "@/components/UnifiedHeader";
import { PublicJobCard } from "@/components/PublicJobCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

const PublicJobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleTypeFilter, setRoleTypeFilter] = useState<string>("all");
  const [locationTypeFilter, setLocationTypeFilter] = useState<string>("all");
  
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('updated_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "recently";
    }
  };

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchTerm === "" || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesRoleType = roleTypeFilter === "all" || 
      job.role_type === roleTypeFilter;
      
    const matchesLocationType = locationTypeFilter === "all" || 
      job.location_type === locationTypeFilter;
      
    return matchesSearch && matchesRoleType && matchesLocationType;
  });

  // Get unique role types for filter
  const roleTypes = [...new Set(jobs.map(job => job.role_type))];
  
  // Get unique location types for filter
  const locationTypes = [...new Set(jobs.map(job => job.location_type).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedHeader 
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Jobs", isCurrentPage: true }
        ]}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Briefcase className="w-8 h-8 mr-2 text-blue-600" />
              Available Positions
            </h1>
            <p className="text-gray-600 mt-2">Explore open roles and find your perfect opportunity</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-3">
              <Select value={roleTypeFilter} onValueChange={setRoleTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Role type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  {roleTypes.map(type => (
                    <SelectItem key={type} value={type || "unknown"}>{type || "Unknown"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={locationTypeFilter} onValueChange={setLocationTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Location type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                  {locationTypes.map(type => (
                    <SelectItem key={type} value={type || "unknown"}>{type || "Unknown"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setRoleTypeFilter("all");
                  setLocationTypeFilter("all");
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredJobs.map(job => (
              <PublicJobCard 
                key={job.id} 
                job={job} 
                getTimeAgo={getTimeAgo} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-1">No open positions found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchTerm || roleTypeFilter !== "all" || locationTypeFilter !== "all" ? 
                "Try adjusting your filters or search terms" : 
                "Check back soon for new opportunities"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicJobs;
