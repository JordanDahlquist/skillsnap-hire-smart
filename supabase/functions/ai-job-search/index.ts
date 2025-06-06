
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

    const systemPrompt = `You are a flexible job search assistant. Parse the user's natural language job search query and return structured filter criteria. Your goal is to be INCLUSIVE and show relevant opportunities, not restrictive.

Available options for filtering:
- Role Types: ${availableOptions.roleTypes.join(', ')}
- Location Types: ${availableOptions.locationTypes.join(', ')}
- Experience Levels: ${availableOptions.experienceLevels.join(', ')}
- Employment Types: ${availableOptions.employmentTypes.join(', ')}
- Countries: ${availableOptions.countries.join(', ')}
- States: ${availableOptions.states.join(', ')}
- Durations: ${availableOptions.durations.join(', ')}

CORE PHILOSOPHY: BE FLEXIBLE AND INCLUSIVE
1. **PREFER TEXT SEARCH OVER STRICT FILTERS**: Use searchTerm heavily to capture intent rather than rigid categories
2. **ONLY SET SPECIFIC FILTERS WHEN USER IS VERY EXPLICIT**: 
   - "only full-time jobs" → set employmentType
   - "remote work" → set locationType: "remote"
   - "senior level only" → set experienceLevel
   - Otherwise, default most filters to "all"
3. **EXPAND RATHER THAN RESTRICT**: If unsure, include more rather than exclude
4. **PRIORITIZE KEYWORDS**: Put specific skills, technologies, and requirements in searchTerm

MATCHING RULES:
- For role types: Match broadly using keywords and synonyms, but default to "all" unless very specific
- For locations: Be flexible - "California" can include remote jobs, "LA" includes all California
- For experience: Unless user says "only senior" or "entry level only", default to "all"
- For employment type: Only set if user is specific about full-time vs contract vs project
- For budget: Be generous with ranges, expand by 20-30% from user's stated preferences

EMPLOYMENT TYPE & BUDGET FLEXIBILITY:
- If user mentions salary ranges, assume full-time unless stated otherwise
- If user mentions project budgets, assume contract/project work
- ALWAYS make budget ranges 20-30% wider than requested to catch edge cases
- If no budget mentioned, use full range [0, 200000]
- Budget examples:
  - "around $80k" → budgetRange: [65000, 95000] for full-time
  - "$5k-15k project" → budgetRange: [4000, 18000] for contract/project
  - "under $100k" → budgetRange: [0, 120000] for flexibility

LOCATION FLEXIBILITY:
- City names (e.g., "San Francisco", "Austin") → use searchTerm AND state, but also consider remote
- "Remote" → locationType: "remote", but don't restrict other fields
- State names → set state but allow all location types
- "Anywhere" or "flexible" → keep location filters as "all"

ROLE FLEXIBILITY:
- Technical skills → include in searchTerm, roleType: "all" unless clear category match
- "Design" → searchTerm: "design creative branding", roleType: closest match or "all"
- "Development" → searchTerm: "development programming coding", roleType: closest match or "all"
- "Marketing" → searchTerm: "marketing advertising social media", roleType: closest match or "all"

Return JSON object:
{
  "searchTerm": "comprehensive keywords for flexible text search - include synonyms and related terms",
  "filters": {
    "roleType": "closest match or 'all' (prefer 'all' unless very specific)",
    "locationType": "remote/onsite/hybrid or 'all' (prefer 'all' unless explicitly mentioned)", 
    "experienceLevel": "'all' unless user specifically excludes levels",
    "employmentType": "'all' unless user is specific about type",
    "country": "exact match or 'all'",
    "state": "exact match or 'all'",
    "budgetRange": [generous_min, generous_max],
    "duration": "'all' unless specific duration mentioned"
  },
  "explanation": "Brief explanation emphasizing flexibility and what was kept broad vs specific"
}

EXAMPLES OF FLEXIBLE APPROACH:
- "React developer" → searchTerm: "React developer frontend JavaScript", roleType: "all", employmentType: "all"
- "Design work in California" → searchTerm: "design creative branding", state: "California", locationType: "all"
- "Senior full-time developer $100k+" → searchTerm: "senior developer", experienceLevel: "senior", employmentType: "full-time", budgetRange: [100000, 150000]
- "Freelance writing projects" → searchTerm: "writing content copywriting", employmentType: "contract", roleType: "all"`;

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
      
      // Ensure budget range is generous and never [0, 0]
      if (parsedResponse.filters.budgetRange) {
        const [min, max] = parsedResponse.filters.budgetRange;
        if (min === 0 && max === 0) {
          parsedResponse.filters.budgetRange = [0, 200000];
        }
        // Make ranges more generous by expanding them slightly
        if (min > 0 || max < 200000) {
          const expandedMin = Math.max(0, Math.floor(min * 0.8));
          const expandedMax = max < 200000 ? Math.ceil(max * 1.2) : 200000;
          parsedResponse.filters.budgetRange = [expandedMin, expandedMax];
        }
      }
      
    } catch (e) {
      console.error('JSON parsing error:', e);
      // Flexible fallback - use broad text search
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
        explanation: "Using flexible text search with all filters open for maximum results"
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
