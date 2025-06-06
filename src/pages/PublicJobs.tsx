
import { useState, useEffect } from "react";
import { UnifiedHeader } from "@/components/UnifiedHeader";
import { PublicJobCard } from "@/components/PublicJobCard";
import { JobFilters } from "@/components/JobFilters";
import { JobSorting } from "@/components/JobSorting";
import { Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useJobFiltering } from "@/hooks/useJobFiltering";
import { toast } from "sonner";

const PublicJobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredJobs,
    availableOptions,
    activeFiltersCount,
    clearFilters,
    applyAiSearchResults
  } = useJobFiltering(jobs);
  
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          applications(count)
        `)
        .eq('status', 'active')
        .order('updated_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
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

  const handleAiSearch = async (prompt: string) => {
    try {
      console.log('Starting flexible AI search with prompt:', prompt);
      console.log('Available options:', availableOptions);
      
      const response = await supabase.functions.invoke('ai-job-search', {
        body: { prompt, availableOptions }
      });

      if (response.error) {
        throw response.error;
      }

      const { searchTerm: aiSearchTerm, filters: aiFilters, explanation } = response.data;
      
      console.log('AI Search Response:', { aiSearchTerm, aiFilters, explanation });
      
      // Apply AI-generated filters
      applyAiSearchResults(aiSearchTerm, aiFilters);
      
      // Provide enhanced feedback about what was applied with flexibility messaging
      const appliedFilters = [];
      
      if (aiFilters.employmentType !== 'all') {
        appliedFilters.push(`Employment: ${aiFilters.employmentType}`);
      }
      if (aiFilters.roleType !== 'all') {
        appliedFilters.push(`Role: ${aiFilters.roleType}`);
      }
      if (aiFilters.experienceLevel !== 'all') {
        appliedFilters.push(`Experience: ${aiFilters.experienceLevel}`);
      }
      if (aiFilters.locationType !== 'all') {
        appliedFilters.push(`Location: ${aiFilters.locationType}`);
      }
      if (aiFilters.state !== 'all') {
        appliedFilters.push(`State: ${aiFilters.state}`);
      }
      if (aiFilters.budgetRange && (aiFilters.budgetRange[0] > 0 || aiFilters.budgetRange[1] < 200000)) {
        const budgetType = aiFilters.employmentType === 'full-time' || aiFilters.employmentType === 'part-time' 
          ? 'salary' : 'budget';
        appliedFilters.push(`${budgetType}: $${aiFilters.budgetRange[0].toLocaleString()}-$${aiFilters.budgetRange[1].toLocaleString()}`);
      }
      
      const flexibilityMessage = appliedFilters.length > 0 
        ? `AI Search applied flexible filters: ${appliedFilters.join(', ')}${aiSearchTerm ? ` | Text search: "${aiSearchTerm}"` : ''}`
        : `AI Search using flexible text search: "${aiSearchTerm}"`;
      
      // Add note about flexibility
      const finalMessage = `${flexibilityMessage} • Showing broader results including close matches`;
      
      toast.success(finalMessage);
    } catch (error) {
      console.error('AI search error:', error);
      toast.error('AI search failed, using basic text search instead');
      
      // Fallback to basic search
      clearFilters();
      setSearchTerm(prompt);
    }
  };

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
        
        <JobFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filters={filters}
          setFilters={setFilters}
          onAiSearch={handleAiSearch}
          onClearFilters={clearFilters}
          availableOptions={availableOptions}
          activeFiltersCount={activeFiltersCount}
        />
        
        <JobSorting
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          resultCount={filteredJobs.length}
        />
        
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
            <h3 className="text-xl font-medium text-gray-900 mb-1">No matching positions found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchTerm || activeFiltersCount > 0 ? 
                "Try using fewer specific terms or clearing some filters to see more opportunities" : 
                "Check back soon for new opportunities"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicJobs;
