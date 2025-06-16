
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
    const { url } = await req.json();
    console.log('Analyzing website:', url);

    if (!url) {
      throw new Error('Website URL is required');
    }

    // Validate URL format
    let websiteUrl: URL;
    try {
      websiteUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      throw new Error('Invalid URL format');
    }

    // Fetch website content
    console.log('Fetching website content from:', websiteUrl.href);
    const response = await fetch(websiteUrl.href, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JobAnalyzer/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status}`);
    }

    const html = await response.text();
    console.log('Fetched HTML content, length:', html.length);

    // Extract text content from HTML (simple text extraction)
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 8000); // Limit content for API

    console.log('Extracted text content, length:', textContent.length);

    // Use AI to analyze the website content
    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert at analyzing company websites to extract key information for job posting generation. 
            
            Analyze the provided website content and extract the following information in JSON format:
            {
              "description": "Brief company description (2-3 sentences)",
              "industry": "Primary industry or sector",
              "companySize": "Estimated company size (startup, small, medium, large, enterprise) or employee count if available",
              "products": "Main products or services offered",
              "culture": "Company culture, values, or work environment details",
              "techStack": "Technology stack or tools mentioned (if tech company)",
              "summary": "Overall summary combining key points for job description context"
            }
            
            If any information is not available or unclear, use null for that field. Be concise but informative.`
          },
          {
            role: 'user',
            content: `Please analyze this company website content and extract key information:\n\n${textContent}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      }),
    });

    if (!analysisResponse.ok) {
      throw new Error(`OpenAI API error: ${analysisResponse.statusText}`);
    }

    const analysisData = await analysisResponse.json();
    const analysisResult = analysisData.choices[0].message.content;

    console.log('AI analysis result:', analysisResult);

    // Parse the JSON response
    let companyData;
    try {
      companyData = JSON.parse(analysisResult);
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', error);
      // Fallback to basic analysis
      companyData = {
        description: "Company information extracted from website",
        industry: null,
        companySize: null,
        products: null,
        culture: null,
        techStack: null,
        summary: textContent.slice(0, 200) + "..."
      };
    }

    console.log('Parsed company data:', companyData);

    return new Response(
      JSON.stringify(companyData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-company-website function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        description: null,
        industry: null,
        companySize: null,
        products: null,
        culture: null,
        techStack: null,
        summary: null
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
