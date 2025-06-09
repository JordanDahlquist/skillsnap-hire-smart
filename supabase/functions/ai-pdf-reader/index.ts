
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
    
    // Convert PDF to base64
    const base64Pdf = btoa(String.fromCharCode(...pdfBuffer));
    
    // Use OpenAI's document understanding capability with gpt-4o
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
            content: 'You are an expert at extracting text content from PDF documents. Extract ALL the text content from the provided PDF exactly as written, preserving the structure and formatting as much as possible. Do not summarize or rewrite - just extract the complete text content.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please extract all the text content from this PDF file (${fileName}) exactly as written. Return the complete text content without any modifications.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${base64Pdf}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0.1
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
    
    if (!extractedText || extractedText.length < 10) {
      throw new Error('Could not extract meaningful content from the PDF. The document may be corrupted or contain only images.');
    }

    console.log(`Successfully extracted ${extractedText.length} characters using AI`);
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
        method: 'ai-direct'
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
