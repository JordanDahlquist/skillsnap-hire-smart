
import { SkillsTestData, SkillsQuestion } from "@/types/skillsAssessment";

export const renderSkillsTestAsMarkdown = (skillsTestData: SkillsTestData): string => {
  if (!skillsTestData.questions || skillsTestData.questions.length === 0) {
    return "";
  }

  let markdown = "";

  // Add test overview
  if (skillsTestData.instructions) {
    markdown += `## Skills Assessment Project\n\n${skillsTestData.instructions}\n\n`;
  }

  if (skillsTestData.estimatedCompletionTime) {
    markdown += `**Estimated Time:** ${skillsTestData.estimatedCompletionTime} minutes\n\n`;
  }

  // For single integrated projects, adjust the language
  const isIntegratedProject = skillsTestData.questions.length === 1;
  if (isIntegratedProject) {
    markdown += `**Project Type:** Integrated Skills Demonstration\n\n`;
  } else {
    markdown += `**Number of Challenges:** ${skillsTestData.questions.length}\n\n`;
  }
  
  markdown += "---\n\n";

  // Render each question/challenge
  skillsTestData.questions.forEach((question, index) => {
    if (isIntegratedProject) {
      markdown += `### Integrated Skills Project\n\n`;
    } else {
      markdown += `### Challenge ${index + 1}: ${getQuestionTypeLabel(question.type)}\n\n`;
    }
    
    markdown += `**${question.question}**\n\n`;

    if (question.candidateInstructions) {
      markdown += `**Instructions:** ${question.candidateInstructions}\n\n`;
    }

    // Add type-specific information
    switch (question.type) {
      case 'video_upload':
        if (question.timeLimit) {
          markdown += `**Maximum Time to Complete:** ${question.timeLimit} minutes\n\n`;
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
      case 'portfolio_link':
        markdown += `**Submission Format:** Provide a link to your completed project (GitHub, portfolio, etc.)\n\n`;
        break;
      case 'text':
      case 'long_text':
        if (question.characterLimit) {
          markdown += `**Character Limit:** ${question.characterLimit} characters\n\n`;
        }
        break;
    }

    if (question.timeLimit && question.type !== 'video_upload') {
      markdown += `**Time Limit:** ${question.timeLimit} minutes maximum\n\n`;
    }

    if (question.evaluationGuidelines) {
      markdown += `**Evaluation Criteria:** ${question.evaluationGuidelines}\n\n`;
    }

    if (question.scoringCriteria) {
      markdown += `**What Makes a Great Submission:** ${question.scoringCriteria}\n\n`;
    }

    if (question.exampleResponse) {
      markdown += `**Example/Reference:** ${question.exampleResponse}\n\n`;
    }

    markdown += "---\n\n";
  });

  // Add a note about the integrated approach if it's a single project
  if (isIntegratedProject) {
    markdown += `**Note:** This is an integrated project designed to demonstrate multiple skills in one cohesive deliverable. Focus on showing your range of abilities within the time constraint rather than perfecting every detail.\n\n`;
  }

  return markdown.trim();
};

const getQuestionTypeLabel = (type: string): string => {
  const typeLabels = {
    'text': 'Written Response',
    'long_text': 'Detailed Analysis',
    'video_upload': 'Video Demonstration',
    'file_upload': 'File Submission',
    'portfolio_link': 'Project Portfolio',
    'code_submission': 'Code Project',
    'pdf_upload': 'Document/Presentation',
    'url_submission': 'URL Submission',
    'multiple_choice': 'Multiple Choice'
  };
  
  return typeLabels[type as keyof typeof typeLabels] || 'Skills Project';
};
