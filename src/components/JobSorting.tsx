
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, TrendingUp, Calendar, DollarSign, Users } from "lucide-react";

interface JobSortingProps {
  sortBy: string;
  setSortBy: (value: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (value: "asc" | "desc") => void;
  resultCount: number;
}

export const JobSorting = ({ sortBy, setSortBy, sortOrder, setSortOrder, resultCount }: JobSortingProps) => {
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const getSortIcon = (field: string) => {
    switch (field) {
      case "budget":
        return <DollarSign className="w-4 h-4" />;
      case "applications":
        return <Users className="w-4 h-4" />;
      case "created_at":
      case "updated_at":
        return <Calendar className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {resultCount} job{resultCount !== 1 ? 's' : ''} found
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">Sort by:</span>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center gap-2">
              {getSortIcon(sortBy)}
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated_at">Most Recent</SelectItem>
            <SelectItem value="created_at">Date Posted</SelectItem>
            <SelectItem value="budget">Budget</SelectItem>
            <SelectItem value="applications">Applications</SelectItem>
            <SelectItem value="title">Job Title</SelectItem>
          </SelectContent>
        </Select>
        
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSortOrder}
          className="flex items-center gap-2"
        >
          <ArrowUpDown className="w-4 h-4" />
          {sortOrder === "desc" ? "High to Low" : "Low to High"}
        </Button>
      </div>
    </div>
  );
};
