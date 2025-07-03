
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

export const detectJobIds = (message: string, jobs: any[]): string[] => {
  const detectedIds = new Set<string>();
  
  // Direct ID detection (exact matches)
  jobs.forEach(job => {
    if (message.includes(job.id)) {
      detectedIds.add(job.id);
    }
  });
  
  // **ENHANCED: More aggressive job title detection with better partial matching**
  const messageLower = message.toLowerCase();
  
  jobs.forEach(job => {
    const titleLower = job.title.toLowerCase();
    
    // Exact title match
    if (messageLower.includes(titleLower)) {
      detectedIds.add(job.id);
      return;
    }
    
    // **NEW: More flexible word-by-word matching**
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
    
    // If we match most of the title words, include the job
    const matchRatio = matchingWords / totalTitleWords;
    if (matchRatio >= 0.6 || (matchingWords >= 2 && titleWords.length <= 3)) {
      detectedIds.add(job.id);
      return;
    }
    
    // **NEW: Special handling for compound terms and common abbreviations**
    const cleanMessage = messageLower.replace(/[^a-z0-9]/g, '');
    const cleanTitle = titleLower.replace(/[^a-z0-9]/g, '');
    
    // Check for substring matches in cleaned versions
    if ((cleanMessage.length >= 4 && cleanTitle.includes(cleanMessage)) ||
        (cleanTitle.length >= 4 && cleanMessage.includes(cleanTitle))) {
      detectedIds.add(job.id);
    }
    
    // **NEW: Handle common variations and partial matches**
    // For example: "monkey test" should match "Monkey Test", "QA" should match "Quality Assurance", etc.
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
  });
  
  console.log('Job detection results:', {
    message: messageLower,
    detectedJobIds: Array.from(detectedIds),
    jobTitles: jobs.filter(job => detectedIds.has(job.id)).map(job => job.title)
  });
  
  return Array.from(detectedIds);
};

export const detectMentionedCandidates = (message: string, applications: any[]): string[] => {
  const mentionedIds: string[] = [];
  
  // **UPDATED: Much stricter candidate detection - only for clear recommendations**
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
    
    // **NEW: More sophisticated name detection in recommendation context**
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
    
    // **NEW: Check individual name parts but ONLY in very strong recommendation context**
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
