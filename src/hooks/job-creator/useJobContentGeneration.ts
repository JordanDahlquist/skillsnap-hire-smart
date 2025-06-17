import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { SkillsTestData } from "@/types/skillsAssessment";
import { UnifiedJobFormData, CompanyAnalysisData, WritingTone } from "@/types/jobForm";
import { InterviewQuestionsData, InterviewQuestion } from "@/types/interviewQuestions";

export const useJobContentGeneration = () => {
  const { toast } = useToast();

  const generateJobPost = async (
    formData: any, 
    setIsGenerating: (loading: boolean) => void, 
    setGeneratedJobPost: (content: string) => void,
    websiteAnalysisData?: any,
    writingTone?: WritingTone
  ) => {
    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke('generate-job-content', {
        body: {
          type: 'job-post',
          jobData: formData,
          websiteAnalysisData: websiteAnalysisData,
          writingTone: writingTone
        }
      });

      if (response.error) throw response.error;
      
      setGeneratedJobPost(response.data.jobPost);
      toast({
        title: "Job post generated!",
        description: "Your job post has been generated successfully.",
      });
    } catch (error) {
      console.error('Error generating job post:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate job post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSkillsQuestions = async (
    formData: UnifiedJobFormData,
    generatedJobPost: string, 
    setIsGenerating: (loading: boolean) => void, 
    setSkillsTestData: (data: SkillsTestData) => void,
    websiteAnalysisData?: CompanyAnalysisData | null
  ) => {
    setIsGenerating(true);
    try {
      console.log('Generating skills questions with full context:', {
        formData,
        generatedJobPost: generatedJobPost.substring(0, 200) + '...',
        websiteAnalysisData
      });
      
      const response = await supabase.functions.invoke('generate-job-content', {
        body: {
          type: 'skills-test',
          formData: formData,
          existingJobPost: generatedJobPost,
          websiteAnalysisData: websiteAnalysisData
        }
      });

      if (response.error) {
        console.error('Edge function error:', response.error);
        throw response.error;
      }
      
      console.log('Enhanced skills assessment response:', response.data);
      
      // Handle the enhanced response structure
      let skillsTestData: SkillsTestData;
      
      if (response.data.skillsTest && response.data.skillsTest.questions) {
        // Post-process questions to fix titles and instructions
        const processedQuestions = response.data.skillsTest.questions.map((q: any, index: number) => {
          // Clean up the title - should be short and concise
          let cleanTitle = q.title || q.question || `Challenge ${index + 1}`;
          
          // If title is too long (more than 60 characters), truncate and move excess to instructions
          if (cleanTitle.length > 60) {
            const words = cleanTitle.split(' ');
            let shortTitle = '';
            let remainingContent = '';
            
            // Build title word by word until we hit reasonable length
            for (let i = 0; i < words.length; i++) {
              if ((shortTitle + words[i]).length <= 60) {
                shortTitle += (shortTitle ? ' ' : '') + words[i];
              } else {
                remainingContent = words.slice(i).join(' ');
                break;
              }
            }
            
            cleanTitle = shortTitle;
            
            // Add remaining content to instructions if there's excess
            if (remainingContent && !q.candidateInstructions?.includes(remainingContent)) {
              q.candidateInstructions = remainingContent + 
                (q.candidateInstructions ? '\n\n' + q.candidateInstructions : '');
            }
          }
          
          // Ensure title doesn't end with periods or colons
          cleanTitle = cleanTitle.replace(/[.:]$/, '');
          
          return {
            id: crypto.randomUUID(),
            title: cleanTitle,
            question: q.question || q.challenge || cleanTitle,
            type: q.type || 'text',
            candidateInstructions: q.candidateInstructions || q.instructions,
            evaluationGuidelines: q.evaluationGuidelines,
            scoringCriteria: q.scoringCriteria,
            exampleResponse: q.exampleResponse,
            required: q.required !== false,
            order: index + 1,
            characterLimit: q.characterLimit,
            timeLimit: q.timeLimit,
            allowedFileTypes: q.allowedFileTypes,
            maxFileSize: q.maxFileSize
          };
        });

        skillsTestData = {
          questions: processedQuestions,
          maxQuestions: response.data.skillsTest.maxQuestions || 5,
          mode: 'ai_generated',
          estimatedCompletionTime: response.data.skillsTest.estimatedCompletionTime || 30,
          instructions: response.data.skillsTest.instructions || 'Complete the following skills assessment challenges to demonstrate your qualifications for this role.'
        };
      } else if (response.data.questions && Array.isArray(response.data.questions)) {
        // Fallback for simple questions array
        skillsTestData = {
          questions: response.data.questions.map((q: any, index: number) => ({
            id: crypto.randomUUID(),
            title: `Challenge ${index + 1}`,
            question: typeof q === 'string' ? q : q.question || q.text || '',
            type: 'text' as const,
            required: true,
            order: index + 1
          })),
          maxQuestions: 10,
          mode: 'ai_generated'
        };
      } else {
        throw new Error('Invalid response format from enhanced skills test generation');
      }
      
      setSkillsTestData(skillsTestData);
      toast({
        title: "Skills assessment generated!",
        description: `${skillsTestData.questions.length} creative skills challenges have been generated successfully.`,
      });
    } catch (error) {
      console.error('Error generating skills questions:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate skills assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateInterviewQuestions = async (
    formData: any,
    generatedJobPost: string,
    skillsTestData: SkillsTestData,
    setIsGenerating: (loading: boolean) => void,
    setInterviewQuestionsData: (data: InterviewQuestionsData) => void,
    setInterviewQuestionsViewState: (viewState: 'initial' | 'editor' | 'preview') => void
  ) => {
    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke('generate-job-content', {
        body: {
          type: 'interview-questions',
          jobData: formData,
          existingJobPost: generatedJobPost,
          existingSkillsTest: skillsTestData.questions.length > 0 ? JSON.stringify(skillsTestData) : ""
        }
      });

      if (response.error) throw response.error;
      
      // Parse the AI-generated text into structured InterviewQuestion objects
      const generatedText = response.data.questions;
      console.log('Raw AI response for interview questions:', generatedText);
      
      const parsedQuestions = parseInterviewQuestionsFromText(generatedText);
      console.log('Parsed interview questions:', parsedQuestions);
      
      // Set the structured data directly into the questions builder
      const interviewQuestionsData: InterviewQuestionsData = {
        questions: parsedQuestions,
        mode: 'ai_generated',
        estimatedCompletionTime: parsedQuestions.length * 5, // Estimate 5 minutes per question
        instructions: 'Please answer the following interview questions to help us better understand your qualifications and fit for this role.'
      };
      
      setInterviewQuestionsData(interviewQuestionsData);
      
      // Switch to editor view to show the pre-filled questions builder
      setInterviewQuestionsViewState('editor');
      
      toast({
        title: "Interview questions generated!",
        description: `${parsedQuestions.length} interview questions have been generated and added to your questions builder.`,
      });
    } catch (error) {
      console.error('Error generating interview questions:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate interview questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateJobPost,
    generateSkillsQuestions,
    generateInterviewQuestions
  };
};

// Enhanced helper function to parse AI-generated text into structured InterviewQuestion objects
const parseInterviewQuestionsFromText = (text: string): InterviewQuestion[] => {
  const questions: InterviewQuestion[] = [];
  
  console.log('Parsing interview questions from text:', text.substring(0, 200) + '...');
  
  // Clean the text first - remove excessive whitespace and normalize line breaks
  const cleanedText = text.trim().replace(/\r\n/g, '\n').replace(/\n\s*\n/g, '\n\n');
  
  // Enhanced parsing to handle formatted titles and content sections
  // Look for patterns like "**Question N:" or "Question N:" followed by content
  const questionBlocks = cleanedText.split(/(?:\n|^)(?:\*{0,2}\s*Question\s*\d+[.:]?\s*[^*\n]*\*{0,2})/i);
  
  // If that didn't work well, try splitting by markdown headers
  if (questionBlocks.length <= 2) {
    const headerSplit = cleanedText.split(/(?:\n|^)#{1,3}\s*[^#\n]+/);
    if (headerSplit.length > 2) {
      questionBlocks.splice(0, questionBlocks.length, ...headerSplit);
    }
  }
  
  // If still no good results, try splitting by double line breaks with question indicators
  if (questionBlocks.length <= 2) {
    const paragraphSplit = cleanedText.split(/\n\n+/);
    questionBlocks.splice(0, questionBlocks.length, ...paragraphSplit);
  }
  
  console.log('Found question blocks:', questionBlocks.length, questionBlocks.map(b => b.substring(0, 50) + '...'));
  
  // Also extract titles that might have been split out
  const titleMatches = cleanedText.match(/(?:\*{0,2}\s*Question\s*\d+[.:]?\s*[^*\n]*\*{0,2})/gi) || [];
  console.log('Found titles:', titleMatches);
  
  questionBlocks.forEach((block, index) => {
    const cleanBlock = block.trim();
    if (!cleanBlock || cleanBlock.length < 10) return;
    
    // Try to get the corresponding title
    let questionTitle = '';
    if (titleMatches[index]) {
      questionTitle = titleMatches[index].replace(/\*+/g, '').replace(/Question\s*\d+[.:]?\s*/i, '').trim();
    }
    
    console.log(`Processing block ${index}:`, cleanBlock.substring(0, 100) + '...');
    
    // Split the block into different sections
    const sections = parseQuestionSections(cleanBlock);
    
    // Extract the main question text
    let questionText = sections.question || cleanBlock.split('\n')[0] || cleanBlock;
    
    // Clean up the question text - remove formatting and get the core question
    questionText = questionText
      .replace(/^\*+|\*+$/g, '') // Remove asterisks
      .replace(/^[:\-\s]+|[:\-\s]+$/g, '') // Remove colons, dashes, spaces
      .replace(/^\d+\.\s*/, '') // Remove numbering
      .trim();
    
    // Validate that we have a real question
    if (questionText.length < 15) {
      console.log('Skipping short question text:', questionText);
      return;
    }
    
    // Ensure it looks like a question
    const hasQuestionWords = /\b(what|how|why|when|where|tell|describe|explain|discuss|share|can you)\b/i.test(questionText);
    const endsWithQuestionMark = questionText.endsWith('?');
    
    if (!hasQuestionWords && !endsWithQuestionMark && questionText.length < 50) {
      console.log('Skipping non-question text:', questionText);
      return;
    }
    
    // Determine question type based on content
    let questionType: InterviewQuestion['type'] = 'video_response';
    let videoMaxLength = 5;
    
    if (questionText.toLowerCase().includes('technical') || 
        questionText.toLowerCase().includes('code') ||
        questionText.toLowerCase().includes('implement') ||
        questionText.toLowerCase().includes('algorithm')) {
      questionType = 'technical';
    } else if (questionText.toLowerCase().includes('behavior') ||
               questionText.toLowerCase().includes('situation') ||
               questionText.toLowerCase().includes('experience') ||
               questionText.toLowerCase().includes('challenge') ||
               questionText.toLowerCase().includes('conflict')) {
      questionType = 'behavioral';
    } else if (questionText.toLowerCase().includes('write') ||
               questionText.toLowerCase().includes('describe in detail') ||
               questionText.toLowerCase().includes('explain your approach')) {
      questionType = 'text_response';
    }
    
    // Adjust video length based on question complexity
    if (questionText.length > 200 || questionText.toLowerCase().includes('detailed')) {
      videoMaxLength = 10;
    } else if (questionText.length < 100) {
      videoMaxLength = 3;
    }
    
    const newQuestion: InterviewQuestion = {
      id: crypto.randomUUID(),
      question: questionText,
      type: questionType,
      required: index < 3, // Make first 3 questions required
      order: index + 1,
      videoMaxLength: questionType === 'video_response' ? videoMaxLength : undefined,
      candidateInstructions: sections.candidateInstructions || undefined,
      evaluationCriteria: sections.evaluationCriteria || undefined
    };
    
    console.log('Created structured question:', newQuestion);
    questions.push(newQuestion);
  });
  
  // If we couldn't parse any questions, create a fallback
  if (questions.length === 0) {
    console.log('No questions parsed, creating fallback');
    const fallbackQuestion = cleanedText.length > 20 ? cleanedText : 'Tell us about your interest in this position and relevant experience.';
    
    questions.push({
      id: crypto.randomUUID(),
      question: fallbackQuestion,
      type: 'video_response',
      required: true,
      order: 1,
      videoMaxLength: 5
    });
  }
  
  console.log('Final parsed questions:', questions);
  return questions;
};

// Helper function to parse different sections within a question block
const parseQuestionSections = (block: string) => {
  const sections = {
    question: '',
    candidateInstructions: '',
    evaluationCriteria: ''
  };
  
  // Split by common section indicators
  const lines = block.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let currentSection = 'question';
  let questionLines: string[] = [];
  let instructionLines: string[] = [];
  let criteriaLines: string[] = [];
  
  for (const line of lines) {
    // Check for evaluation criteria indicators
    if (/(?:what we're looking for|evaluation|criteria|look for|assess|evaluate)[:*]/i.test(line)) {
      currentSection = 'criteria';
      // If this line has content after the indicator, add it
      const content = line.replace(/^[^:]*[:*]\s*/, '').trim();
      if (content) criteriaLines.push(content);
      continue;
    }
    
    // Check for candidate instruction indicators
    if (/(?:please|make sure|include|instructions|guidance|tips|remember|note)[:*]/i.test(line) ||
        /^(?:please|make sure|include|remember|note)\b/i.test(line)) {
      currentSection = 'instructions';
      // If this line has content after the indicator, add it
      const content = line.replace(/^[^:]*[:*]\s*/, '').trim();
      if (content) instructionLines.push(content);
      continue;
    }
    
    // Add content to current section
    if (currentSection === 'question') {
      questionLines.push(line);
    } else if (currentSection === 'instructions') {
      instructionLines.push(line);
    } else if (currentSection === 'criteria') {
      criteriaLines.push(line);
    }
  }
  
  // Clean up and assign sections
  sections.question = questionLines.join(' ').trim();
  sections.candidateInstructions = instructionLines.length > 0 ? instructionLines.join(' ').trim() : '';
  sections.evaluationCriteria = criteriaLines.length > 0 ? criteriaLines.join(' ').trim() : '';
  
  // If we have "What we're looking for" content in the question, move it to criteria
  const questionText = sections.question;
  const lookingForMatch = questionText.match(/(.+?)[\n\s]*(?:\*?what we're looking for[\s\S]*)/i);
  if (lookingForMatch) {
    sections.question = lookingForMatch[1].trim();
    if (!sections.evaluationCriteria) {
      const criteriaText = questionText.match(/(?:\*?what we're looking for[:*]?\s*)([\s\S]+)/i);
      if (criteriaText) {
        sections.evaluationCriteria = criteriaText[1].trim();
      }
    }
  }
  
  console.log('Parsed sections:', sections);
  return sections;
};
