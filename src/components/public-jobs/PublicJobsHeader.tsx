
import { Briefcase } from "lucide-react";

export const PublicJobsHeader = () => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Briefcase className="w-8 h-8 mr-2 text-blue-600" />
          Available Positions
        </h1>
        <p className="text-gray-600 mt-2">Explore open roles and find your perfect opportunity</p>
      </div>
    </div>
  );
};
