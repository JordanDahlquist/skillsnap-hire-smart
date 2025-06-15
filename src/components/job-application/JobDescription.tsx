
import { Job } from "@/types";

interface JobDescriptionProps {
  job: Job;
}

export const JobDescription = ({ job }: JobDescriptionProps) => {
  return (
    <div className="bg-white">
      {job.ai_mini_description && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2 text-left">Quick Overview</h3>
          <p className="text-blue-800 text-left">{job.ai_mini_description}</p>
        </div>
      )}
      
      <div className="prose max-w-none">
        <h3 className="text-lg font-semibold mb-3 text-foreground text-left">Job Description</h3>
        <div className="whitespace-pre-wrap text-foreground leading-relaxed text-left">
          {job.description}
        </div>
      </div>
    </div>
  );
};
