
export const getUserProfile = async (supabase: any, userId: string) => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, company_name')
    .eq('id', userId)
    .single();
  
  return profile;
};

export const getUserJobs = async (supabase: any, userId: string) => {
  const { data: jobs } = await supabase
    .from('jobs')
    .select(`
      id,
      title,
      status,
      created_at,
      role_type,
      experience_level,
      required_skills,
      description,
      employment_type,
      applications(
        id, 
        name, 
        email, 
        status, 
        ai_rating, 
        manual_rating, 
        created_at,
        ai_summary,
        work_experience,
        education,
        skills,
        experience,
        portfolio_url,
        github_url,
        linkedin_url,
        location,
        phone,
        pipeline_stage,
        rejection_reason,
        parsed_resume_data,
        cover_letter,
        available_start_date
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return jobs;
};

export const getConversationHistory = async (
  supabase: any,
  userId: string,
  conversationId: string
) => {
  const { data: recentMessages } = await supabase
    .from('scout_conversations')
    .select('message_content, is_ai_response, created_at')
    .eq('user_id', userId)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(10);

  return recentMessages?.reverse().map(msg => ({
    role: msg.is_ai_response ? 'assistant' : 'user',
    content: msg.message_content
  })) || [];
};
