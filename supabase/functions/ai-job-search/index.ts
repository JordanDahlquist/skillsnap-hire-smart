
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, availableOptions } = await req.json();

    const systemPrompt = `You are a job search assistant. Parse the user's natural language job search query and return structured filter criteria.

Available options for filtering:
- Role Types: ${availableOptions.roleTypes.join(', ')}
- Location Types: ${availableOptions.locationTypes.join(', ')}
- Experience Levels: ${availableOptions.experienceLevels.join(', ')}
- Employment Types: ${availableOptions.employmentTypes.join(', ')}
- Countries: ${availableOptions.countries.join(', ')}
- States: ${availableOptions.states.join(', ')}
- Durations: ${availableOptions.durations.join(', ')}

Return a JSON object with these fields (use "all" for any unspecified filters):
{
  "searchTerm": "extracted keywords for text search",
  "filters": {
    "roleType": "all",
    "locationType": "all", 
    "experienceLevel": "all",
    "employmentType": "all",
    "country": "all",
    "state": "all",
    "budgetRange": [min, max], // budget range in dollars
    "duration": "all"
  },
  "explanation": "Brief explanation of what filters were applied"
}

Examples:
- "React developer jobs in California" → roleType: closest match to React, state: "California"
- "Remote senior engineer under 100k" → locationType: "remote", experienceLevel: "senior", budgetRange: [0, 100000]
- "Part-time design work" → employmentType: "part-time", roleType: closest design match`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (e) {
      // Fallback if JSON parsing fails
      parsedResponse = {
        searchTerm: prompt,
        filters: {
          roleType: "all",
          locationType: "all",
          experienceLevel: "all",
          employmentType: "all",
          country: "all",
          state: "all",
          budgetRange: [0, 200000],
          duration: "all"
        },
        explanation: "Using basic text search due to parsing error"
      };
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in AI job search:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
