import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobOverview } = await req.json();
    
    if (!jobOverview || typeof jobOverview !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Job overview text is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert at extracting structured job information from natural language descriptions. 

Extract the following information from job descriptions and return them as JSON:
- companyName: The company name (clean format, proper capitalization)
- jobTitle: The job title/position
- location: City and state/country (standardized format like "Los Angeles, CA" or "New York, NY")
- experienceLevel: One of: "entry-level", "mid-level", "senior-level", "executive"
- roleType: One of: "full-time", "part-time", "contract", "freelance", "internship", "executive"
- employmentType: One of: "full-time", "part-time", "contract", "freelance", "internship"
- industry: The industry/sector if mentioned
- isExecutiveRole: Boolean - true if it's C-level, VP, Director, or similar executive position
- salary: Any salary information mentioned
- workLocation: One of: "remote", "hybrid", "on-site" if mentioned

Rules:
1. Only extract information that's clearly stated or strongly implied
2. Use null for fields that can't be determined
3. Standardize location names (LA -> Los Angeles, NYC -> New York, SF -> San Francisco)
4. Detect executive roles from titles like CEO, CTO, VP, Director, President, etc.
5. Be conservative - if unsure, use null rather than guessing
6. Return only valid JSON, no explanations

Examples:
"CEO of a marketing agency in Los Angeles" -> {"companyName": null, "jobTitle": "CEO", "location": "Los Angeles, CA", "experienceLevel": "executive", "isExecutiveRole": true}
"Senior React Developer at Tech Corp in NYC" -> {"companyName": "Tech Corp", "jobTitle": "Senior React Developer", "location": "New York, NY", "experienceLevel": "senior-level", "isExecutiveRole": false}`
          },
          {
            role: 'user',
            content: `Extract job information from: "${jobOverview}"`
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const extractedText = aiResponse.choices[0].message.content;

    console.log('AI extracted text:', extractedText);

    // Parse the JSON response
    let parsedData;
    try {
      parsedData = JSON.parse(extractedText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', extractedText);
      throw new Error('AI returned invalid JSON');
    }

    // Add confidence scores and validation
    const result = {
      success: true,
      data: {
        companyName: parsedData.companyName || null,
        jobTitle: parsedData.jobTitle || null,
        location: parsedData.location || null,
        experienceLevel: parsedData.experienceLevel || null,
        roleType: parsedData.roleType || null,
        employmentType: parsedData.employmentType || null,
        industry: parsedData.industry || null,
        isExecutiveRole: parsedData.isExecutiveRole || false,
        salary: parsedData.salary || null,
        workLocation: parsedData.workLocation || null
      },
      originalInput: jobOverview
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in parse-job-overview function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to parse job overview' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});