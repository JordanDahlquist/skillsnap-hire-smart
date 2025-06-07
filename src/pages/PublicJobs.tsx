
import { UnifiedHeader } from "@/components/UnifiedHeader";
import { useJobFiltering } from "@/hooks/useJobFiltering";
import { usePublicJobs } from "@/hooks/usePublicJobs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PublicJobsHeader } from "@/components/public-jobs/PublicJobsHeader";
import { PublicJobsFilters } from "@/components/public-jobs/PublicJobsFilters";
import { PublicJobsList } from "@/components/public-jobs/PublicJobsList";

const PublicJobs = () => {
  const { jobs, loading, getTimeAgo } = usePublicJobs();
  
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
        <PublicJobsHeader />
        
        <PublicJobsFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filters={filters}
          setFilters={setFilters}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          onAiSearch={handleAiSearch}
          onClearFilters={clearFilters}
          availableOptions={availableOptions}
          activeFiltersCount={activeFiltersCount}
          resultCount={filteredJobs.length}
        />
        
        <PublicJobsList
          jobs={filteredJobs}
          loading={loading}
          searchTerm={searchTerm}
          activeFiltersCount={activeFiltersCount}
          getTimeAgo={getTimeAgo}
        />
      </main>
    </div>
  );
};

export default PublicJobs;
