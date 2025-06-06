
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, Filter, X, ChevronDown, Sparkles } from "lucide-react";
import { BudgetFilter } from "./BudgetFilter";

interface JobFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filters: {
    roleType: string;
    locationType: string;
    experienceLevel: string;
    employmentType: string;
    country: string;
    state: string;
    budgetRange: number[];
    duration: string;
  };
  setFilters: (filters: any) => void;
  onAiSearch: (prompt: string) => void;
  onClearFilters: () => void;
  availableOptions: {
    roleTypes: string[];
    locationTypes: string[];
    experienceLevels: string[];
    employmentTypes: string[];
    countries: string[];
    states: string[];
    durations: string[];
  };
  activeFiltersCount: number;
}

export const JobFilters = ({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  onAiSearch,
  onClearFilters,
  availableOptions,
  activeFiltersCount
}: JobFiltersProps) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [aiSearchPrompt, setAiSearchPrompt] = useState("");
  const [isAiSearchMode, setIsAiSearchMode] = useState(false);
  const [isAiSearching, setIsAiSearching] = useState(false);

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleAiSearch = async () => {
    if (aiSearchPrompt.trim() && !isAiSearching) {
      setIsAiSearching(true);
      try {
        await onAiSearch(aiSearchPrompt);
        setAiSearchPrompt("");
        setIsAiSearchMode(false);
      } finally {
        setIsAiSearching(false);
      }
    }
  };

  const getActiveFilterBadges = () => {
    const badges = [];
    
    if (filters.roleType !== "all") badges.push({ key: "roleType", label: "Role", value: filters.roleType });
    if (filters.locationType !== "all") badges.push({ key: "locationType", label: "Location Type", value: filters.locationType });
    if (filters.experienceLevel !== "all") badges.push({ key: "experienceLevel", label: "Experience", value: filters.experienceLevel });
    if (filters.employmentType !== "all") badges.push({ key: "employmentType", label: "Employment", value: filters.employmentType });
    if (filters.country !== "all") badges.push({ key: "country", label: "Country", value: filters.country });
    if (filters.state !== "all") badges.push({ key: "state", label: "State", value: filters.state });
    if (filters.duration !== "all") badges.push({ key: "duration", label: "Duration", value: filters.duration });
    if (filters.budgetRange[0] > 0 || filters.budgetRange[1] < 200000) {
      badges.push({ 
        key: "budgetRange", 
        label: "Budget", 
        value: `$${filters.budgetRange[0].toLocaleString()} - $${filters.budgetRange[1].toLocaleString()}` 
      });
    }
    
    return badges;
  };

  const removeFilter = (key: string) => {
    if (key === "budgetRange") {
      handleFilterChange(key, [0, 200000]);
    } else {
      handleFilterChange(key, "all");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6 space-y-4">
      {/* Search Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={!isAiSearchMode ? "default" : "outline"}
          size="sm"
          onClick={() => setIsAiSearchMode(false)}
        >
          <Search className="w-4 h-4 mr-2" />
          Standard Search
        </Button>
        <Button
          variant={isAiSearchMode ? "default" : "outline"}
          size="sm"
          onClick={() => setIsAiSearchMode(true)}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          AI Search
        </Button>
      </div>

      {/* Search Input */}
      {!isAiSearchMode ? (
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search jobs by title, description, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <Sparkles className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
            <Input
              placeholder="Try: 'Full-time React developer jobs $80k-120k' or 'Contract design projects under $10k'"
              value={aiSearchPrompt}
              onChange={(e) => setAiSearchPrompt(e.target.value)}
              className="pl-9"
              onKeyPress={(e) => e.key === 'Enter' && !isAiSearching && handleAiSearch()}
              disabled={isAiSearching}
            />
          </div>
          <Button 
            onClick={handleAiSearch} 
            disabled={!aiSearchPrompt.trim() || isAiSearching}
            className="relative"
          >
            {isAiSearching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Searching...
              </>
            ) : (
              'Search with AI'
            )}
          </Button>
        </div>
      )}

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filters.employmentType} onValueChange={(value) => handleFilterChange("employmentType", value)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Employment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {availableOptions.employmentTypes.map(type => (
              <SelectItem key={type} value={type || "unknown"}>{type || "Unknown"}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.roleType} onValueChange={(value) => handleFilterChange("roleType", value)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Role type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {availableOptions.roleTypes.map(type => (
              <SelectItem key={type} value={type || "unknown"}>{type || "Unknown"}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.locationType} onValueChange={(value) => handleFilterChange("locationType", value)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Location type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            {availableOptions.locationTypes.map(type => (
              <SelectItem key={type} value={type || "unknown"}>{type || "Unknown"}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Advanced Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            <div className="space-y-6 p-4 bg-gray-50 rounded-lg">
              {/* Budget Filter - Employment Type Dependent */}
              {filters.employmentType !== "all" && (
                <BudgetFilter
                  employmentType={filters.employmentType}
                  budgetRange={filters.budgetRange}
                  onBudgetChange={(range) => handleFilterChange("budgetRange", range)}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Experience Level</label>
                  <Select value={filters.experienceLevel} onValueChange={(value) => handleFilterChange("experienceLevel", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All levels</SelectItem>
                      {availableOptions.experienceLevels.map(level => (
                        <SelectItem key={level} value={level || "unknown"}>{level || "Unknown"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Country</label>
                  <Select value={filters.country} onValueChange={(value) => handleFilterChange("country", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All countries</SelectItem>
                      {availableOptions.countries.map(country => (
                        <SelectItem key={country} value={country || "unknown"}>{country || "Unknown"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">State</label>
                  <Select value={filters.state} onValueChange={(value) => handleFilterChange("state", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All states</SelectItem>
                      {availableOptions.states.map(state => (
                        <SelectItem key={state} value={state || "unknown"}>{state || "Unknown"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration</label>
                  <Select value={filters.duration} onValueChange={(value) => handleFilterChange("duration", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All durations</SelectItem>
                      {availableOptions.durations.map(duration => (
                        <SelectItem key={duration} value={duration || "unknown"}>{duration || "Unknown"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Button variant="outline" onClick={onClearFilters}>
          Clear All
        </Button>
      </div>

      {/* Active Filter Badges */}
      {getActiveFilterBadges().length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {getActiveFilterBadges().map((badge) => (
            <Badge key={badge.key} variant="secondary" className="gap-1">
              {badge.label}: {badge.value}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-red-500" 
                onClick={() => removeFilter(badge.key)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
