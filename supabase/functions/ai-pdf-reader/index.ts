
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function extractTextWithAI(pdfBuffer: Uint8Array, fileName: string): Promise<string> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    console.log(`Processing PDF with AI: ${fileName}`);
    
    // First, upload the PDF file to OpenAI
    const formData = new FormData();
    const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
    formData.append('file', pdfBlob, fileName);
    formData.append('purpose', 'assistants');

    console.log('Uploading PDF to OpenAI...');
    const uploadResponse = await fetch('https://api.openai.com/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.text();
      console.error('OpenAI file upload error:', errorData);
      throw new Error(`Failed to upload PDF to OpenAI: ${uploadResponse.status}`);
    }

    const uploadData = await uploadResponse.json();
    const fileId = uploadData.id;
    console.log('PDF uploaded successfully, file ID:', fileId);

    // Now use the uploaded file in a chat completion
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert at reading and reformatting job descriptions from PDF documents. Your task is to:
            1. Read the provided PDF document carefully
            2. Extract all the job description content
            3. Reformat it as a clean, professional job posting
            4. Preserve all important information including: job title, responsibilities, requirements, qualifications, benefits, company info, etc.
            5. Remove any irrelevant formatting artifacts or metadata
            6. Return ONLY the clean job description text, nothing else
            7. If the PDF contains multiple jobs, focus on the main job description
            8. Format the output with proper paragraphs and structure`
          },
          {
            role: 'user',
            content: `Please extract and reformat the job description from the uploaded PDF file (${fileName}). Return a clean, professional job posting with all the key information preserved.`
          }
        ],
        max_tokens: 4000,
        temperature: 0.3,
        tools: [
          {
            type: 'file_search'
          }
        ],
        tool_resources: {
          file_search: {
            file_ids: [fileId]
          }
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    const extractedText = data.choices[0].message.content.trim();
    
    if (!extractedText || extractedText.length < 50) {
      throw new Error('Could not extract meaningful content from the PDF. The document may be corrupted or contain only images.');
    }

    console.log(`Successfully extracted ${extractedText.length} characters using AI`);
    
    // Clean up: delete the uploaded file
    try {
      await fetch(`https://api.openai.com/v1/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
        },
      });
      console.log('Temporary file cleaned up');
    } catch (cleanupError) {
      console.warn('Could not clean up temporary file:', cleanupError);
    }

    return extractedText;

  } catch (error) {
    console.error('Error in AI text extraction:', error);
    throw new Error(`Failed to extract text using AI: ${error.message}`);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('AI PDF reading request received');
    
    const formData = await req.formData();
    const pdfFile = formData.get('pdf') as File;
    
    if (!pdfFile) {
      throw new Error('No PDF file provided');
    }
    
    console.log(`Processing PDF with AI: ${pdfFile.name}, size: ${pdfFile.size} bytes`);
    
    // Convert file to buffer
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdfBuffer = new Uint8Array(arrayBuffer);
    
    // Extract text using AI
    const extractedText = await extractTextWithAI(pdfBuffer, pdfFile.name);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        text: extractedText,
        fileName: pdfFile.name,
        method: 'ai-powered'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Error processing PDF with AI:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to process PDF with AI' 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
