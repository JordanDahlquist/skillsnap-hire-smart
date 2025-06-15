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

// Maximum number of candidate cards to show in any single response
const MAX_CANDIDATE_CARDS = 3;

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
  const candidateMatches: Array<{ id: string; score: number; position: number }> = [];
  const responseText = aiMessage.toLowerCase();
  
  // Recommendation context patterns (words that indicate positive recommendation)
  const recommendationPatterns = [
    /\b(recommend|suggest|best|top|ideal|perfect|excellent|outstanding|strong|good choice)\b/gi,
    /\b(would be|is a|seems like|appears to be)\s+\w*\s*(good|great|excellent|ideal|perfect|strong)\b/gi,
    /\b(top\s*\d*\s*candidate|best\s*candidate|first\s*choice|primary\s*recommendation)\b/gi
  ];

  applications.forEach(app => {
    const candidateName = app.name.toLowerCase();
    const nameParts = candidateName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    
    // Look for full name or first/last name mentions
    const namePatterns = [
      candidateName,
      firstName.length > 2 ? firstName : null,
      lastName.length > 2 ? lastName : null
    ].filter(Boolean);
    
    namePatterns.forEach(name => {
      const nameRegex = new RegExp(`\\b${name}\\b`, 'gi');
      const matches = [...responseText.matchAll(nameRegex)];
      
      matches.forEach(match => {
        const position = match.index || 0;
        let score = 0;
        
        // Get context around the name mention (100 characters before and after)
        const contextStart = Math.max(0, position - 100);
        const contextEnd = Math.min(responseText.length, position + 100);
        const context = responseText.substring(contextStart, contextEnd);
        
        // Score based on recommendation patterns in context
        recommendationPatterns.forEach(pattern => {
          if (pattern.test(context)) {
            score += 10;
          }
        });
        
        // Higher score for earlier mentions (first mentions are usually recommendations)
        score += Math.max(0, 100 - position / 10);
        
        // Bonus for being in the first paragraph
        if (position < 200) {
          score += 5;
        }
        
        // Check for negative context patterns
        const negativePatterns = [
          /\b(however|but|unfortunately|lacks|missing|weak|poor|not suitable|doesn't have)\b/gi,
          /\b(compared to|unlike|whereas|while)\b/gi
        ];
        
        let hasNegativeContext = false;
        negativePatterns.forEach(pattern => {
          if (pattern.test(context)) {
            hasNegativeContext = true;
            score -= 5; // Reduce score for negative context
          }
        });
        
        // Only include if there's some positive indication or high position score
        if (score > 5 || (!hasNegativeContext && position < 100)) {
          candidateMatches.push({ id: app.id, score, position });
        }
      });
    });
  });

  // Also check for UUID mentions (legacy support)
  const uuidMatches = aiMessage.match(/(?:candidate|application|ID)[:\s]+([a-f0-9-]{36})/gi);
  if (uuidMatches) {
    uuidMatches.forEach((match: string, index: number) => {
      const id = match.match(/([a-f0-9-]{36})/)?.[1];
      if (id && applications.some(app => app.id === id)) {
        candidateMatches.push({ id, score: 20, position: index * 10 });
      }
    });
  }

  // Sort by score (descending) then by position (ascending - earlier is better)
  candidateMatches.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.position - b.position;
  });

  // Remove duplicates and limit to MAX_CANDIDATE_CARDS
  const uniqueIds = [...new Set(candidateMatches.map(match => match.id))];
  const limitedIds = uniqueIds.slice(0, MAX_CANDIDATE_CARDS);
  
  // Log for debugging
  if (candidateMatches.length > 0) {
    console.log(`Candidate detection: Found ${candidateMatches.length} total matches, showing top ${limitedIds.length}:`, 
      candidateMatches.slice(0, MAX_CANDIDATE_CARDS).map(m => ({ id: m.id.substring(0, 8), score: m.score, position: m.position }))
    );
    
    if (uniqueIds.length > MAX_CANDIDATE_CARDS) {
      console.log(`Filtered out ${uniqueIds.length - MAX_CANDIDATE_CARDS} additional candidates to prevent UI overflow`);
    }
  }

  return limitedIds;
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
