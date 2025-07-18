
import { InterviewQuestionsData, InterviewQuestion } from "@/types/interviewQuestions";

export const parseInterviewQuestionsFromMarkdown = (markdownText: string): InterviewQuestionsData => {
  console.log('Parsing interview questions from markdown:', markdownText);
  
  if (!markdownText || typeof markdownText !== 'string') {
    console.warn('Invalid markdown text provided:', markdownText);
    return {
      questions: [],
      mode: 'ai_generated',
      estimatedCompletionTime: 0,
      instructions: ""
    };
  }

  const questions: InterviewQuestion[] = [];
  let currentOrder = 1;
  let estimatedTime = 0;
  let instructions = "";

  // Split by lines and process
  const lines = markdownText.split('\n').map(line => line.trim()).filter(line => line);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip headers and metadata
    if (line.startsWith('#') || line.startsWith('**') || line.toLowerCase().includes('estimated time')) {
      if (line.toLowerCase().includes('estimated time')) {
        // Try to extract time estimate
        const timeMatch = line.match(/(\d+)/);
        if (timeMatch) {
          estimatedTime = parseInt(timeMatch[1]);
        }
      }
      continue;
    }
    
    // Look for numbered questions (1., 2., etc.) or bullet points
    const questionMatch = line.match(/^(\d+)\.\s*(.+)$/) || line.match(/^[-*]\s*(.+)$/);
    
    if (questionMatch) {
      const questionText = questionMatch[2] || questionMatch[1];
      
      // Determine question type based on content
      let questionType: InterviewQuestion['type'] = 'video_response';
      let videoMaxLength = 2;
      
      if (questionText.toLowerCase().includes('write') || 
          questionText.toLowerCase().includes('describe in writing') ||
          questionText.toLowerCase().includes('list')) {
        questionType = 'text_response';
        videoMaxLength = undefined;
      } else if (questionText.toLowerCase().includes('technical') || 
                 questionText.toLowerCase().includes('code') ||
                 questionText.toLowerCase().includes('algorithm')) {
        questionType = 'technical';
        videoMaxLength = 3;
      } else if (questionText.toLowerCase().includes('situation') || 
                 questionText.toLowerCase().includes('example') ||
                 questionText.toLowerCase().includes('experience')) {
        questionType = 'behavioral';
        videoMaxLength = 3;
      }
      
      const question: InterviewQuestion = {
        id: `q-${currentOrder}`,
        question: questionText,
        type: questionType,
        required: currentOrder <= 3, // First 3 questions are required
        order: currentOrder,
        videoMaxLength,
        candidateInstructions: getInstructionsForType(questionType)
      };
      
      questions.push(question);
      currentOrder++;
    }
  }
  
  // If no questions were parsed, try a simpler approach
  if (questions.length === 0) {
    console.log('No questions parsed with numbered format, trying simpler parsing');
    const fallbackQuestions = markdownText
      .split(/\n\s*\n/) // Split by double newlines
      .map(block => block.trim())
      .filter(block => block && block.length > 10) // Filter out short blocks
      .slice(0, 5) // Take first 5 blocks as questions
      .map((questionText, index) => ({
        id: `q-${index + 1}`,
        question: questionText.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, ''), // Clean up formatting
        type: 'video_response' as const,
        required: index < 2,
        order: index + 1,
        videoMaxLength: 2,
        candidateInstructions: 'Please provide a clear and concise response.'
      }));
    
    questions.push(...fallbackQuestions);
  }
  
  // Set default estimated time if not found
  if (estimatedTime === 0) {
    estimatedTime = Math.max(questions.length * 2, 10); // 2 minutes per question minimum
  }
  
  console.log('Parsed questions:', questions);
  
  return {
    questions,
    mode: 'ai_generated',
    estimatedCompletionTime: estimatedTime,
    instructions: instructions || "Please answer the following questions to help us understand your qualifications and experience."
  };
};

const getInstructionsForType = (type: InterviewQuestion['type']): string => {
  switch (type) {
    case 'video_response':
      return 'Please record a video response answering this question clearly and concisely.';
    case 'text_response':
      return 'Please provide a written response to this question.';
    case 'behavioral':
      return 'Please provide a specific example from your experience using the STAR method (Situation, Task, Action, Result).';
    case 'technical':
      return 'Please explain your technical approach and reasoning clearly.';
    default:
      return 'Please provide a clear and detailed response.';
  }
};
