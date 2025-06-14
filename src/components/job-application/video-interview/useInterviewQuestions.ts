
import { useState, useEffect } from "react";

export const useInterviewQuestions = (questions: string) => {
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);

  useEffect(() => {
    // Parse interview questions
    const parsedQuestions = questions
      .split(/\d+\.|\n-|\n\*/)
      .map(q => q.trim())
      .filter(q => q.length > 10 && !q.toLowerCase().includes('interview questions'))
      .slice(0, 5); // Limit to 5 questions
    
    setInterviewQuestions(parsedQuestions);
  }, [questions]);

  return { interviewQuestions };
};
