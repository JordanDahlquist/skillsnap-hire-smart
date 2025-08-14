import { useState, useEffect } from "react";

export const useInterviewQuestions = (questions: string) => {
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);

  useEffect(() => {
    const MAX_QUESTIONS = 5;

    const normalize = (q: string) =>
      q
        .replace(/^\s+|\s+$/g, "")
        .replace(/^(?:Question\s*\d+[:.)-]?|Q\s*\d+[:.)-]?|\d+\.\s+|[-*•]\s+)/i, "")
        .replace(/\s+/g, " ")
        .trim();

    const dedupe = (arr: string[]) => Array.from(new Set(arr));

    const parseFromJson = (raw: string): string[] | null => {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed
            .map((item) =>
              typeof item === "string"
                ? normalize(item)
                : typeof item === "object" && item
                ? normalize(item.question || item.text || "")
                : ""
            )
            .filter((q) => q.length >= 3);
        }
        if (parsed && typeof parsed === "object") {
          const arr = (parsed.questions || parsed.items || parsed.prompts || []) as any[];
          if (Array.isArray(arr)) {
            return arr
              .map((item) =>
                typeof item === "string"
                  ? normalize(item)
                  : typeof item === "object" && item
                  ? normalize(item.question || item.text || "")
                  : ""
              )
              .filter((q) => q.length >= 3);
          }
        }
        return null;
      } catch {
        return null;
      }
    };

    const parseEnumeratedBlocks = (raw: string): string[] => {
      if (!raw) return [];
      
      console.log('🔍 Parsing input:', raw);
      
      const lines = raw.replace(/\r\n?/g, "\n").split(/\n/);
      
      // More specific regex to match **Question X: [Title]** format
      const questionHeaderRe = /^\*\*Question\s*\d+:\s*\[.*?\]\*\*\s*$/i;
      const separatorRe = /^-{3,}$/; // Triple dash separator
      const evaluationRe = /^\*What we're looking for:/i;
      
      const results: string[] = [];
      let currentQuestion: string[] = [];
      let insideEvaluationCriteria = false;
      
      const pushCurrentQuestion = () => {
        if (currentQuestion.length > 0) {
          const questionText = currentQuestion
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();
          
          if (questionText && questionText.length >= 20) {
            console.log('✅ Adding question:', questionText.substring(0, 100) + '...');
            results.push(questionText);
          } else {
            console.log('❌ Skipping short question:', questionText);
          }
        }
        currentQuestion = [];
        insideEvaluationCriteria = false;
      };

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines
        if (!line) continue;
        
        console.log(`Line ${i}: "${line}"`);
        
        // Check for question header
        if (questionHeaderRe.test(line)) {
          console.log('🎯 Found question header:', line);
          // Push previous question if exists
          if (currentQuestion.length > 0) {
            pushCurrentQuestion();
          }
          
          // Extract question title from header
          const titleMatch = line.match(/\[([^\]]+)\]/);
          if (titleMatch) {
            currentQuestion.push(titleMatch[1] + ':');
            console.log('📝 Starting new question with title:', titleMatch[1]);
          }
          continue;
        }
        
        // Check for separator (end of question)
        if (separatorRe.test(line)) {
          console.log('🔚 Found separator, ending current question');
          pushCurrentQuestion();
          continue;
        }
        
        // Check for evaluation criteria
        if (evaluationRe.test(line)) {
          console.log('🚫 Found evaluation criteria, skipping section');
          insideEvaluationCriteria = true;
          continue;
        }
        
        // Add content to current question if not in evaluation section
        if (currentQuestion.length > 0 && !insideEvaluationCriteria) {
          console.log('➕ Adding content to current question:', line.substring(0, 50) + '...');
          currentQuestion.push(line);
        }
      }
      
      // Push final question
      if (currentQuestion.length > 0) {
        pushCurrentQuestion();
      }
      
      console.log('🏁 Final parsed questions:', results.length);
      results.forEach((q, i) => {
        console.log(`Question ${i + 1}: ${q.substring(0, 100)}...`);
      });
      
      return results;
    };

    const parseByQuestionMarks = (raw: string): string[] => {
      const candidates = (raw.match(/[^\n?.!]*\?+/g) || [])
        .map((s) => normalize(s))
        .filter((q) => q.length >= 3);
      return dedupe(candidates);
    };

    let parsed: string[] = [];

    // 1) Try JSON
    const fromJson = parseFromJson(questions);
    if (fromJson && fromJson.length) parsed = fromJson;

    // 2) Enumerated blocks (e.g., 1., -, Question 1:, Q1:)
    if (!parsed.length) parsed = parseEnumeratedBlocks(questions || "");

    // 3) Fallback: sentences ending with '?'
    if (!parsed.length) parsed = parseByQuestionMarks(questions || "");

    // Debug logging
    console.log('Raw questions input:', questions);
    console.log('Parsed questions:', parsed);
    
    // Final cleanup: cap to 5, keep order
    setInterviewQuestions(parsed.slice(0, MAX_QUESTIONS));
  }, [questions]);

  return { interviewQuestions };
};
