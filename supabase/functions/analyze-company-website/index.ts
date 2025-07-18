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

    // Enhanced text extraction with better parsing for awards, achievements, and unique content
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 20000); // Increased limit for comprehensive analysis

    // Extract potential company name from HTML structure
    const htmlCompanyName = extractCompanyFromHTML(html);
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : '';
    const domainCompanyName = extractCompanyFromDomain(websiteUrl.href);

    console.log('Extracted company name from HTML:', htmlCompanyName);
    console.log('Page title:', pageTitle);
    console.log('Domain company name:', domainCompanyName);

    // ENHANCED AI analysis with deep content mining capabilities
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
            content: `You are an expert investigative analyst specializing in extracting the most compelling, exciting, and unique information about companies from their websites. Your mission is to uncover what makes this company truly special and worth joining.

CRITICAL: You must respond with ONLY a valid JSON object, no markdown formatting, no backticks, no extra text.

DEEP INTELLIGENCE EXTRACTION MISSION:
You are tasked with mining this website for the most compelling, exciting, and unique information that would make top talent genuinely excited to work at this company. Think like an elite headhunter who knows how to make companies irresistible.

COMPREHENSIVE CONTENT MINING REQUIREMENTS:
1. **AWARDS & RECOGNITION**: Hunt for ANY awards, certifications, industry rankings, "Best of" lists, recognitions, accolades, or honors
2. **IMPRESSIVE METRICS & ACHIEVEMENTS**: Extract growth percentages, revenue milestones, client counts, years in business, team size, market share, success rates
3. **NOTABLE CLIENTS & PARTNERSHIPS**: Identify big-name clients, Fortune 500 partnerships, celebrity clients, government contracts, major collaborations
4. **RECENT NEWS & EXCITING DEVELOPMENTS**: Look for recent launches, expansions, funding rounds, new offices, major wins, breakthrough projects
5. **UNIQUE VALUE PROPOSITIONS**: What makes them different, innovative, industry-leading, or cutting-edge
6. **COMPANY CULTURE GOLD**: Extract specific culture elements, unique perks, work environment details, team philosophy, values in action
7. **LEADERSHIP EXCELLENCE**: Notable founders, industry veterans, thought leaders, impressive backgrounds, company expertise
8. **SOCIAL PROOF & SUCCESS STORIES**: Client testimonials, case studies, success metrics, customer praise, impact stories
9. **MARKET LEADERSHIP**: Industry firsts, innovations, competitive advantages, thought leadership, market position
10. **EXCITING PROJECTS & PORTFOLIO**: Cutting-edge work, impressive projects, innovative solutions, creative campaigns

ANALYSIS CONTEXT:
- HTML extracted company name: ${htmlCompanyName}
- Page title: ${pageTitle}
- Domain-based name: ${domainCompanyName}

RESPONSE FORMAT - Return this exact JSON structure filled with SPECIFIC, EXCITING, COMPELLING content:
{
  "companyName": "Actual company name (prioritize HTML extracted if valid)",
  "location": "Primary location/headquarters with specifics",
  "technologies": ["Specific", "technologies", "tools", "platforms", "they", "actually", "use"],
  "benefits": ["Actual", "employee", "benefits", "perks", "NOT", "client", "services"],
  "industry": "Specific industry/sector with nuance",
  "companySize": "Specific employee count, team size, or growth details",
  "description": "Compelling 2-3 sentences highlighting their most exciting qualities and achievements",
  "culture": "Specific culture elements, values, work environment details that make them special",
  "products": "Their main products/services with specifics about what makes them unique",
  "summary": "Exciting summary that captures their most impressive achievements and what makes them remarkable",
  "achievements": ["Specific", "awards", "recognitions", "certifications", "industry", "honors", "accolades"],
  "notableClients": ["Big", "name", "clients", "Fortune", "500", "partnerships", "celebrity", "clients"],
  "recentNews": ["Recent", "launches", "expansions", "funding", "major", "wins", "breakthrough", "projects"],
  "uniqueSellingPoints": ["What", "makes", "them", "innovative", "different", "industry", "leading", "cutting", "edge"],
  "socialProof": ["Client", "testimonials", "success", "stories", "case", "studies", "impact", "metrics"],
  "marketPosition": "Their position as industry leaders, innovators, or market disruptors with specifics",
  "growthMetrics": ["Impressive", "growth", "percentages", "revenue", "milestones", "expansion", "statistics"],
  "leadershipHighlights": ["Notable", "founders", "industry", "veterans", "thought", "leaders", "impressive", "backgrounds"]
}

CRITICAL SUCCESS FACTORS:
- Extract CONCRETE, SPECIFIC information, not generic descriptions
- Focus on what makes them EXCITING and SPECIAL, not just functional
- Look for proof points that would impress potential employees
- Prioritize recent achievements, growth, and forward momentum
- Identify elements that create genuine career excitement
- If specific information isn't found, use empty arrays [] rather than making things up
- Make every field count - each should add genuine value and excitement

EXTRACTION INTENSITY: MAXIMUM
This analysis will be used to create job postings that make top talent excited to apply. Extract every compelling detail that would make someone say "I want to work there!"

COMPANY ANALYSIS INTELLIGENCE TARGET: Make this company sound as exciting and attractive as possible based on factual website content.`
          },
          {
            role: 'user',
            content: `WEBSITE CONTENT TO ANALYZE:\n\n${textContent}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2500
      }),
    });

    if (!analysisResponse.ok) {
      throw new Error(`OpenAI API error: ${analysisResponse.statusText}`);
    }

    const analysisData = await analysisResponse.json();
    let analysisResult = analysisData.choices[0].message.content.trim();

    console.log('Enhanced analysis result preview:', analysisResult.substring(0, 300) + '...');

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
      console.error('Failed to parse enhanced analysis JSON:', error);
      
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

    console.log('Final enhanced company analysis:', {
      companyName: companyData.companyName,
      achievementsCount: companyData.achievements?.length || 0,
      uniquePointsCount: companyData.uniqueSellingPoints?.length || 0,
      clientsCount: companyData.notableClients?.length || 0,
      newsCount: companyData.recentNews?.length || 0
    });

    return new Response(
      JSON.stringify(companyData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in enhanced analyze-company-website function:', error);
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
