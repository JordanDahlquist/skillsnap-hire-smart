
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { VideoInterview } from "./VideoInterview";
import { ApplicationReview } from "./ApplicationReview";
import { ApplicationProgress } from "./ApplicationProgress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { logger } from "@/services/loggerService";

interface FormData {
  name: string;
  email: string;
  phone: string;
  location: string;
  availableStartDate: string;
  portfolioUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  resumeFile: File | null;
  coverLetter: string;
  interviewVideoUrl: string | null;
}

const ApplicationForm = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [job, setJob] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    location: "",
    availableStartDate: "",
    portfolioUrl: "",
    linkedinUrl: "",
    githubUrl: "",
    resumeFile: null,
    coverLetter: "",
    interviewVideoUrl: null,
  });

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;

      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .single();

        if (error) throw error;
        setJob(data);
      } catch (error) {
        logger.error('Error fetching job:', error);
        toast.error('Failed to load job details');
        navigate('/jobs');
      }
    };

    fetchJob();
  }, [jobId, navigate]);

  const uploadResumeFile = async (file: File): Promise<string | null> => {
    try {
      const fileName = `resume-${Date.now()}-${file.name}`;
      const filePath = `resumes/${fileName}`;

      const { data, error } = await supabase.storage
        .from('application-files')
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading resume:', error);
        return null;
      }

      return filePath;
    } catch (error) {
      console.error('Error uploading resume:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!jobId) return;

    setIsLoading(true);
    try {
      let resumeFilePath = null;
      if (formData.resumeFile) {
        resumeFilePath = await uploadResumeFile(formData.resumeFile);
        if (!resumeFilePath) {
          toast.error('Failed to upload resume');
          return;
        }
      }

      // Parse interview video responses if they exist
      let interviewVideoResponses = [];
      if (formData.interviewVideoUrl) {
        try {
          interviewVideoResponses = JSON.parse(formData.interviewVideoUrl);
        } catch (error) {
          console.error('Error parsing interview video responses:', error);
        }
      }

      const applicationData = {
        job_id: jobId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        location: formData.location || null,
        available_start_date: formData.availableStartDate || null,
        portfolio_url: formData.portfolioUrl || null,
        linkedin_url: formData.linkedinUrl || null,
        github_url: formData.githubUrl || null,
        resume_file_path: resumeFilePath,
        cover_letter: formData.coverLetter || null,
        interview_video_responses: interviewVideoResponses,
        status: 'pending',
      };

      const { error } = await supabase
        .from('applications')
        .insert([applicationData]);

      if (error) throw error;

      toast.success('Application submitted successfully!');
      navigate('/jobs');
    } catch (error) {
      logger.error('Error submitting application:', error);
      toast.error('Failed to submit application');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  if (!job) {
    return <div>Loading...</div>;
  }

  const totalSteps = job.generated_interview_questions ? 3 : 2;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <ApplicationProgress currentStep={currentStep} totalSteps={totalSteps} />
      
      <div className="mt-8">
        {currentStep === 1 && (
          <PersonalInfoForm
            formData={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
          />
        )}
        
        {currentStep === 2 && job.generated_interview_questions && (
          <VideoInterview
            questions={job.generated_interview_questions}
            maxLength={job.interview_video_max_length || 5}
            videoUrl={formData.interviewVideoUrl}
            onChange={(url) => updateFormData({ interviewVideoUrl: url })}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        
        {currentStep === (job.generated_interview_questions ? 3 : 2) && (
          <ApplicationReview
            formData={formData}
            job={job}
            onSubmit={handleSubmit}
            onBack={handleBack}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default ApplicationForm;
