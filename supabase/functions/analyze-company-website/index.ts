import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const extractCompanyFromHTML = (html: string): string => {
  // Extract potential company names from HTML structure
  const patterns = [
    /<h1[^>]*>([^<]+)<\/h1>/i,
    /<title[^>]*>([^<|]+)/i,
    /<meta[^>]*property="og:site_name"[^>]*content="([^"]+)"/i,
    /<meta[^>]*name="application-name"[^>]*content="([^"]+)"/i,
    /<nav[^>]*>[\s\S]*?<[^>]*class="[^"]*logo[^"]*"[^>]*>([^<]+)</i,
  ];
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      if (candidate.length > 1 && candidate.length < 50 && !candidate.includes('|')) {
        return candidate;
      }
    }
  }
  
  return '';
};

const extractCompanyFromDomain = (url: string): string => {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    const mainPart = domain.split('.')[0];
    
    // Convert to proper case
    return mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
  } catch {
    return '';
  }
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
      .slice(0, 12000); // Increased limit for better analysis

    // Extract potential company name from HTML structure
    const htmlCompanyName = extractCompanyFromHTML(html);
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : '';
    const domainCompanyName = extractCompanyFromDomain(websiteUrl.href);

    console.log('Extracted company name from HTML:', htmlCompanyName);
    console.log('Page title:', pageTitle);
    console.log('Domain company name:', domainCompanyName);

    // Enhanced AI analysis with more comprehensive prompting
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
            content: `You are an expert at analyzing company websites to extract comprehensive information for intelligent job posting auto-population.

CRITICAL: You must respond with ONLY a valid JSON object, no markdown formatting, no backticks, no extra text.

Extract comprehensive company information focusing on details that would help auto-populate job forms intelligently. Pay special attention to:

1. COMPANY NAME: Extract the actual company name, not generic descriptions
2. LOCATION: Look for headquarters, office locations, "based in", "located in" 
3. TECHNOLOGIES: Extract specific tech stack, programming languages, frameworks, tools mentioned
4. BENEFITS: Look for employee benefits, perks, compensation details
5. COMPANY CULTURE: Extract values, work environment, company culture details
6. INDUSTRY: Determine the primary industry/sector
7. COMPANY SIZE: Look for employee count, company size indicators
8. PRODUCTS/SERVICES: What the company does/offers

Additional context provided:
- HTML extracted company name: ${htmlCompanyName}
- Page title: ${pageTitle}
- Domain-based name: ${domainCompanyName}

Prioritize the HTML extracted name if it looks like a real company name.

Respond with this exact JSON structure:
{
  "companyName": "Actual company name (prioritize HTML extracted if valid)",
  "location": "Primary location/headquarters if found",
  "technologies": ["Array", "of", "specific", "technologies", "mentioned"],
  "benefits": ["Array", "of", "employee", "benefits", "found"],
  "industry": "Primary industry or sector",
  "companySize": "startup/small/medium/large/enterprise or specific count if found",
  "description": "2-3 sentence company description",
  "culture": "Company culture and values summary",
  "products": "Main products or services offered",
  "summary": "Overall summary for job context"
}`
          },
          {
            role: 'user',
            content: `Website Content:\n${textContent}`
          }
        ],
        temperature: 0.1,
        max_tokens: 1500
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
      
      // Use the HTML extracted company name if it's valid and better than AI result
      if (htmlCompanyName && htmlCompanyName.length > 2 && 
          (!companyData.companyName || 
           companyData.companyName.toLowerCase().includes('consulting agency') ||
           companyData.companyName.toLowerCase().includes('the company'))) {
        companyData.companyName = htmlCompanyName;
      }
      
      // Fallback to domain name if still no valid company name
      if (!companyData.companyName || companyData.companyName.length < 3) {
        companyData.companyName = domainCompanyName;
      }
      
      // Ensure arrays exist
      companyData.technologies = companyData.technologies || [];
      companyData.benefits = companyData.benefits || [];
      
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', error);
      
      // Enhanced fallback extraction
      companyData = {
        companyName: htmlCompanyName || domainCompanyName,
        location: null,
        technologies: [],
        benefits: [],
        industry: null,
        companySize: null,
        description: textContent.slice(0, 300) + "...",
        culture: null,
        products: null,
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
        location: null,
        technologies: [],
        benefits: [],
        industry: null,
        companySize: null,
        description: null,
        culture: null,
        products: null,
        summary: null
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
