
import { OptimizedRefactoredJobCard } from "./OptimizedRefactoredJobCard";
import { Job } from "@/types";

interface RefactoredJobCardProps {
  job: Job;
  onJobUpdate: () => void;
  getTimeAgo: (dateString: string) => string;
}

export const RefactoredJobCard = (props: RefactoredJobCardProps) => {
  return <OptimizedRefactoredJobCard {...props} />;
};
