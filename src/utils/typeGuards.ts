
import { Json } from "@/integrations/supabase/types";
import { SkillsTestResponse, VideoTranscript } from "@/types/supabase";

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

export function isVideoTranscriptArray(data: Json): data is VideoTranscript[] {
  if (!Array.isArray(data)) return false;
  return data.every(item => 
    typeof item === 'object' && 
    item !== null && 
    'transcript' in item && 
    'questionText' in item &&
    typeof item.transcript === 'string' &&
    typeof item.questionText === 'string'
  );
}

export function safeParseVideoTranscripts(data: Json): VideoTranscript[] {
  if (isVideoTranscriptArray(data)) {
    return data;
  }
  return [];
}

export function isValidJsonArray(data: Json): data is Json[] {
  return Array.isArray(data);
}
