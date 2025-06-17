
import { SkillsTestData } from "./skillsAssessment";
import { InterviewQuestionsData } from "./interviewQuestions";

export interface UnifiedJobFormData {
  jobOverview: string;
  companyName: string;
  companyWebsite: string;
  title: string;
  employmentType: "full-time" | "part-time" | "contract" | "project";
  experienceLevel: "entry-level" | "mid-level" | "senior-level" | "executive";
  skills: string;
  budget: string;
  duration: string;
  salary: string;
  benefits: string;
  location: string;
  locationType: "remote" | "office" | "hybrid";
  country: string;
  state: string;
  city: string;
}

export interface WritingTone {
  professional: number;
  friendly: number;
  excited: number;
}

export interface CompanyAnalysisData {
  companyName: string;
  companyDescription: string;
  industry: string;
  companySize: string;
  headquarters: string;
  foundedYear: string;
  keyValues: string[];
  technologies: string[];
  benefits: string[];
  workCulture: string;
  missionStatement: string;
}

export interface UnifiedJobCreatorState {
  currentStep: number;
  isGenerating: boolean;
  isSaving: boolean;
  formData: UnifiedJobFormData;
  generatedJobPost: string;
  writingTone: WritingTone;
  skillsTestData: SkillsTestData;
  skillsTestViewState: 'initial' | 'editor' | 'preview';
  generatedInterviewQuestions: string;
  interviewQuestionsData: InterviewQuestionsData;
  interviewQuestionsViewState: 'initial' | 'editor' | 'preview';
  isEditingJobPost: boolean;
  isEditingInterviewQuestions: boolean;
  isAnalyzingWebsite: boolean;
  websiteAnalysisData: CompanyAnalysisData | null;
  websiteAnalysisError: string | null;
  isEditMode: boolean;
  editingJobId?: string;
}

export interface UnifiedJobCreatorActions {
  setCurrentStep: (step: number) => void;
  setIsGenerating: (loading: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  updateFormData: (field: keyof UnifiedJobFormData, value: string) => void;
  setGeneratedJobPost: (content: string) => void;
  setWritingTone: (field: keyof WritingTone, value: number) => void;
  setSkillsTestData: (data: SkillsTestData) => void;
  setSkillsTestViewState: (viewState: 'initial' | 'editor' | 'preview') => void;
  setGeneratedInterviewQuestions: (content: string) => void;
  setIsEditingJobPost: (editing: boolean) => void;
  setIsEditingInterviewQuestions: (editing: boolean) => void;
  setEditMode: (isEdit: boolean, jobId?: string) => void;
  setInterviewQuestionsData: (data: InterviewQuestionsData) => void;
  setInterviewQuestionsViewState: (viewState: 'initial' | 'editor' | 'preview') => void;
  
  // Website analysis actions
  setIsAnalyzingWebsite: (analyzing: boolean) => void;
  setWebsiteAnalysisData: (data: CompanyAnalysisData | null) => void;
  setWebsiteAnalysisError: (error: string | null) => void;
  analyzeWebsite: (url: string) => Promise<void>;
  
  // Form population from existing job
  populateFormFromJob: (job: any) => void;
}

export interface UnifiedJobCreatorPanelProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  onJobCreated?: () => void;
  editingJob?: any;
}
