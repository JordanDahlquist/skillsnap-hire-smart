
import { useState } from "react";
import { UnifiedJobFormData, UnifiedJobCreatorState } from "@/types/jobForm";
import { SkillsTestData } from "@/types/skillsAssessment";
import { InterviewQuestionsData } from "@/types/interviewQuestions";

const initialFormData: UnifiedJobFormData = {
  companyName: "",
  companyWebsite: "",
  title: "",
  description: "",
  employmentType: "project",
  experienceLevel: "intermediate",
  skills: "",
  budget: "",
  duration: "",
  salary: "",
  benefits: "",
  location: "",
  locationType: "remote", // Default to remote
  country: "",
  state: "",
  city: ""
};

const initialSkillsTestData: SkillsTestData = {
  questions: [],
  maxQuestions: 10,
  mode: 'ai_generated',
  estimatedCompletionTime: 0,
  instructions: ""
};

const initialInterviewQuestionsData: InterviewQuestionsData = {
  questions: [],
  maxQuestions: 10,
  mode: 'ai_generated',
  estimatedCompletionTime: 0,
  instructions: "",
  defaultVideoLength: 5
};

const getInitialState = (): UnifiedJobCreatorState => ({
  currentStep: 1,
  isGenerating: false,
  isSaving: false,
  formData: { ...initialFormData },
  generatedJobPost: "",
  skillsTestData: { ...initialSkillsTestData },
  skillsTestViewState: 'initial',
  generatedInterviewQuestions: "",
  interviewQuestionsData: { ...initialInterviewQuestionsData },
  interviewQuestionsViewState: 'initial',
  interviewVideoMaxLength: 5,
  isEditingJobPost: false,
  isEditingInterviewQuestions: false,
  isAnalyzingWebsite: false,
  websiteAnalysisData: null,
  websiteAnalysisError: null,
  isEditMode: false,
  editingJobId: undefined
});

export const useJobCreatorState = () => {
  const [state, setState] = useState<UnifiedJobCreatorState>(getInitialState());

  const resetState = () => {
    console.log('Resetting job creator state');
    setState(getInitialState());
  };

  return {
    state,
    setState,
    resetState,
    initialState: getInitialState()
  };
};
