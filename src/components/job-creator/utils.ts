
import { supabase } from "@/integrations/supabase/client";
import { JobFormData } from "./types";

export const generateJobPost = async (
  formData: JobFormData,
  uploadedPdfContent: string | null,
  useOriginalPdf: boolean | null
) => {
  // If user chose to use original PDF content, skip generation
  if (uploadedPdfContent && useOriginalPdf === true) {
    return { jobPost: formData.description };
  }

  const jobDataPayload = {
    title: formData.title,
    employmentType: formData.employmentType,
    experienceLevel: formData.experienceLevel,
    duration: formData.duration,
    budget: formData.budget,
    skills: formData.skills,
    location: formData.location,
    description: formData.description
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

export const saveJob = async (
  userId: string,
  formData: JobFormData,
  generatedJobPost: string,
  generatedSkillsTest: string,
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
      location_type: formData.location,
      generated_job_post: generatedJobPost,
      generated_test: generatedSkillsTest,
      status: status
    });

  if (error) throw error;
  return true;
};

export const getInitialFormData = (): JobFormData => ({
  title: "",
  description: "",
  employmentType: "full-time",
  experienceLevel: "mid-level",
  skills: "",
  budget: "",
  duration: "",
  location: "remote"
});
