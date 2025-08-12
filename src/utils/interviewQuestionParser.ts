
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

  // 1) Try to parse the common "Question N: Title" pattern first (preferred)
  const questions: InterviewQuestion[] = [];
  let currentOrder = 1;
  let estimatedTime = 0;
  let instructions = "";

  const rawLines = markdownText.split(/\r?\n/);
  const startRegex = /^\s*\**\s*Question\s*(\d+)\s*:\s*(.*?)\**\s*$/i;
  const lookingForRegex = /^\*?\s*What\s+we'?re\s+looking\s+for\s*:\s*(.*?)\*?$/i;

  // Find blocks that start with "Question n:"
  const starts: number[] = [];
  rawLines.forEach((line, idx) => {
    if (startRegex.test(line)) starts.push(idx);
  });

  const pushQuestion = (qText: string, evalText?: string) => {
    const qt = (qText || '').trim();
    if (!qt) return; // skip empties
    questions.push({
      id: `q-${currentOrder}`,
      question: qt,
      type: 'video_response',
      required: currentOrder <= 3,
      order: currentOrder,
      videoMaxLength: 3,
      evaluationCriteria: evalText?.trim(),
      candidateInstructions: 'Please record a video response answering this question clearly and concisely.'
    });
    currentOrder++;
  };

  if (starts.length > 0) {
    for (let s = 0; s < starts.length; s++) {
      const start = starts[s];
      const end = s + 1 < starts.length ? starts[s + 1] : rawLines.length;

      const startMatch = rawLines[start].match(startRegex);
      const titleFromHeader = startMatch?.[2]?.trim() || '';

      // Extract question text: first non-empty line that is not the evaluation line
      let questionText = '';
      let evaluationText = '';

      for (let i = start + 1; i < end; i++) {
        const line = rawLines[i].trim();
        if (!line) continue;
        const lookMatch = line.match(lookingForRegex);
        if (lookMatch) {
          evaluationText = lookMatch[1] || line.replace(/\*|_/g, '').replace(/^What we'?re looking for:\s*/i, '');
          continue;
        }
        // Skip markdown emphasis/bullets-only lines
        if (/^\*{1,2}.*\*{1,2}$/.test(line)) continue;
        if (/^\*\s*$/.test(line)) continue;
        // First eligible line becomes the question text
        if (!questionText) questionText = line.replace(/^[-*]\s*/, '');
      }

      // If the block had no explicit question sentence, fall back to the header title
      if (!questionText && titleFromHeader) questionText = titleFromHeader;

      pushQuestion(questionText, evaluationText);
      if (questions.length >= 5) break; // cap to 5
    }
  }

  // 2) If none parsed, fall back to numbered/bulleted list parsing
  if (questions.length === 0) {
    const lines = markdownText.split('\n').map(line => line.trim()).filter(line => line);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip headers and metadata
      if (line.startsWith('#') || line.toLowerCase().includes('estimated time')) {
        if (line.toLowerCase().includes('estimated time')) {
          const timeMatch = line.match(/(\d+)/);
          if (timeMatch) estimatedTime = parseInt(timeMatch[1]);
        }
        continue;
      }

      // Numbered questions (1., 2., etc.) or bullet points
      const questionMatch = line.match(/^(\d+)\.\s*(.+)$/) || line.match(/^[-*]\s*(.+)$/);
      if (questionMatch) {
        const questionText = (questionMatch[2] || questionMatch[1]).trim();
        pushQuestion(questionText);
        if (questions.length >= 5) break;
      }
    }
  }

  // 3) If still none, last resort: block-based fallback
  if (questions.length === 0) {
    console.log('No questions parsed with structured formats, using block fallback');
    const fallbackQuestions = markdownText
      .split(/\n\s*\n/)
      .map(block => block.trim())
      .filter(block => block && block.length > 10)
      .slice(0, 5)
      .map((qText, idx) => ({
        id: `q-${idx + 1}`,
        question: qText.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, ''),
        type: 'video_response' as const,
        required: idx < 2,
        order: idx + 1,
        videoMaxLength: 2,
        candidateInstructions: 'Please record a video response answering this question clearly and concisely.'
      }));
    questions.push(...fallbackQuestions);
  }

  // Default estimated time if not found
  if (estimatedTime === 0) {
    estimatedTime = Math.max(questions.length * 3, 9); // ~3 mins per Q, min 9
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
