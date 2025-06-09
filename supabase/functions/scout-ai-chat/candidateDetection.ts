
export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  status: string;
  ai_rating?: number;
  manual_rating?: number;
  pipeline_stage?: string;
  rejection_reason?: string;
  ai_summary?: string;
  location?: string;
  skills: string[];
  experience_years?: string;
  work_history: Array<{
    company?: string;
    title?: string;
    duration?: string;
    description?: string;
  }>;
  education_background: Array<{
    institution?: string;
    degree?: string;
    field?: string;
    year?: string;
  }>;
  portfolio_url?: string;
  github_url?: string;
  linkedin_url?: string;
  available_start_date?: string;
  cover_letter_excerpt?: string;
}

export const createCandidateProfiles = (applications: any[]): CandidateProfile[] => {
  return applications.map(app => {
    const skillsArray = Array.isArray(app.skills) ? app.skills : [];
    const workExperience = Array.isArray(app.work_experience) ? app.work_experience : [];
    const education = Array.isArray(app.education) ? app.education : [];
    
    return {
      id: app.id,
      name: app.name,
      email: app.email,
      status: app.status,
      ai_rating: app.ai_rating,
      manual_rating: app.manual_rating,
      pipeline_stage: app.pipeline_stage,
      rejection_reason: app.rejection_reason,
      ai_summary: app.ai_summary,
      location: app.location,
      skills: skillsArray.map(skill => typeof skill === 'string' ? skill : skill?.name || skill?.skill).filter(Boolean),
      experience_years: app.experience,
      work_history: workExperience.map(exp => ({
        company: exp?.company || exp?.employer,
        title: exp?.title || exp?.position,
        duration: exp?.duration || `${exp?.start_date} - ${exp?.end_date}`,
        description: exp?.description
      })).filter(exp => exp.company || exp.title),
      education_background: education.map(edu => ({
        institution: edu?.institution || edu?.school,
        degree: edu?.degree,
        field: edu?.field || edu?.major,
        year: edu?.year || edu?.graduation_year
      })).filter(edu => edu.institution || edu.degree),
      portfolio_url: app.portfolio_url,
      github_url: app.github_url,
      linkedin_url: app.linkedin_url,
      available_start_date: app.available_start_date,
      cover_letter_excerpt: app.cover_letter ? app.cover_letter.substring(0, 200) + '...' : null
    };
  });
};

export const detectMentionedCandidates = (aiMessage: string, applications: any[]): string[] => {
  const applicationIds: string[] = [];
  
  // Enhanced candidate detection by name
  applications.forEach(app => {
    const candidateName = app.name.toLowerCase();
    const responseText = aiMessage.toLowerCase();
    
    // Look for full name or first/last name mentions
    const nameParts = candidateName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    
    // Check for full name, first name, or last name in context
    const namePatterns = [
      candidateName,
      firstName.length > 2 ? firstName : null,
      lastName.length > 2 ? lastName : null
    ].filter(Boolean);
    
    const isNameMentioned = namePatterns.some(name => {
      // Look for name with word boundaries and context keywords
      const nameRegex = new RegExp(`\\b${name}\\b`, 'i');
      return nameRegex.test(responseText);
    });
    
    if (isNameMentioned) {
      applicationIds.push(app.id);
    }
  });

  // Also check for UUID mentions (legacy support)
  const appMatches = aiMessage.match(/(?:candidate|application|ID)[:\s]+([a-f0-9-]{36})/gi);
  if (appMatches) {
    appMatches.forEach((match: string) => {
      const id = match.match(/([a-f0-9-]{36})/)?.[1];
      if (id && applications.some(app => app.id === id)) {
        applicationIds.push(id);
      }
    });
  }

  return [...new Set(applicationIds)];
};

export const detectJobIds = (aiMessage: string, jobs: any[]): string[] => {
  const jobIds: string[] = [];
  
  // Extract job IDs from response (matches: job ID: uuid, job id: uuid, etc.)
  const jobMatches = aiMessage.match(/job\s+(?:ID|id)[:\s]+([a-f0-9-]{36})/gi);
  if (jobMatches) {
    jobMatches.forEach((match: string) => {
      const id = match.match(/([a-f0-9-]{36})/)?.[1];
      if (id && jobs?.some(job => job.id === id)) {
        jobIds.push(id);
      }
    });
  }

  return [...new Set(jobIds)];
};
