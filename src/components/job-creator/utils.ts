
import { UnifiedJobFormData } from "@/types/jobForm";
import { supabase } from "@/integrations/supabase/client";

export const validateStep = (step: number, formData: UnifiedJobFormData): boolean => {
  switch (step) {
    case 1:
      return Boolean(formData.jobOverview?.trim());
    case 2:
      return Boolean(formData.title && formData.companyName && formData.locationType);
    default:
      return true;
  }
};

export const getStepTitle = (step: number): string => {
  const titles = {
    1: "Job Overview",
    2: "Job Details", 
    3: "Job Post",
    4: "Skills Test",
    5: "Interview Questions",
    6: "Review & Publish"
  };
  return titles[step as keyof typeof titles] || "Unknown Step";
};

export const createJobFromFormData = (formData: UnifiedJobFormData, additionalData: any = {}) => {
  return {
    title: formData.title,
    description: formData.description,
    company_name: formData.companyName,
    company_website: formData.companyWebsite,
    employment_type: formData.employmentType,
    experience_level: formData.experienceLevel,
    required_skills: formData.skills,
    budget: formData.employmentType === 'project' ? formData.budget : formData.salary,
    duration: formData.duration,
    benefits: formData.benefits,
    location: formData.location,
    location_type: formData.locationType,
    country: formData.country,
    state: formData.state,
    city: formData.city,
    ...additionalData
  };
};

export const generateJobPost = async (
  formData: UnifiedJobFormData,
  uploadedPdfContent: string | null,
  useOriginalPdf: boolean | null
) => {
  // If user chose to use original PDF content, return it directly
  if (uploadedPdfContent && useOriginalPdf === true) {
    console.log('Using original PDF content as job post');
    return { jobPost: uploadedPdfContent };
  }

  const jobDataPayload = {
    title: formData.title,
    employmentType: formData.employmentType,
    experienceLevel: formData.experienceLevel,
    duration: formData.duration,
    budget: formData.budget,
    skills: formData.skills,
    location: formData.location,
    description: formData.description,
    // Include PDF content for AI rewriting if available
    pdfContent: uploadedPdfContent && useOriginalPdf === false ? uploadedPdfContent : null
  };

  console.log('Sending job data to AI:', jobDataPayload);

  const { data, error } = await supabase.functions.invoke('generate-job-content', {
    body: {
      type: 'job-post',
      jobData: jobDataPayload
    }
  });

  if (error) throw error;
  return data;
};

export const generateSkillsTest = async (existingJobPost: string) => {
  const { data, error } = await supabase.functions.invoke('generate-job-content', {
    body: {
      type: 'skills-test',
      existingJobPost
    }
  });

  if (error) throw error;
  return data;
};

export const generateInterviewQuestions = async (
  existingJobPost: string, 
  existingSkillsTest: string,
  formData: UnifiedJobFormData
) => {
  const { data, error } = await supabase.functions.invoke('generate-job-content', {
    body: {
      type: 'interview-questions',
      existingJobPost,
      existingSkillsTest,
      jobData: {
        title: formData.title,
        employmentType: formData.employmentType,
        experienceLevel: formData.experienceLevel,
        skills: formData.skills,
        description: formData.description
      }
    }
  });

  if (error) throw error;
  return data;
};

export const saveJob = async (
  userId: string,
  formData: UnifiedJobFormData,
  generatedJobPost: string,
  generatedSkillsTest: string,
  generatedInterviewQuestions: string,
  interviewVideoMaxLength: number,
  status: 'draft' | 'active'
) => {
  const { error } = await supabase
    .from('jobs')
    .insert({
      user_id: userId,
      title: formData.title,
      description: formData.description,
      role_type: formData.employmentType,
      employment_type: formData.employmentType,
      experience_level: formData.experienceLevel,
      required_skills: formData.skills,
      budget: formData.budget,
      duration: formData.duration,
      location_type: formData.locationType,
      country: formData.country,
      state: formData.state,
      city: formData.city,
      company_name: formData.companyName,
      generated_job_post: generatedJobPost,
      generated_test: generatedSkillsTest,
      generated_interview_questions: generatedInterviewQuestions,
      interview_video_max_length: interviewVideoMaxLength,
      status: status
    });

  if (error) throw error;
  return true;
};

export const getInitialFormData = (): UnifiedJobFormData => ({
  jobOverview: "",
  companyWebsite: "",
  title: "",
  description: "",
  employmentType: "full-time",
  experienceLevel: "mid-level",
  skills: "",
  budget: "",
  duration: "",
  salary: "",
  benefits: "",
  location: "remote",
  locationType: "remote",
  country: "",
  state: "",
  city: "",
  companyName: ""
});
