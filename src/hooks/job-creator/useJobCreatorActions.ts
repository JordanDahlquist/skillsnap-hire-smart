
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
  setSkillsTestViewState: (viewState) => setState((prev: any) => ({ ...prev, skillsTestViewState: viewState })),
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
      maxQuestions: 10,
      mode: 'ai_generated'
    };
    if (job.generated_test) {
      try {
        const parsed = JSON.parse(job.generated_test);
        parsedSkillsTestData = {
          questions: parsed.questions || [],
          maxQuestions: parsed.maxQuestions || 10,
          mode: parsed.mode || 'ai_generated',
          estimatedCompletionTime: parsed.estimatedCompletionTime,
          instructions: parsed.instructions
        };
      } catch (error) {
        console.error('Error parsing skills test data:', error);
        parsedSkillsTestData = {
          questions: [],
          maxQuestions: 10,
          mode: 'ai_generated'
        };
      }
    }
    
    // Benefits parsing
    const benefitsMarker = /\n\n## Benefits\n\n([\s\S]+)/;
    let benefits = "";
    let jobPost = job.generated_job_post || "";
    const benefitsMatch = jobPost.match(benefitsMarker);

    if (benefitsMatch && benefitsMatch[1]) {
      benefits = benefitsMatch[1].trim();
      jobPost = jobPost.replace(benefitsMarker, "").trim();
    }
    
    setState((prev: any) => {
      const employmentType = job.employment_type || job.role_type || "project";
      const isProjectBased = employmentType === 'project';
      
      return {
        ...prev,
        isEditMode: true,
        editingJobId: job.id,
        formData: {
          title: job.title || "",
          description: job.description || "",
          employmentType: employmentType,
          experienceLevel: job.experience_level || "intermediate",
          skills: job.required_skills || "",
          budget: isProjectBased ? (job.budget || "") : "",
          duration: job.duration || "",
          salary: !isProjectBased ? (job.budget || "") : "",
          benefits: benefits,
          location: job.location || "",
          locationType: job.location_type || "remote",
          country: job.country || "",
          state: job.state || "",
          city: job.city || "",
          companyName: job.company_name || ""
        },
        generatedJobPost: jobPost,
        skillsTestData: parsedSkillsTestData,
        skillsTestViewState: parsedSkillsTestData.questions.length > 0 ? 'editor' : 'initial',
        generatedInterviewQuestions: job.generated_interview_questions || "",
        interviewVideoMaxLength: job.interview_video_max_length || 5
      }
    });
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
