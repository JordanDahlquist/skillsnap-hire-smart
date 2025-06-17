
export interface InterviewQuestion {
  id: string;
  question: string;
  type: 'text_response' | 'video_response' | 'behavioral' | 'technical';
  required: boolean;
  order: number;
  videoMaxLength?: number; // in minutes, for video responses
  evaluationCriteria?: string;
  candidateInstructions?: string;
}

export interface InterviewQuestionsData {
  questions: InterviewQuestion[];
  mode: 'ai_generated' | 'template_based' | 'custom';
  estimatedCompletionTime?: number;
  instructions?: string;
}

export interface InterviewQuestionTemplate {
  id: string;
  name: string;
  description: string;
  category: 'developer' | 'designer' | 'sales' | 'management' | 'general';
  questions: Omit<InterviewQuestion, 'id'>[];
  estimatedTime: number;
}

export const DEFAULT_INTERVIEW_TEMPLATES: InterviewQuestionTemplate[] = [
  {
    id: 'developer-standard',
    name: 'Software Developer',
    description: 'Standard interview questions for software development roles',
    category: 'developer',
    estimatedTime: 15,
    questions: [
      {
        question: 'Tell us about your background and what interests you about this role.',
        type: 'video_response',
        required: true,
        order: 1,
        videoMaxLength: 3,
        candidateInstructions: 'Please introduce yourself and explain your interest in this position.'
      },
      {
        question: 'Describe a challenging technical problem you solved recently.',
        type: 'video_response',
        required: true,
        order: 2,
        videoMaxLength: 5,
        evaluationCriteria: 'Look for problem-solving approach, technical depth, and communication skills.'
      },
      {
        question: 'How do you stay current with new technologies and best practices?',
        type: 'text_response',
        required: false,
        order: 3,
        candidateInstructions: 'Please provide specific examples of resources, communities, or practices you use.'
      }
    ]
  },
  {
    id: 'general-standard',
    name: 'General Position',
    description: 'Standard interview questions suitable for any role',
    category: 'general',
    estimatedTime: 10,
    questions: [
      {
        question: 'Tell us about yourself and why you\'re interested in this position.',
        type: 'video_response',
        required: true,
        order: 1,
        videoMaxLength: 3
      },
      {
        question: 'What are your key strengths and how do they relate to this role?',
        type: 'video_response',
        required: true,
        order: 2,
        videoMaxLength: 3
      },
      {
        question: 'Where do you see yourself in 3-5 years?',
        type: 'text_response',
        required: false,
        order: 3
      }
    ]
  }
];
