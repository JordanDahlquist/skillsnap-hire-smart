
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
      .slice(0, 15000); // Increased limit for deeper analysis

    // Extract potential company name from HTML structure
    const htmlCompanyName = extractCompanyFromHTML(html);
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : '';
    const domainCompanyName = extractCompanyFromDomain(websiteUrl.href);

    console.log('Extracted company name from HTML:', htmlCompanyName);
    console.log('Page title:', pageTitle);
    console.log('Domain company name:', domainCompanyName);

    // Enhanced AI analysis with comprehensive content mining
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
            content: `You are an expert at analyzing company websites to extract comprehensive, compelling information for creating outstanding job postings.

CRITICAL: You must respond with ONLY a valid JSON object, no markdown formatting, no backticks, no extra text.

Your mission is to deeply analyze this company's website and extract the most compelling, exciting, and unique information that would make someone genuinely excited to work there. Think like a top-tier recruiter who knows how to make companies sound amazing.

DEEP CONTENT MINING REQUIREMENTS:
1. **COMPANY ACHIEVEMENTS & AWARDS**: Look for any awards, recognitions, certifications, industry rankings, or accolades
2. **IMPRESSIVE METRICS**: Extract growth numbers, client counts, revenue milestones, years in business, team size
3. **NOTABLE CLIENTS/PARTNERSHIPS**: Identify big-name clients, partnerships, or collaborations mentioned
4. **RECENT NEWS & MILESTONES**: Look for recent achievements, product launches, expansions, or exciting developments  
5. **UNIQUE VALUE PROPOSITIONS**: What makes this company different, innovative, or industry-leading
6. **COMPANY CULTURE HIGHLIGHTS**: Extract specific culture elements, values, work environment details
7. **LEADERSHIP & EXPERTISE**: Notable team members, founders, or industry expertise mentioned
8. **SOCIAL PROOF**: Testimonials, case studies, success stories, or client praise
9. **MARKET POSITION**: Industry leadership, competitive advantages, or market recognition
10. **EXCITING PROJECTS**: Innovative work, cutting-edge projects, or impressive portfolio pieces

ANALYSIS CONTEXT:
- HTML extracted company name: ${htmlCompanyName}
- Page title: ${pageTitle}
- Domain-based name: ${domainCompanyName}

Prioritize the HTML extracted name if it looks like a real company name.

RESPONSE FORMAT - Return this exact JSON structure with compelling, specific content:
{
  "companyName": "Actual company name (prioritize HTML extracted if valid)",
  "location": "Primary location/headquarters if found",
  "technologies": ["Array", "of", "specific", "technologies", "tools", "platforms"],
  "benefits": ["Array", "of", "actual", "employee", "benefits", "NOT", "services"],
  "industry": "Specific industry or sector",
  "companySize": "Specific size info, employee count, or growth stage",
  "description": "Compelling 2-3 sentence description highlighting what makes them exciting",
  "culture": "Specific culture elements, values, and work environment details",
  "products": "Main products, services, or solutions they offer",
  "summary": "Engaging summary for job context that captures their uniqueness",
  "achievements": ["Array", "of", "awards", "recognitions", "milestones", "achievements"],
  "notableClients": ["Array", "of", "impressive", "clients", "partnerships", "if", "mentioned"],
  "recentNews": ["Array", "of", "recent", "developments", "launches", "expansions"],
  "uniqueSellingPoints": ["Array", "of", "what", "makes", "them", "special", "or", "innovative"],
  "socialProof": ["Array", "of", "testimonials", "success", "stories", "case", "studies"],
  "marketPosition": "Their position in the industry, competitive advantages, recognition",
  "growthMetrics": ["Array", "of", "impressive", "numbers", "growth", "statistics"],
  "leadershipHighlights": ["Array", "of", "notable", "team", "expertise", "founder", "info"]
}

CRITICAL INSTRUCTIONS:
- Focus on extracting SPECIFIC, EXCITING, and COMPELLING information
- Look for concrete achievements, not generic statements
- Prioritize information that would make someone want to work there
- Extract actual awards, specific client names, real numbers, concrete achievements
- Make the company sound as exciting and appealing as possible based on factual content
- If information isn't available, use empty arrays [] or null rather than making things up
- Be specific and concrete, not generic or vague`
          },
          {
            role: 'user',
            content: `Website Content:\n${textContent}`
          }
        ],
        temperature: 0.2,
        max_tokens: 2000
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
      
      // Ensure arrays exist with fallbacks
      companyData.technologies = companyData.technologies || [];
      companyData.benefits = companyData.benefits || [];
      companyData.achievements = companyData.achievements || [];
      companyData.notableClients = companyData.notableClients || [];
      companyData.recentNews = companyData.recentNews || [];
      companyData.uniqueSellingPoints = companyData.uniqueSellingPoints || [];
      companyData.socialProof = companyData.socialProof || [];
      companyData.growthMetrics = companyData.growthMetrics || [];
      companyData.leadershipHighlights = companyData.leadershipHighlights || [];
      
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
        summary: textContent.slice(0, 200) + "...",
        achievements: [],
        notableClients: [],
        recentNews: [],
        uniqueSellingPoints: [],
        socialProof: [],
        marketPosition: null,
        growthMetrics: [],
        leadershipHighlights: []
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
        summary: null,
        achievements: [],
        notableClients: [],
        recentNews: [],
        uniqueSellingPoints: [],
        socialProof: [],
        marketPosition: null,
        growthMetrics: [],
        leadershipHighlights: []
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
