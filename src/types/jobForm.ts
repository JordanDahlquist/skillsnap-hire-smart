import { SkillsTestData } from "./skillsAssessment";

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  portfolioUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  resumeFile: File | null;
  resumeUrl: string | null;
  coverLetter: string;
}

export interface UnifiedJobFormData {
  // Company and basic info
  companyName: string;
  title: string;
  description: string;
  employmentType: string;
  experienceLevel: string;
  skills: string;
  
  // Budget and duration
  budget: string;
  duration: string;
  
  // Salary and Benefits
  salary: string;
  benefits: string;

  // Location
  location: string;
  locationType: string;
  country: string;
  state: string;
  city: string;
}

export interface UnifiedJobCreatorState {
  currentStep: number;
  isGenerating: boolean;
  isSaving: boolean;
  formData: UnifiedJobFormData;
  generatedJobPost: string;
  skillsTestData: SkillsTestData;
  skillsTestViewState: 'initial' | 'template_selector' | 'editor' | 'preview';
  generatedInterviewQuestions: string;
  interviewVideoMaxLength: number;
  isEditingJobPost: boolean;
  isEditingInterviewQuestions: boolean;
  // Edit mode
  isEditMode: boolean;
  editingJobId?: string;
}

export interface UnifiedJobCreatorActions {
  setCurrentStep: (step: number) => void;
  setIsGenerating: (loading: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  updateFormData: (field: keyof UnifiedJobFormData, value: string) => void;
  setGeneratedJobPost: (content: string) => void;
  setSkillsTestData: (data: SkillsTestData) => void;
  setSkillsTestViewState: (viewState: 'initial' | 'template_selector' | 'editor' | 'preview') => void;
  setGeneratedInterviewQuestions: (content: string) => void;
  setInterviewVideoMaxLength: (length: number) => void;
  setIsEditingJobPost: (editing: boolean) => void;
  setIsEditingInterviewQuestions: (editing: boolean) => void;
  setEditMode: (isEdit: boolean, jobId?: string) => void;
  populateFormFromJob: (job: any) => void;
}

export interface UnifiedJobCreatorPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobCreated?: () => void;
  editingJob?: any; // Job to edit, if in edit mode
}
