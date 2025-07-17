export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  status: string;
  pipeline_stage?: string;
  ai_rating?: number;
  manual_rating?: number;
  ai_summary?: string;
  location?: string;
  phone?: string;
  skills: string[];
  experience_years?: number;
  work_history: Array<{
    title?: string;
    company?: string;
    duration?: string;
  }>;
  education_background: Array<{
    degree?: string;
    institution?: string;
    year?: string;
  }>;
  portfolio_url?: string;
  github_url?: string;
  linkedin_url?: string;
  rejection_reason?: string;
}

export const createCandidateProfiles = (applications: any[]): CandidateProfile[] => {
  return applications.map(app => {
    // Parse work experience
    const workHistory = [];
    if (app.work_experience && Array.isArray(app.work_experience)) {
      workHistory.push(...app.work_experience);
    } else if (app.parsed_resume_data?.work_experience) {
      workHistory.push(...app.parsed_resume_data.work_experience);
    }

    // Parse education
    const educationBackground = [];
    if (app.education && Array.isArray(app.education)) {
      educationBackground.push(...app.education);
    } else if (app.parsed_resume_data?.education) {
      educationBackground.push(...app.parsed_resume_data.education);
    }

    // Parse skills
    let skills = [];
    if (app.skills && Array.isArray(app.skills)) {
      skills = app.skills;
    } else if (typeof app.skills === 'string') {
      skills = app.skills.split(',').map(s => s.trim());
    } else if (app.parsed_resume_data?.skills) {
      skills = app.parsed_resume_data.skills;
    }

    // Calculate experience years
    let experienceYears;
    if (app.parsed_resume_data?.total_experience_years) {
      experienceYears = app.parsed_resume_data.total_experience_years;
    } else if (workHistory.length > 0) {
      // Estimate from work history
      experienceYears = workHistory.length * 2; // Rough estimate
    }

    return {
      id: app.id,
      name: app.name,
      email: app.email,
      status: app.status,
      pipeline_stage: app.pipeline_stage,
      ai_rating: app.ai_rating,
      manual_rating: app.manual_rating,
      ai_summary: app.ai_summary,
      location: app.location,
      phone: app.phone,
      skills,
      experience_years: experienceYears,
      work_history: workHistory,
      education_background: educationBackground,
      portfolio_url: app.portfolio_url,
      github_url: app.github_url,
      linkedin_url: app.linkedin_url,
      rejection_reason: app.rejection_reason
    };
  });
};

// **NEW: Response type classification to determine AI intent**
const classifyResponseType = (message: string): 'clarification_request' | 'recommendation' | 'information' => {
  const messageLower = message.toLowerCase();
  
  // Clarification request patterns - these should NOT show job cards
  const clarificationPatterns = [
    /could you please specify/i,
    /which position/i,
    /which role/i,
    /let me know which/i,
    /here are your.*job openings/i,
    /active job openings/i,
    /available positions/i,
    /choose from/i,
    /select from/i,
    /would you like to focus on/i,
    /are you referring to/i,
    /which of these/i
  ];
  
  if (clarificationPatterns.some(pattern => pattern.test(messageLower))) {
    return 'clarification_request';
  }
  
  // Recommendation patterns - these SHOULD show job cards
  const recommendationPatterns = [
    /i recommend/i,
    /suggest.*for/i,
    /best fit.*for/i,
    /top candidates.*for/i,
    /you should consider/i,
    /would be perfect for/i,
    /ideal candidate.*for/i
  ];
  
  if (recommendationPatterns.some(pattern => pattern.test(messageLower))) {
    return 'recommendation';
  }
  
  return 'information';
};

// **NEW: Detect if AI is listing job options vs making recommendations**
const isListingJobOptions = (message: string): boolean => {
  const messageLower = message.toLowerCase();
  
  const listingPatterns = [
    /here are your.*job/i,
    /your active job/i,
    /available positions/i,
    /job openings/i,
    /\d+\.\s*\*\*/i, // Pattern like "1. **Job Title**"
    /1\.\s+\*\*/i    // Pattern like "1. **Job Title**"
  ];
  
  return listingPatterns.some(pattern => pattern.test(messageLower));
};

