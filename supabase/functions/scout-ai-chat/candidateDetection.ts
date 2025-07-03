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
  
  // Enhanced job title detection with partial matching
  const messageLower = message.toLowerCase();
  
  jobs.forEach(job => {
    const titleLower = job.title.toLowerCase();
    
    // Exact title match
    if (messageLower.includes(titleLower)) {
      detectedIds.add(job.id);
      return;
    }
    
    // Partial word matching - split by common delimiters
    const messageWords = messageLower.split(/[\s\-_.,;:!?()[\]{}'"]+/).filter(w => w.length > 2);
    const titleWords = titleLower.split(/[\s\-_.,;:!?()[\]{}'"]+/).filter(w => w.length > 2);
    
    // Check if any significant words from the message match title words
    const matchingWords = messageWords.filter(word => 
      titleWords.some(titleWord => 
        titleWord.includes(word) || word.includes(titleWord)
      )
    );
    
    // If we have multiple matching words or one very specific match, include the job
    if (matchingWords.length >= 2 || 
        (matchingWords.length === 1 && matchingWords[0].length >= 4)) {
      detectedIds.add(job.id);
    }
    
    // Special handling for compound words and abbreviations
    const cleanMessage = messageLower.replace(/[^a-z0-9]/g, '');
    const cleanTitle = titleLower.replace(/[^a-z0-9]/g, '');
    
    if (cleanMessage.includes(cleanTitle) || cleanTitle.includes(cleanMessage)) {
      detectedIds.add(job.id);
    }
  });
  
  return Array.from(detectedIds);
};

export const detectMentionedCandidates = (message: string, applications: any[]): string[] => {
  const mentionedIds: string[] = [];
  
  applications.forEach(app => {
    // Check for name mentions (first name, last name, or full name)
    const nameParts = app.name.toLowerCase().split(' ');
    const messageLower = message.toLowerCase();
    
    // Full name match
    if (messageLower.includes(app.name.toLowerCase())) {
      mentionedIds.push(app.id);
      return;
    }
    
    // Individual name parts (first name, last name)
    nameParts.forEach(namePart => {
      if (namePart.length >= 3 && messageLower.includes(namePart)) {
        mentionedIds.push(app.id);
      }
    });
    
    // Email mentions
    if (messageLower.includes(app.email.toLowerCase())) {
      mentionedIds.push(app.id);
    }
  });
  
  return mentionedIds;
};
