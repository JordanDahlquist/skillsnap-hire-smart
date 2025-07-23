
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
import { useViewTracking } from "@/hooks/useViewTracking";

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

  // Track view for this job (only for active jobs after data is loaded)
  useViewTracking(jobId || '', !loading && !!job && job.status === 'active');

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

  // Create step configuration with proper indexing
  const createStepConfiguration = () => {
    const stepConfig = [
      { name: 'Overview', type: 'overview', enabled: true }
    ];

    if (job.status === 'active') {
      stepConfig.push({ name: 'Personal Info', type: 'personal-info', enabled: true });
      
      if (job.generated_test) {
        stepConfig.push({ name: 'Skills Test', type: 'skills-test', enabled: true });
      }
      
      if (job.generated_interview_questions && job.generated_interview_questions.trim()) {
        stepConfig.push({ name: 'Video Interview', type: 'video-interview', enabled: true });
      }
      
      stepConfig.push({ name: 'Review & Submit', type: 'review-submit', enabled: true });
    }

    return stepConfig;
  };

  const stepConfig = createStepConfiguration();
  const stepLabels = stepConfig.map(step => step.name);
  
  console.log('Step configuration:', stepConfig);
  console.log('Current step:', currentStep, 'Total steps:', stepConfig.length);
  
  // Fix the completion logic: mark all steps before current step as completed
  const completedSteps = Array(stepConfig.length).fill(false);
  
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
    if (currentStep < stepConfig.length - 1) {
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
    const currentStepConfig = stepConfig[currentStep];
    
    if (!currentStepConfig) {
      console.error('Invalid step configuration for step:', currentStep);
      return null;
    }

    console.log('Rendering step:', currentStep, 'Type:', currentStepConfig.type, 'Name:', currentStepConfig.name);
    
    switch (currentStepConfig.type) {
      case 'overview':
        return <JobOverviewSection job={job} onContinue={nextStep} />;
      
      case 'personal-info':
        if (job.status !== 'active') {
          return (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Applications Not Available</h2>
              <p className="text-gray-600">This job is not currently accepting applications.</p>
            </div>
          );
        }
        return (
          <PersonalInfoForm
            data={formData.personalInfo}
            onChange={(personalInfo) => updateFormData({ personalInfo })}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      
      case 'skills-test':
        return (
          <SkillsAssessmentStep
            job={job}
            formData={formData}
            onFormDataChange={updateFormData}
            onValidationChange={(isValid) => updateStepValidation(currentStep, isValid)}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      
      case 'video-interview':
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
      
      case 'review-submit':
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
      
      default:
        console.error('Unknown step type:', currentStepConfig.type);
        return null;
    }
  };

  return (
    <ApplicationPageLayout>
      {job.status === 'active' && (
        <ApplicationProgress
          currentStep={currentStep}
          totalSteps={stepConfig.length}
          stepLabels={stepLabels}
          completedSteps={completedSteps}
        />
      )}
      
      {renderCurrentStep()}
    </ApplicationPageLayout>
  );
};
