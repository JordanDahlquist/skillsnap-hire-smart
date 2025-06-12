
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/types";
import { ApplicationPageLayout } from "./ApplicationPageLayout";
import { ApplicationProgress } from "./ApplicationProgress";
import { JobOverviewSection } from "./JobOverviewSection";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { SkillsAssessment } from "./SkillsAssessment";
import { VideoInterview } from "./VideoInterview";
import { ApplicationReview } from "./ApplicationReview";
import { toast } from "sonner";

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  portfolioUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  resumeFile: File | null;
  coverLetter: string;
}

export const NewJobApplication = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Form data
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    portfolioUrl: '',
    linkedinUrl: '',
    githubUrl: '',
    resumeFile: null,
    coverLetter: ''
  });
  
  const [skillsResponses, setSkillsResponses] = useState<Array<{ question: string; answer: string }>>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Fetch job data
  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) {
        toast.error('No job ID provided');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .single();
        
        if (error) throw error;
        setJob(data);
      } catch (error) {
        console.error('Error fetching job:', error);
        toast.error('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  if (loading) {
    return (
      <ApplicationPageLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </ApplicationPageLayout>
    );
  }

  if (!job) {
    return (
      <ApplicationPageLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h1>
          <p className="text-gray-600">The job you're looking for doesn't exist or is no longer available.</p>
        </div>
      </ApplicationPageLayout>
    );
  }

  // Determine steps based on job configuration
  const steps = ['Overview'];
  if (job.status === 'active') {
    steps.push('Personal Info');
    if (job.generated_test) steps.push('Skills Test');
    if (job.generated_interview_questions) steps.push('Video Interview');
    steps.push('Review & Submit');
  }

  const stepLabels = steps;
  const completedSteps = Array(steps.length).fill(false);
  
  // Mark completed steps
  if (currentStep > 0) completedSteps[0] = true; // Overview
  if (currentStep > 1 && personalInfo.fullName && personalInfo.email && personalInfo.resumeFile) {
    completedSteps[1] = true; // Personal Info
  }
  
  let stepIndex = 2;
  if (job.generated_test) {
    if (currentStep > stepIndex && skillsResponses.length > 0) {
      completedSteps[stepIndex] = true;
    }
    stepIndex++;
  }
  
  if (job.generated_interview_questions) {
    if (currentStep > stepIndex && videoUrl) {
      completedSteps[stepIndex] = true;
    }
    stepIndex++;
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const renderCurrentStep = () => {
    if (currentStep === 0) {
      return <JobOverviewSection job={job} onContinue={nextStep} />;
    }
    
    if (job.status !== 'active') {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Applications Not Available</h2>
          <p className="text-gray-600">This job is not currently accepting applications.</p>
        </div>
      );
    }

    let stepIndex = 1;
    
    if (currentStep === stepIndex) {
      return (
        <PersonalInfoForm
          data={personalInfo}
          onChange={setPersonalInfo}
          onNext={nextStep}
          onBack={prevStep}
        />
      );
    }
    stepIndex++;
    
    if (job.generated_test && currentStep === stepIndex) {
      return (
        <SkillsAssessment
          testContent={job.generated_test}
          responses={skillsResponses}
          onChange={setSkillsResponses}
          onNext={nextStep}
          onBack={prevStep}
        />
      );
    }
    
    if (job.generated_test) stepIndex++;
    
    if (job.generated_interview_questions && currentStep === stepIndex) {
      return (
        <VideoInterview
          questions={job.generated_interview_questions}
          maxLength={job.interview_video_max_length || 5}
          videoUrl={videoUrl}
          onChange={setVideoUrl}
          onNext={nextStep}
          onBack={prevStep}
        />
      );
    }
    
    if (job.generated_interview_questions) stepIndex++;
    
    if (currentStep === stepIndex) {
      return (
        <ApplicationReview
          job={job}
          personalInfo={personalInfo}
          skillsResponses={skillsResponses}
          videoUrl={videoUrl}
          onBack={prevStep}
          onSubmit={() => {}}
        />
      );
    }

    return null;
  };

  return (
    <ApplicationPageLayout>
      {job.status === 'active' && (
        <ApplicationProgress
          currentStep={currentStep}
          totalSteps={steps.length}
          stepLabels={stepLabels}
          completedSteps={completedSteps}
        />
      )}
      
      {renderCurrentStep()}
    </ApplicationPageLayout>
  );
};
