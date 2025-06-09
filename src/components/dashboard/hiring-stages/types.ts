
export interface HiringStage {
  id: string;
  name: string;
  order_index: number;
  color: string;
  is_default: boolean;
}

export interface Application {
  id: string;
  pipeline_stage: string | null;
  status: string;
}

export interface HiringStagesNavProps {
  jobId: string;
  applications: Application[];
  selectedStage: string | null;
  onStageSelect: (stage: string | null) => void;
}