export const detectJobIds = (message: string, jobs: any[], isAiResponse: boolean = false): string[] => {
  const detectedIds = new Set<string>();
  
  // **NEW: For AI responses, be much more conservative**
  if (isAiResponse) {
    const responseType = classifyResponseType(message);
    
    // If AI is asking for clarification or listing options, don't show job cards
    if (responseType === 'clarification_request' || isListingJobOptions(message)) {
      console.log('AI is asking for clarification or listing options - not showing job cards');
      return [];
    }
    
    // Only proceed with job detection for clear recommendations
    if (responseType !== 'recommendation') {
      console.log('AI response is not a recommendation - minimal job card detection');
      // Only detect very explicit job mentions for non-recommendation responses
      jobs.forEach(job => {
        if (message.includes(job.id)) {
          detectedIds.add(job.id);
        }
      });
      return Array.from(detectedIds);
    }
  }
  
  // **FOR USER MESSAGES: Check for generic requests that shouldn't trigger specific job detection**
  if (!isAiResponse) {
    const genericRequestPatterns = [
      /\b(?:find|identify|show|help.*find).*(?:top|best|good).*candidates?\b/i,
      /\b(?:candidate|applicant).*(?:for|to).*(?:role|position|job)\b/i,
      /\b(?:who|which).*(?:candidate|applicant).*(?:should|would|best)\b/i,
      /\b(?:recommend|suggest).*candidates?\b/i,
      /\bhelp.*(?:choose|select|pick).*candidate\b/i
    ];
    
    const isGenericRequest = genericRequestPatterns.some(pattern => pattern.test(message));
    
    if (isGenericRequest && !hasSpecificJobMentions(message, jobs)) {
      console.log('Generic request detected without specific job mentions - returning empty array');
      return [];
    }
  }
  
  // Direct ID detection (exact matches)
  jobs.forEach(job => {
    if (message.includes(job.id)) {
      detectedIds.add(job.id);
    }
  });
  
  // **Job title detection - more conservative for AI responses**
  const messageLower = message.toLowerCase();
  
  jobs.forEach(job => {
    const titleLower = job.title.toLowerCase();
    
    // Exact title match
    if (messageLower.includes(titleLower)) {
      // **NEW: For AI responses, only add if it's a clear recommendation context**
      if (isAiResponse) {
        const recommendationContext = checkRecommendationContext(message, titleLower);
        if (recommendationContext) {
          detectedIds.add(job.id);
        }
      } else {
        detectedIds.add(job.id);
      }
      return;
    }
    
    // **More flexible word-by-word matching (less aggressive for AI responses)**
    const messageWords = messageLower.split(/[\s\-_.,;:!?()[\]{}'"]+/).filter(w => w.length > 1);
    const titleWords = titleLower.split(/[\s\-_.,;:!?()[\]{}'"]+/).filter(w => w.length > 1);
    
    // Check if significant portions of the title are mentioned
    let matchingWords = 0;
    let totalTitleWords = titleWords.length;
    
    titleWords.forEach(titleWord => {
      messageWords.forEach(messageWord => {
        // Exact word match or one contains the other (for partial matches)
        if (titleWord === messageWord || 
            (titleWord.length >= 3 && messageWord.length >= 3 && 
             (titleWord.includes(messageWord) || messageWord.includes(titleWord)))) {
          matchingWords++;
        }
      });
    });
    
    // **NEW: Higher threshold for AI responses to reduce false positives**
    const requiredMatchRatio = isAiResponse ? 0.8 : 0.6;
    const matchRatio = matchingWords / totalTitleWords;
    
    if (matchRatio >= requiredMatchRatio || (matchingWords >= 2 && titleWords.length <= 3)) {
      if (isAiResponse) {
        const recommendationContext = checkRecommendationContext(message, titleLower);
        if (recommendationContext) {
          detectedIds.add(job.id);
        }
      } else {
        detectedIds.add(job.id);
      }
      return;
    }
    
    // **Variations matching (disabled for AI clarification responses)**
    if (!isAiResponse || classifyResponseType(message) === 'recommendation') {
      const variations = [
        { pattern: /\bmonkey\s*test\b/i, matches: ['monkey test', 'monkeytest'] },
        { pattern: /\bqa\b/i, matches: ['quality assurance', 'quality analyst'] },
        { pattern: /\bdev\b/i, matches: ['developer', 'development'] },
        { pattern: /\bfrontend\b/i, matches: ['front-end', 'front end'] },
        { pattern: /\bbackend\b/i, matches: ['back-end', 'back end'] },
        { pattern: /\bfullstack\b/i, matches: ['full-stack', 'full stack'] }
      ];
      
      variations.forEach(variation => {
        if (variation.pattern.test(messageLower)) {
          variation.matches.forEach(match => {
            if (titleLower.includes(match)) {
              detectedIds.add(job.id);
            }
          });
        }
      });
    }
  });
  
  console.log('Job detection results:', {
    message: messageLower.substring(0, 100) + '...',
    isAiResponse,
    responseType: isAiResponse ? classifyResponseType(message) : 'user_message',
    detectedJobIds: Array.from(detectedIds),
    jobTitles: jobs.filter(job => detectedIds.has(job.id)).map(job => job.title)
  });
  
  return Array.from(detectedIds);
};

// **NEW: Check if job mention is in a recommendation context**
const checkRecommendationContext = (message: string, jobTitle: string): boolean => {
  const messageLower = message.toLowerCase();
  const jobIndex = messageLower.indexOf(jobTitle);
  
  if (jobIndex === -1) return false;
  
  // Get context around the job mention
  const contextStart = Math.max(0, jobIndex - 100);
  const contextEnd = Math.min(messageLower.length, jobIndex + jobTitle.length + 100);
  const context = messageLower.substring(contextStart, contextEnd);
  
  const recommendationPatterns = [
    /recommend.*for/i,
    /suggest.*for/i,
    /best.*for/i,
    /perfect.*for/i,
    /ideal.*for/i,
    /consider.*for/i,
    /hire.*for/i,
    /interview.*for/i
  ];
  
  return recommendationPatterns.some(pattern => pattern.test(context));
};

// Helper function to check for specific job mentions
const hasSpecificJobMentions = (message: string, jobs: any[]): boolean => {
  const messageLower = message.toLowerCase();
  
  // Check for direct job title mentions
  return jobs.some(job => {
    const titleLower = job.title.toLowerCase();
    return messageLower.includes(titleLower) || 
           messageLower.includes(job.id);
  });
};

export const detectMentionedCandidates = (message: string, applications: any[]): string[] => {
  const mentionedIds: string[] = [];
  
  // **Much stricter candidate detection - only for clear recommendations**
  const strongRecommendationKeywords = [
    'recommend', 'suggest', 'top pick', 'best candidate', 'hire', 'interview',
    'move forward', 'next steps', 'standout', 'excellent choice', 'strong pick',
    'my recommendation', 'i recommend', 'you should', 'consider hiring',
    'schedule interview', 'bring in for', 'worth interviewing'
  ];
  
  const messageLower = message.toLowerCase();
  
  // Only proceed if there are clear recommendation signals
  const hasStrongRecommendationContext = strongRecommendationKeywords.some(keyword => 
    messageLower.includes(keyword)
  );
  
  if (!hasStrongRecommendationContext) {
    return []; // Don't show cards for casual mentions
  }
  
  applications.forEach(app => {
    const nameParts = app.name.toLowerCase().split(' ');
    
    // **More sophisticated name detection in recommendation context**
    const checkNameInRecommendationContext = (name: string) => {
      const nameIndex = messageLower.indexOf(name);
      if (nameIndex === -1) return false;
      
      // Get text around the name mention (50 chars before and after)
      const contextStart = Math.max(0, nameIndex - 50);
      const contextEnd = Math.min(messageLower.length, nameIndex + name.length + 50);
      const surroundingContext = messageLower.substring(contextStart, contextEnd);
      
      // Check if the name is mentioned in a clear recommendation context
      const recommendationPatterns = [
        /recommend.*\b\w+/,
        /\b\w+.*is.*(?:excellent|strong|good|top|best)/,
        /\b\w+.*(?:stands out|impressive|qualified)/,
        /(?:hire|interview|consider).*\b\w+/,
        /\b\w+.*(?:next steps|move forward)/,
        /top.*pick.*\b\w+/,
        /\b\w+.*(?:would be|is a).*(?:good|great|excellent)/
      ];
      
      return recommendationPatterns.some(pattern => pattern.test(surroundingContext));
    };
    
    // Full name check in recommendation context
    if (messageLower.includes(app.name.toLowerCase())) {
      if (checkNameInRecommendationContext(app.name.toLowerCase())) {
        mentionedIds.push(app.id);
        return;
      }
    }
    
    // **Check individual name parts but ONLY in very strong recommendation context**
    nameParts.forEach(namePart => {
      if (namePart.length >= 3 && messageLower.includes(namePart)) {
        // Only for very explicit recommendations with the specific name
        const explicitRecommendationPatterns = [
          new RegExp(`(?:recommend|suggest|hire).*${namePart}`, 'i'),
          new RegExp(`${namePart}.*(?:is my top|is the best|is excellent)`, 'i'),
          new RegExp(`(?:top pick|best candidate).*${namePart}`, 'i'),
          new RegExp(`${namePart}.*(?:should be|worth).*(?:hired|interviewed)`, 'i')
        ];
        
        if (explicitRecommendationPatterns.some(pattern => pattern.test(messageLower))) {
          mentionedIds.push(app.id);
        }
      }
    });
    
    // Email mentions (always include as these are very specific)
    if (messageLower.includes(app.email.toLowerCase())) {
      mentionedIds.push(app.id);
    }
  });
  
  console.log('Candidate detection results:', {
    message: messageLower.substring(0, 100) + '...',
    hasStrongRecommendationContext,
    detectedCandidateIds: mentionedIds,
    candidateNames: applications.filter(app => mentionedIds.includes(app.id)).map(app => app.name)
  });
  
  // Remove duplicates and limit to prevent card overload
  const uniqueIds = [...new Set(mentionedIds)];
  return uniqueIds.slice(0, 5); // Max 5 candidate cards at once
};
