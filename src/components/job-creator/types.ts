
export interface JobFormData {
  title: string;
  description: string;
  employmentType: string;
  experienceLevel: string;
  skills: string;
  budget: string;
  duration: string;
  location: string;
}

export interface JobCreatorState {
  currentStep: number;
  isGenerating: boolean;
  isSaving: boolean;
  formData: JobFormData;
  generatedJobPost: string;
  generatedSkillsTest: string;
  generatedInterviewQuestions: string;
  interviewVideoMaxLength: number;
  isEditingJobPost: boolean;
  isEditingSkillsTest: boolean;
  isEditingInterviewQuestions: boolean;
}

export interface JobCreatorActions {
  setCurrentStep: (step: number) => void;
  setIsGenerating: (loading: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  updateFormData: (field: keyof JobFormData, value: string) => void;
  setGeneratedJobPost: (content: string) => void;
  setGeneratedSkillsTest: (content: string) => void;
  setGeneratedInterviewQuestions: (content: string) => void;
  setInterviewVideoMaxLength: (length: number) => void;
  setIsEditingJobPost: (editing: boolean) => void;
  setIsEditingSkillsTest: (editing: boolean) => void;
  setIsEditingInterviewQuestions: (editing: boolean) => void;
}

export interface JobCreatorPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobCreated?: () => void;
}
