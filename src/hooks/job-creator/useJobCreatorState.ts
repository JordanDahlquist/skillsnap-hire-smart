
import { useState } from "react";
import { UnifiedJobFormData, UnifiedJobCreatorState } from "@/types/jobForm";
import { SkillsTestData } from "@/types/skillsAssessment";

const initialFormData: UnifiedJobFormData = {
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
  locationType: "remote",
  country: "",
  state: "",
  city: "",
  companyName: ""
};

const initialSkillsTestData: SkillsTestData = {
  questions: [],
  maxQuestions: 10
};

const initialState: UnifiedJobCreatorState = {
  currentStep: 1,
  isGenerating: false,
  isSaving: false,
  formData: initialFormData,
  generatedJobPost: "",
  skillsTestData: initialSkillsTestData,
  generatedInterviewQuestions: "",
  interviewVideoMaxLength: 5,
  isEditingJobPost: false,
  isEditingInterviewQuestions: false,
  isEditMode: false,
  editingJobId: undefined
};

export const useJobCreatorState = () => {
  const [state, setState] = useState<UnifiedJobCreatorState>(initialState);

  const resetState = () => setState(initialState);

  return {
    state,
    setState,
    resetState,
    initialState
  };
};
