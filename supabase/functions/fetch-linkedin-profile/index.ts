
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { accessToken } = await req.json();
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Access token is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Fetching LinkedIn profile with access token...');

    // Fetch basic profile information
    const profileResponse = await fetch('https://api.linkedin.com/v2/people/~?projection=(id,firstName,lastName,headline,summary,vanityName,profilePicture(displayImage~:playableStreams))', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!profileResponse.ok) {
      console.error('LinkedIn profile fetch failed:', profileResponse.status, await profileResponse.text());
      throw new Error(`LinkedIn API error: ${profileResponse.status}`);
    }

    const profileData = await profileResponse.json();
    console.log('LinkedIn profile data received:', Object.keys(profileData));

    // Fetch email address
    let emailData = null;
    try {
      const emailResponse = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (emailResponse.ok) {
        emailData = await emailResponse.json();
      }
    } catch (error) {
      console.warn('Failed to fetch email:', error);
    }

    // Fetch positions (work experience)
    let positionsData = null;
    try {
      const positionsResponse = await fetch('https://api.linkedin.com/v2/positions?q=members&projection=(elements*(id,title,summary,startDate,endDate,company~(id,name,description)))', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (positionsResponse.ok) {
        positionsData = await positionsResponse.json();
      }
    } catch (error) {
      console.warn('Failed to fetch positions:', error);
    }

    // Transform the data into a consistent format
    const transformedProfile = {
      name: `${profileData.firstName?.localized?.en_US || profileData.firstName?.preferredLocale?.language || ''} ${profileData.lastName?.localized?.en_US || profileData.lastName?.preferredLocale?.language || ''}`.trim(),
      email: emailData?.elements?.[0]?.['handle~']?.emailAddress || '',
      headline: profileData.headline?.localized?.en_US || profileData.headline?.preferredLocale?.language || '',
      summary: profileData.summary?.localized?.en_US || profileData.summary?.preferredLocale?.language || '',
      location: '', // Location requires additional API call with proper permissions
      pictureUrl: profileData.profilePicture?.displayImage?.elements?.[0]?.identifiers?.[0]?.identifier || '',
      positions: positionsData?.elements?.map((pos: any) => ({
        title: pos.title?.localized?.en_US || pos.title?.preferredLocale?.language || '',
        company: pos['company~']?.name?.localized?.en_US || pos['company~']?.name?.preferredLocale?.language || '',
        startDate: pos.startDate ? `${pos.startDate.year}-${String(pos.startDate.month || 1).padStart(2, '0')}-01` : '',
        endDate: pos.endDate ? `${pos.endDate.year}-${String(pos.endDate.month || 12).padStart(2, '0')}-01` : null,
        description: pos.summary?.localized?.en_US || pos.summary?.preferredLocale?.language || '',
      })) || [],
      skills: [], // Skills require additional API permissions
    };

    console.log('Transformed profile:', transformedProfile);

    return new Response(
      JSON.stringify({ profile: transformedProfile }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in fetch-linkedin-profile function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch LinkedIn profile',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
