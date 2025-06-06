
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

CRITICAL INSTRUCTIONS:
1. Be VERY flexible with matching - use partial matches and synonyms
2. For locations like "Los Angeles", map to the state "California" 
3. For role types, match broadly using synonyms:
   - "branding" → look for "designer", "marketing", "creative" roles
   - "frontend", "react", "javascript" → look for "developer", "engineer" roles
   - "data" → look for "analyst", "scientist", "engineer" roles
   - "content", "writing" → look for "writer", "content" roles
4. If you can't find exact matches, use "all" instead of forcing a match
5. Always include relevant keywords in searchTerm for better text search
6. Prioritize searchTerm over strict filtering when uncertain

EMPLOYMENT TYPE & BUDGET HANDLING:
- ALWAYS determine employment type FIRST, then set appropriate budget ranges
- Full-time/Part-time jobs: Use annual salary ranges
  - "under $100k" for full-time → budgetRange: [0, 100000]
  - "$80k-120k" for full-time → budgetRange: [80000, 120000]
  - No budget mentioned for full-time → budgetRange: [0, 200000]
- Contract/Project jobs: Use project total value ranges
  - "under $10k" for projects → budgetRange: [0, 10000]
  - "$5k-25k" for projects → budgetRange: [5000, 25000]
  - No budget mentioned for projects → budgetRange: [0, 200000]
- NEVER set budgetRange to [0, 0] unless user specifically mentions "free" or "$0"
- If employment type is unclear, default to project-based budgeting

LOCATION MAPPING EXAMPLES:
- "Los Angeles" → state: "California", searchTerm should include "Los Angeles"
- "New York" → state: "New York", searchTerm should include "New York"
- "San Francisco" → state: "California", searchTerm should include "San Francisco"
- "remote" → locationType: "remote", no need to set state

ROLE MAPPING EXAMPLES:
- "branding" → roleType: find closest "designer"/"marketing" match OR "all", searchTerm: "branding design"
- "frontend" → roleType: find closest "developer" match OR "all", searchTerm: "frontend development"
- "data analysis" → roleType: find closest "analyst" match OR "all", searchTerm: "data analysis"

Return a JSON object with these fields:
{
  "searchTerm": "extracted keywords for text search (always include specific terms like city names, specializations)",
  "filters": {
    "roleType": "closest matching role or 'all'",
    "locationType": "remote/onsite/hybrid or 'all'", 
    "experienceLevel": "entry/mid/senior or 'all'",
    "employmentType": "full-time/part-time/contract/project or 'all'",
    "country": "exact country match or 'all'",
    "state": "exact state match or 'all'",
    "budgetRange": [min, max] (employment-type-appropriate ranges),
    "duration": "exact duration match or 'all'"
  },
  "explanation": "Brief explanation of what filters were applied and why, including budget reasoning"
}

Examples:
- "Full-time React developer $80k-120k" → searchTerm: "React developer", employmentType: "full-time", budgetRange: [80000, 120000], roleType: closest developer match or "all"
- "Contract design project under $10k" → searchTerm: "design", employmentType: "contract", budgetRange: [0, 10000], roleType: closest design match or "all"
- "Remote senior developer" → searchTerm: "senior developer", locationType: "remote", experienceLevel: "senior", employmentType: "all", budgetRange: [0, 200000]`;

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
        temperature: 0.1,
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI Response:', aiResponse);
    
    // Parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
      
      // Ensure budgetRange is never [0, 0] unless intentional
      if (parsedResponse.filters.budgetRange && 
          parsedResponse.filters.budgetRange[0] === 0 && 
          parsedResponse.filters.budgetRange[1] === 0 &&
          !prompt.toLowerCase().includes('free') && 
          !prompt.toLowerCase().includes('$0')) {
        parsedResponse.filters.budgetRange = [0, 200000];
        console.log('Fixed budget range from [0, 0] to [0, 200000]');
      }
      
    } catch (e) {
      console.error('JSON parsing error:', e);
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

    console.log('Parsed Response:', parsedResponse);

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
