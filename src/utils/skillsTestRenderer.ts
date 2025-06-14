
import { SkillsTestData } from "@/types/skillsAssessment";

export const renderSkillsTestAsMarkdown = (skillsTestData: SkillsTestData): string => {
  if (!skillsTestData.questions || skillsTestData.questions.length === 0) {
    return "";
  }

  let markdown = "# Skills Assessment\n\n";
  
  skillsTestData.questions.forEach((question, index) => {
    markdown += `## Question ${index + 1}\n\n`;
    markdown += `**${question.question}**\n\n`;
    
    if (question.candidateInstructions) {
      markdown += `*${question.candidateInstructions}*\n\n`;
    }
    
    markdown += `Response Type: ${question.type === 'text' ? 'Text Response' : 'File Upload'}\n\n`;
    markdown += `Required: ${question.required ? 'Yes' : 'No'}\n\n`;
    markdown += "---\n\n";
  });

  return markdown;
};
