
export const storeConversationMessages = async (
  supabase: any,
  userId: string,
  conversationId: string,
  userMessage: string,
  aiMessage: string,
  jobIds: string[],
  applicationIds: string[]
) => {
  // Store user message
  await supabase
    .from('scout_conversations')
    .insert({
      user_id: userId,
      conversation_id: conversationId,
      message_content: userMessage,
      message_type: 'text',
      is_ai_response: false
    });

  // Store AI response
  await supabase
    .from('scout_conversations')
    .insert({
      user_id: userId,
      conversation_id: conversationId,
      message_content: aiMessage,
      message_type: jobIds.length > 0 || applicationIds.length > 0 ? 'with_cards' : 'text',
      is_ai_response: true,
      related_job_ids: jobIds,
      related_application_ids: applicationIds
    });
};

export const getCardData = async (
  supabase: any,
  userId: string,
  jobIds: string[],
  applicationIds: string[]
) => {
  let jobCards = [];
  let candidateCards = [];

  if (jobIds.length > 0) {
    const { data: jobsData } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        status,
        role_type,
        experience_level,
        created_at,
        applications(count)
      `)
      .in('id', jobIds)
      .eq('user_id', userId);
    
    jobCards = jobsData || [];
  }

  if (applicationIds.length > 0) {
    const { data: applicationsData } = await supabase
      .from('applications')
      .select(`
        id,
        name,
        email,
        status,
        ai_rating,
        manual_rating,
        created_at,
        pipeline_stage,
        ai_summary,
        job_id,
        jobs(title)
      `)
      .in('id', applicationIds);
    
    candidateCards = applicationsData || [];
  }

  return { jobCards, candidateCards };
};
