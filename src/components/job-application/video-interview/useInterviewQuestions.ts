
import { useState, useEffect } from "react";

export const useInterviewQuestions = (questions: string) => {
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);

  useEffect(() => {
    const normalize = (q: string) =>
      q
        .replace(/^\s+|\s+$/g, "")
        .replace(/^(?:\d+\.|[-*•\)])\s*/i, "") // trim leading numbering/bullets
        .replace(/\s+/g, " ")
        .trim();

    const dedupe = (arr: string[]) => Array.from(new Set(arr));

    const parseFromJson = (raw: string): string[] | null => {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // ["Q1", "Q2"] or [{question:"..."}]
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

    const parseFromText = (raw: string): string[] => {
      if (!raw) return [];
      const cleaned = raw.replace(/\r\n?/g, "\n");

      // Split on newlines or numbered/bulleted patterns, keeping order
      const parts = cleaned
        .split(/\n+|(?:(?<=\s|^))\d+\.|\n[-*•]/g)
        .map((s) => normalize(s))
        .filter(
          (q) =>
            q &&
            q.length >= 3 &&
            !/interview questions?/i.test(q) &&
            !/instructions/i.test(q)
        );

      // If we still have one large paragraph, try splitting by question marks.
      const expanded = parts.length <= 1
        ? cleaned
            .split(/\?\s+/)
            .map((s) => normalize(s.endsWith("?") ? s : s ? `${s}?` : ""))
            .filter((q) => q.length >= 3 && /\?$/.test(q))
        : parts;

      return dedupe(expanded);
    };

    let parsed: string[] = [];

    // 1) Try JSON first (most reliable if builder saved structured data)
    const fromJson = parseFromJson(questions);
    if (fromJson && fromJson.length) parsed = fromJson;

    // 2) Fallback to robust text parsing
    if (!parsed.length) parsed = parseFromText(questions || "");

    setInterviewQuestions(parsed);
  }, [questions]);

  return { interviewQuestions };
};

