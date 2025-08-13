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
      const lines = raw.replace(/\r\n?/g, "\n").split(/\n/);
      // Updated regex to handle markdown format: **Question 1:** and other formats
      const startRe = /^(?:\s*)(?:\*\*Question\s*\d+[:.)\s-]*\*\*|Question\s*\d+[:.)-]?|Q\s*\d+[:.)-]?|\d+\.\s+|[-*•]\s+)/i;
      const results: string[] = [];
      let current: string[] = [];

      const pushCurrent = () => {
        const joined = normalize(current.join(" "));
        if (
          joined &&
          joined.length >= 3 &&
          !/interview questions?/i.test(joined) &&
          !/instructions?/i.test(joined) &&
          !/what we're looking for/i.test(joined) // Skip evaluation criteria sections
        ) {
          results.push(joined);
        }
        current = [];
      };

      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip empty lines and markdown headers that aren't questions
        if (!trimmedLine || /^#{1,6}\s/.test(trimmedLine)) {
          if (current.length) {
            // Only push if we have substantial content
            const joined = current.join(" ").trim();
            if (joined.length > 10) {
              pushCurrent();
            } else {
              current = [];
            }
          }
          continue;
        }

        if (startRe.test(trimmedLine)) {
          if (current.length) pushCurrent();
          // Clean up markdown formatting and question prefixes
          const cleanedLine = trimmedLine
            .replace(/^\*\*(.*?)\*\*/, '$1') // Remove markdown bold
            .replace(/^(?:Question\s*\d+[:.)\s-]*|Q\s*\d+[:.)\s-]*|\d+\.\s+|[-*•]\s+)/i, "")
            .trim();
          if (cleanedLine) {
            current.push(cleanedLine);
          }
        } else if (current.length && !trimmedLine.startsWith("**What we're looking for")) {
          // Continuation of the current question, but skip evaluation criteria
          current.push(trimmedLine);
        }
      }
      if (current.length) pushCurrent();

      return dedupe(results);
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

    // Final cleanup: cap to 5, keep order
    setInterviewQuestions(parsed.slice(0, MAX_QUESTIONS));
  }, [questions]);

  return { interviewQuestions };
};
