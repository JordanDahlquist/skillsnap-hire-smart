import { UnifiedJobCreatorActions, UnifiedJobFormData, CompanyAnalysisData } from "@/types/jobForm";
import { SkillsTestData } from "@/types/skillsAssessment";
import { InterviewQuestionsData } from "@/types/interviewQuestions";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const createJobCreatorActions = (
  setState: React.Dispatch<React.SetStateAction<any>>
): UnifiedJobCreatorActions => {
  const { toast } = useToast();

  return {
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
    setInterviewQuestionsData: (data) => setState((prev: any) => ({ ...prev, interviewQuestionsData: data })),
    setInterviewQuestionsViewState: (viewState) => setState((prev: any) => ({ ...prev, interviewQuestionsViewState: viewState })),
    
    // Website analysis actions
    setIsAnalyzingWebsite: (analyzing) => setState((prev: any) => ({ ...prev, isAnalyzingWebsite: analyzing })),
    setWebsiteAnalysisData: (data) => setState((prev: any) => ({ ...prev, websiteAnalysisData: data })),
    setWebsiteAnalysisError: (error) => setState((prev: any) => ({ ...prev, websiteAnalysisError: error })),
    
    analyzeWebsite: async (url: string) => {
      setState((prev: any) => ({ 
        ...prev, 
        isAnalyzingWebsite: true, 
        websiteAnalysisError: null 
      }));
      
      try {
        console.log('Analyzing website:', url);
        const response = await supabase.functions.invoke('analyze-company-website', {
          body: { url }
        });

        if (response.error) {
          throw response.error;
        }

        const analysisData: CompanyAnalysisData = response.data;
        setState((prev: any) => ({ 
          ...prev, 
          websiteAnalysisData: analysisData,
          isAnalyzingWebsite: false 
        }));

        toast({
          title: "Website analyzed!",
          description: "Company information extracted successfully.",
        });
      } catch (error) {
        console.error('Error analyzing website:', error);
        setState((prev: any) => ({ 
          ...prev, 
          websiteAnalysisError: 'Failed to analyze website. Please try again.',
          isAnalyzingWebsite: false 
        }));
        
        toast({
          title: "Analysis failed",
          description: "Failed to analyze website. Please check the URL and try again.",
          variant: "destructive",
        });
      }
    },

    populateFormFromJob: (job) => {
      console.log('populateFormFromJob called with job:', job);
      
      if (!job) {
        console.error('No job provided to populateFormFromJob');
        return;
      }

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
          console.log('Parsed skills test data:', parsedSkillsTestData);
        } catch (error) {
          console.error('Error parsing skills test data:', error);
          parsedSkillsTestData = {
            questions: [],
            maxQuestions: 10,
            mode: 'ai_generated'
          };
        }
      }

      // Parse existing interview questions data
      let parsedInterviewQuestionsData: InterviewQuestionsData = {
        questions: [],
        maxQuestions: 10,
        mode: 'ai_generated',
        defaultVideoLength: 5
      };
      let generatedInterviewQuestions = job.generated_interview_questions || "";

      // Try to parse structured interview questions if they exist
      if (job.generated_interview_questions) {
        try {
          // Check if it's structured data (JSON)
          const parsed = JSON.parse(job.generated_interview_questions);
          if (parsed.questions && Array.isArray(parsed.questions)) {
            parsedInterviewQuestionsData = parsed;
            generatedInterviewQuestions = ""; // Clear the string version
          }
        } catch (error) {
          // It's a string, keep as is
          console.log('Interview questions are in string format');
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
      
      console.log('Updating state with job data...');
      setState((prev: any) => {
        const employmentType = job.employment_type || job.role_type || "project";
        const isProjectBased = employmentType === 'project';
        
        const newState = {
          ...prev,
          isEditMode: true,
          editingJobId: job.id,
          formData: {
            jobOverview: job.job_overview || `${job.title} at ${job.company_name}`,
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
            companyName: job.company_name || "",
            companyWebsite: job.company_website || ""
          },
          generatedJobPost: jobPost,
          skillsTestData: parsedSkillsTestData,
          skillsTestViewState: parsedSkillsTestData.questions.length > 0 ? 'editor' : 'initial',
          generatedInterviewQuestions: generatedInterviewQuestions,
          interviewQuestionsData: parsedInterviewQuestionsData,
          interviewQuestionsViewState: parsedInterviewQuestionsData.questions.length > 0 ? 'editor' : 'initial',
          interviewVideoMaxLength: job.interview_video_max_length || 5
        };
        
        console.log('New state formData:', newState.formData);
        console.log('New state generatedJobPost:', newState.generatedJobPost ? 'Has content' : 'Empty');
        console.log('New state skillsTestData:', newState.skillsTestData);
        console.log('New state interviewQuestionsData:', newState.interviewQuestionsData);
        
        return newState;
      });
    }
  };
};

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
