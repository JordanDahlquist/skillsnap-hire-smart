
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/types";
import { PersonalInfo } from "@/types/jobForm";
import { ApplicationPageLayout } from "./ApplicationPageLayout";
import { ApplicationProgress } from "./ApplicationProgress";
import { JobOverviewSection } from "./JobOverviewSection";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { SkillsAssessmentStep } from "./steps/SkillsAssessmentStep";
import { VideoInterview } from "./VideoInterview";
import { ApplicationReview } from "./ApplicationReview";
import { toast } from "sonner";

interface ApplicationFormData {
  personalInfo: PersonalInfo;
  skillsTestResponses?: any[];
  videoUrl?: string | null;
}

export const NewJobApplication = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Unified form data
  const [formData, setFormData] = useState<ApplicationFormData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      portfolioUrl: '',
      linkedinUrl: '',
      githubUrl: '',
      resumeFile: null,
      resumeUrl: null,
      coverLetter: ''
    }
  });

  // Validation states
  const [stepValidations, setStepValidations] = useState<{ [key: number]: boolean }>({});

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
        console.log('Fetched job data:', {
          id: data.id,
          title: data.title,
          hasSkillsTest: !!data.generated_test,
          hasInterviewQuestions: !!data.generated_interview_questions,
          interviewQuestionsLength: data.generated_interview_questions?.length || 0
        });
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
    if (job.generated_test) {
      console.log('Adding Skills Test step');
      steps.push('Skills Test');
    }
    if (job.generated_interview_questions && job.generated_interview_questions.trim()) {
      console.log('Adding Video Interview step', { questionsLength: job.generated_interview_questions.length });
      steps.push('Video Interview');
    }
    steps.push('Review & Submit');
  }

  console.log('Application steps:', steps);

  const stepLabels = steps;
  
  // Fix the completion logic: mark all steps before current step as completed
  const completedSteps = Array(steps.length).fill(false);
  
  // Mark all steps before the current step as completed
  for (let i = 0; i < currentStep; i++) {
    completedSteps[i] = true;
  }
  
  // Also mark any specifically validated steps as completed
  Object.keys(stepValidations).forEach(stepIndex => {
    if (stepValidations[parseInt(stepIndex)]) {
      completedSteps[parseInt(stepIndex)] = true;
    }
  });

  const updateFormData = (updates: Partial<ApplicationFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const updateStepValidation = (step: number, isValid: boolean) => {
    console.log('Step validation update:', { step, isValid });
    setStepValidations(prev => ({ ...prev, [step]: isValid }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      console.log('Moving to next step:', currentStep + 1);
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      console.log('Moving to previous step:', currentStep - 1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderCurrentStep = () => {
    console.log('Rendering step:', currentStep, 'of', steps.length, 'steps:', steps);
    
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
    
    // Personal Info Step
    if (currentStep === stepIndex) {
      console.log('Rendering Personal Info step');
      return (
        <PersonalInfoForm
          data={formData.personalInfo}
          onChange={(personalInfo) => updateFormData({ personalInfo })}
          onNext={nextStep}
          onBack={prevStep}
        />
      );
    }
    stepIndex++;
    
    // Skills Test Step (if enabled)
    if (job.generated_test && currentStep === stepIndex) {
      console.log('Rendering Skills Assessment step');
      return (
        <SkillsAssessmentStep
          job={job}
          formData={formData}
          onFormDataChange={updateFormData}
          onValidationChange={(isValid) => updateStepValidation(stepIndex, isValid)}
          onNext={nextStep}
          onBack={prevStep}
        />
      );
    }
    
    if (job.generated_test) stepIndex++;
    
    // Video Interview Step (if enabled)
    if (job.generated_interview_questions && job.generated_interview_questions.trim() && currentStep === stepIndex) {
      console.log('Rendering Video Interview step', { currentStep, stepIndex });
      return (
        <VideoInterview
          questions={job.generated_interview_questions}
          maxLength={job.interview_video_max_length || 5}
          videoUrl={formData.videoUrl}
          onChange={(videoUrl) => updateFormData({ videoUrl })}
          onNext={nextStep}
          onBack={prevStep}
        />
      );
    }
    
    if (job.generated_interview_questions && job.generated_interview_questions.trim()) stepIndex++;
    
    // Review & Submit Step
    if (currentStep === stepIndex) {
      console.log('Rendering Review & Submit step');
      return (
        <ApplicationReview
          job={job}
          personalInfo={formData.personalInfo}
          skillsResponses={formData.skillsTestResponses || []}
          videoUrl={formData.videoUrl}
          onBack={prevStep}
          onSubmit={() => {
            console.log('Application submitted successfully');
            // Application submission is handled within ApplicationReview
          }}
        />
      );
    }

    console.log('No matching step found for currentStep:', currentStep);
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
