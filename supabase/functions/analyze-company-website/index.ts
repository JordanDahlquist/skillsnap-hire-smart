
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

    // Extract text content from HTML with better parsing
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 8000);

    // Extract potential company name from title tag
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : '';

    console.log('Extracted text content, length:', textContent.length);
    console.log('Page title:', pageTitle);

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

CRITICAL: You must respond with ONLY a valid JSON object, no markdown formatting, no backticks, no extra text.

Analyze the provided website content and page title to extract information. Pay special attention to:
1. The actual company name (not generic descriptions like "a consulting agency" or "the company")
2. Look for the company name in headers, navigation menus, page title, footer, about sections
3. Industry and services offered
4. Company size indicators
5. Location information from contact pages

Respond with this exact JSON structure:
{
  "companyName": "Actual company name from the website",
  "description": "2-3 sentence company description",
  "industry": "Primary industry or sector",
  "companySize": "startup/small/medium/large/enterprise or employee count if found",
  "products": "Main products or services offered",
  "culture": "Company culture, values, or work environment details",
  "techStack": "Technology stack or tools mentioned if tech company",
  "location": "Company location if found on website",
  "summary": "Overall summary for job description context"
}`
          },
          {
            role: 'user',
            content: `Page Title: ${pageTitle}\n\nWebsite Content:\n${textContent}`
          }
        ],
        temperature: 0.2,
        max_tokens: 1000
      }),
    });

    if (!analysisResponse.ok) {
      throw new Error(`OpenAI API error: ${analysisResponse.statusText}`);
    }

    const analysisData = await analysisResponse.json();
    let analysisResult = analysisData.choices[0].message.content.trim();

    console.log('Raw AI analysis result:', analysisResult);

    // Remove any markdown formatting if present
    analysisResult = analysisResult.replace(/^```json\s*/, '').replace(/\s*```$/, '');

    // Parse the JSON response
    let companyData;
    try {
      companyData = JSON.parse(analysisResult);
      
      // Validate that we have a real company name
      if (!companyData.companyName || 
          companyData.companyName.toLowerCase().includes('consulting agency') ||
          companyData.companyName.toLowerCase().includes('the company') ||
          companyData.companyName.toLowerCase() === 'company') {
        
        // Try to extract company name from page title or domain
        const domainName = websiteUrl.hostname.replace('www.', '').split('.')[0];
        const titleCompanyName = pageTitle.split('|')[0].split('-')[0].trim();
        
        companyData.companyName = titleCompanyName.length > 2 ? titleCompanyName : 
                                 domainName.charAt(0).toUpperCase() + domainName.slice(1);
      }
      
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', error);
      
      // Enhanced fallback extraction
      const domainName = websiteUrl.hostname.replace('www.', '').split('.')[0];
      const titleCompanyName = pageTitle.split('|')[0].split('-')[0].trim();
      
      companyData = {
        companyName: titleCompanyName.length > 2 ? titleCompanyName : 
                    domainName.charAt(0).toUpperCase() + domainName.slice(1),
        description: textContent.slice(0, 300) + "...",
        industry: null,
        companySize: null,
        products: null,
        culture: null,
        techStack: null,
        location: null,
        summary: textContent.slice(0, 200) + "..."
      };
    }

    console.log('Final parsed company data:', companyData);

    return new Response(
      JSON.stringify(companyData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-company-website function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        companyName: null,
        description: null,
        industry: null,
        companySize: null,
        products: null,
        culture: null,
        techStack: null,
        location: null,
        summary: null
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
