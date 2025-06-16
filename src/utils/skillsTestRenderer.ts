
import { SkillsTestData, SkillsQuestion } from "@/types/skillsAssessment";

export const renderSkillsTestAsMarkdown = (skillsTestData: SkillsTestData): string => {
  if (!skillsTestData.questions || skillsTestData.questions.length === 0) {
    return "";
  }

  let markdown = "";

  // Add test overview
  if (skillsTestData.instructions) {
    markdown += `## Skills Assessment Overview\n\n${skillsTestData.instructions}\n\n`;
  }

  if (skillsTestData.estimatedCompletionTime) {
    markdown += `**Estimated Time:** ${skillsTestData.estimatedCompletionTime} minutes\n\n`;
  }

  markdown += `**Number of Challenges:** ${skillsTestData.questions.length}\n\n`;
  markdown += "---\n\n";

  // Render each question/challenge
  skillsTestData.questions.forEach((question, index) => {
    markdown += `### Challenge ${index + 1}: ${getQuestionTypeLabel(question.type)}\n\n`;
    markdown += `**${question.question}**\n\n`;

    if (question.candidateInstructions) {
      markdown += `**Instructions:** ${question.candidateInstructions}\n\n`;
    }

    // Add type-specific information
    switch (question.type) {
      case 'video_upload':
        if (question.timeLimit) {
          markdown += `**Video Length:** Maximum ${question.timeLimit} minutes\n\n`;
        }
        break;
      case 'file_upload':
      case 'pdf_upload':
        if (question.allowedFileTypes && question.allowedFileTypes.length > 0) {
          markdown += `**Allowed File Types:** ${question.allowedFileTypes.join(', ')}\n\n`;
        }
        if (question.maxFileSize) {
          markdown += `**Maximum File Size:** ${question.maxFileSize}MB\n\n`;
        }
        break;
      case 'text':
      case 'long_text':
        if (question.characterLimit) {
          markdown += `**Character Limit:** ${question.characterLimit} characters\n\n`;
        }
        break;
    }

    if (question.evaluationGuidelines) {
      markdown += `**What we're looking for:** ${question.evaluationGuidelines}\n\n`;
    }

    if (question.exampleResponse) {
      markdown += `**Example Response:** ${question.exampleResponse}\n\n`;
    }

    markdown += "---\n\n";
  });

  return markdown.trim();
};

const getQuestionTypeLabel = (type: string): string => {
  const typeLabels = {
    'text': 'Written Response',
    'long_text': 'Detailed Analysis',
    'video_upload': 'Video Demonstration',
    'file_upload': 'File Submission',
    'portfolio_link': 'Portfolio Link',
    'code_submission': 'Code Challenge',
    'pdf_upload': 'Document Upload',
    'url_submission': 'URL Submission',
    'multiple_choice': 'Multiple Choice'
  };
  
  return typeLabels[type as keyof typeof typeLabels] || 'Assessment Task';
};
