
import { UnifiedJobCreatorActions, UnifiedJobFormData } from "@/types/jobForm";
import { SkillsTestData } from "@/types/skillsAssessment";

export const createJobCreatorActions = (
  setState: React.Dispatch<React.SetStateAction<any>>
): UnifiedJobCreatorActions => ({
  setCurrentStep: (step) => setState((prev: any) => ({ ...prev, currentStep: step })),
  setIsGenerating: (loading) => setState((prev: any) => ({ ...prev, isGenerating: loading })),
  setIsSaving: (saving) => setState((prev: any) => ({ ...prev, isSaving: saving })),
  updateFormData: (field, value) => setState((prev: any) => ({
    ...prev,
    formData: { ...prev.formData, [field]: value }
  })),
  setGeneratedJobPost: (content) => setState((prev: any) => ({ ...prev, generatedJobPost: content })),
  setSkillsTestData: (data) => setState((prev: any) => ({ ...prev, skillsTestData: data })),
  setGeneratedInterviewQuestions: (content) => setState((prev: any) => ({ ...prev, generatedInterviewQuestions: content })),
  setInterviewVideoMaxLength: (length) => setState((prev: any) => ({ ...prev, interviewVideoMaxLength: length })),
  setIsEditingJobPost: (editing) => setState((prev: any) => ({ ...prev, isEditingJobPost: editing })),
  setIsEditingInterviewQuestions: (editing) => setState((prev: any) => ({ ...prev, isEditingInterviewQuestions: editing })),
  setEditMode: (isEdit, jobId) => setState((prev: any) => ({ ...prev, isEditMode: isEdit, editingJobId: jobId })),
  populateFormFromJob: (job) => {
    const budgetParts = parseBudgetRange(job.budget || "");
    
    // Parse existing skills test data
    let parsedSkillsTestData: SkillsTestData = {
      questions: [],
      maxQuestions: 10
    };
    if (job.generated_test) {
      try {
        parsedSkillsTestData = JSON.parse(job.generated_test);
      } catch (error) {
        console.error('Error parsing skills test data:', error);
        parsedSkillsTestData = {
          questions: [],
          maxQuestions: 10
        };
      }
    }
    
    setState((prev: any) => ({
      ...prev,
      isEditMode: true,
      editingJobId: job.id,
      formData: {
        title: job.title || "",
        description: job.description || "",
        employmentType: job.employment_type || job.role_type || "project",
        experienceLevel: job.experience_level || "intermediate",
        skills: job.required_skills || "",
        budget: job.budget || "",
        duration: job.duration || "",
        location: job.location || "",
        locationType: job.location_type || "remote",
        country: job.country || "",
        state: job.state || "",
        city: job.city || "",
        companyName: job.company_name || ""
      },
      generatedJobPost: job.generated_job_post || "",
      skillsTestData: parsedSkillsTestData,
      generatedInterviewQuestions: job.generated_interview_questions || "",
      interviewVideoMaxLength: job.interview_video_max_length || 5
    }));
  }
});

// Helper function to parse budget range
const parseBudgetRange = (budget: string) => {
  if (!budget) return { min: "", max: "" };
  const rangeMatch = budget.match(/^(.+?)\s*-\s*(.+)$/);
  if (rangeMatch) {
    return { min: rangeMatch[1].trim(), max: rangeMatch[2].trim() };
  }
  const upToMatch = budget.match(/^Up to (.+)$/i);
  if (upToMatch) {
    return { min: "", max: upToMatch[1].trim() };
  }
  return { min: budget, max: "" };
};
