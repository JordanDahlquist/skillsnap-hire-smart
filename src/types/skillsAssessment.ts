
export interface SkillsQuestion {
  id: string;
  question: string;
  type: 'text' | 'long_text' | 'multiple_choice' | 'file_upload' | 'video_upload' | 'video_link' | 'portfolio_link' | 'code_submission' | 'pdf_upload' | 'url_submission';
  candidateInstructions?: string;
  evaluationGuidelines?: string;
  scoringCriteria?: string;
  exampleResponse?: string;
  required: boolean;
  order: number;
  
  // Type-specific configurations
  characterLimit?: number;
  timeLimit?: number; // in minutes for video responses
  allowedFileTypes?: string[]; // for file uploads
  maxFileSize?: number; // in MB
  multipleChoice?: {
    options: string[];
    allowMultiple: boolean;
  };
}

export interface SkillsTestData {
  questions: SkillsQuestion[];
  maxQuestions: number;
  mode: 'ai_generated' | 'custom_builder';
  estimatedCompletionTime?: number; // in minutes
  instructions?: string; // Overall test instructions
}

export interface SkillsTestTemplate {
  id: string;
  name: string;
  description: string;
  category: 'developer' | 'designer' | 'marketing' | 'sales' | 'general' | 'custom' | 'creative' | 'administrative' | 'content' | 'management' | 'support' | 'analytical' | 'hr' | 'finance' | 'advertising';
  questions: Omit<SkillsQuestion, 'id'>[];
  estimatedTime: number;
  icon?: string;
}

export interface SkillsResponse {
  questionId: string;
  answer: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  submittedAt?: string;
}
