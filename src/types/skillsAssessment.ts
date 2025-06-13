
export interface SkillsQuestion {
  id: string;
  question: string;
  type: 'text' | 'multiple_choice' | 'file_upload';
  description?: string;
  required: boolean;
  order: number;
}

export interface SkillsTestData {
  questions: SkillsQuestion[];
  maxQuestions: number;
}

export interface SkillsResponse {
  questionId: string;
  answer: string;
  fileUrl?: string;
}
