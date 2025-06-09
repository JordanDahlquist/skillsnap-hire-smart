
import { Json } from "@/integrations/supabase/types";
import { SkillsTestResponse } from "@/types/supabase";

export function isSkillsTestResponseArray(data: Json): data is SkillsTestResponse[] {
  if (!Array.isArray(data)) return false;
  return data.every(item => 
    typeof item === 'object' && 
    item !== null && 
    'question' in item && 
    'answer' in item &&
    typeof item.question === 'string' &&
    typeof item.answer === 'string'
  );
}

export function safeParseSkillsTestResponses(data: Json): SkillsTestResponse[] {
  if (isSkillsTestResponseArray(data)) {
    return data;
  }
  return [];
}

export function isValidJsonArray(data: Json): data is any[] {
  return Array.isArray(data);
}
