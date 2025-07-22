import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeUrl } = await req.json();
    
    if (!resumeUrl) {
      return new Response(
        JSON.stringify({ error: 'Resume URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Analyzing resume at URL:', resumeUrl);

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase configuration missing' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Extract filename from URL - handle both full URLs and relative paths
    let fileName: string;
    if (resumeUrl.includes('/storage/v1/object/public/application-files/')) {
      fileName = resumeUrl.split('/').pop() || '';
    } else if (resumeUrl.startsWith('http')) {
      fileName = resumeUrl.split('/').pop() || '';
    } else {
      // Assume it's already a filename
      fileName = resumeUrl;
    }

    console.log('Downloading file:', fileName);

    // Download the PDF file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('application-files')
      .download(fileName);

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      return new Response(
        JSON.stringify({ error: 'Failed to download resume file' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!fileData) {
      return new Response(
        JSON.stringify({ error: 'Resume file not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Convert the file data to ArrayBuffer
    const arrayBuffer = await fileData.arrayBuffer();
    console.log('File size:', arrayBuffer.byteLength, 'bytes');

    // Check file size (OpenAI has a 512MB limit, but we'll use 50MB as a reasonable limit)
    const maxSizeBytes = 50 * 1024 * 1024; // 50MB
    if (arrayBuffer.byteLength > maxSizeBytes) {
      return new Response(
        JSON.stringify({ error: 'File too large. Maximum size is 50MB.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Upload PDF directly to OpenAI Files API
    console.log('Uploading PDF to OpenAI Files API...');
    const formData = new FormData();
    formData.append('file', new Blob([arrayBuffer], { type: 'application/pdf' }), fileName);
    formData.append('purpose', 'assistants');

    const uploadResponse = await fetch('https://api.openai.com/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const uploadError = await uploadResponse.text();
      console.error('OpenAI file upload failed:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload PDF to OpenAI' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const uploadResult = await uploadResponse.json();
    console.log('File uploaded to OpenAI with ID:', uploadResult.id);

    // Generate comprehensive resume summary using the uploaded file
    console.log('Generating resume summary...');
    const summaryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert HR professional analyzing resumes. Read the provided resume document and create a comprehensive professional summary.

Generate a detailed summary that includes:
- Professional background and years of experience
- Key technical skills and expertise areas
- Notable achievements and accomplishments
- Educational background and certifications
- Industry experience and domain knowledge
- Leadership and soft skills
- Career progression and growth

Write the summary in a clear, professional tone that would be useful for HR professionals and hiring managers to quickly understand the candidate's qualifications and potential fit for roles. Be specific about technologies, tools, and methodologies mentioned.

The summary should be comprehensive (300-500 words) but concise enough to be easily scannable.`
          },
          {
            role: 'user',
            content: `Please analyze the uploaded resume file (ID: ${uploadResult.id}) and provide a comprehensive professional summary of this candidate.`,
          }
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
    });

    if (!summaryResponse.ok) {
      const summaryError = await summaryResponse.text();
      console.error('OpenAI summary generation failed:', summaryError);
      
      // Clean up uploaded file
      await fetch(`https://api.openai.com/v1/files/${uploadResult.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
        },
      });

      return new Response(
        JSON.stringify({ error: 'Failed to generate resume summary' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const summaryData = await summaryResponse.json();
    
    if (!summaryData.choices || !summaryData.choices[0]) {
      console.error('No summary response from OpenAI');
      
      // Clean up uploaded file
      await fetch(`https://api.openai.com/v1/files/${uploadResult.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
        },
      });

      return new Response(
        JSON.stringify({ error: 'No response from OpenAI summary generation' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const resumeSummary = summaryData.choices[0].message.content;
    console.log('Generated resume summary (length):', resumeSummary.length);

    // Clean up the uploaded file from OpenAI
    try {
      await fetch(`https://api.openai.com/v1/files/${uploadResult.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
        },
      });
      console.log('Cleaned up uploaded file from OpenAI');
    } catch (cleanupError) {
      console.warn('Failed to cleanup uploaded file:', cleanupError);
    }

    // Return both summary and minimal parsed data for backward compatibility
    const response = {
      parsedData: {
        personalInfo: {
          name: "",
          email: "",
          phone: "",
          location: ""
        },
        workExperience: [],
        education: [],
        skills: [],
        summary: resumeSummary,
        totalExperience: ""
      },
      resumeSummary: resumeSummary
    };

    console.log('Successfully generated resume summary');

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error analyzing resume:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack?.substring(0, 500)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});