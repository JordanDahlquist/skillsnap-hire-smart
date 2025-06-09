
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple PDF text extraction function
function extractTextFromPDF(pdfBuffer: Uint8Array): string {
  try {
    // Convert buffer to string for basic text extraction
    const pdfString = new TextDecoder().decode(pdfBuffer);
    
    // Basic PDF text extraction - look for text between stream objects
    const textMatches = pdfString.match(/BT\s*(.*?)\s*ET/gs);
    let extractedText = '';
    
    if (textMatches) {
      for (const match of textMatches) {
        // Extract text from PDF commands
        const textCommands = match.match(/\((.*?)\)/g);
        if (textCommands) {
          for (const cmd of textCommands) {
            const text = cmd.slice(1, -1); // Remove parentheses
            extractedText += text + ' ';
          }
        }
      }
    }
    
    // If no text found with basic extraction, try alternative method
    if (!extractedText.trim()) {
      // Look for plain text in the PDF
      const lines = pdfString.split('\n');
      for (const line of lines) {
        // Skip binary data and PDF commands
        if (!line.includes('%') && !line.includes('<<') && !line.includes('>>') && 
            line.length > 10 && line.match(/[a-zA-Z]/)) {
          extractedText += line.trim() + '\n';
        }
      }
    }
    
    // Clean up the extracted text
    return extractedText
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-.,!?():]/g, '')
      .trim();
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('PDF parsing request received');
    
    const formData = await req.formData();
    const pdfFile = formData.get('pdf') as File;
    
    if (!pdfFile) {
      throw new Error('No PDF file provided');
    }
    
    console.log(`Processing PDF: ${pdfFile.name}, size: ${pdfFile.size} bytes`);
    
    // Convert file to buffer
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdfBuffer = new Uint8Array(arrayBuffer);
    
    // Extract text from PDF
    const extractedText = extractTextFromPDF(pdfBuffer);
    
    if (!extractedText || extractedText.length < 10) {
      throw new Error('Could not extract meaningful text from PDF. Please ensure the PDF contains readable text.');
    }
    
    console.log(`Successfully extracted ${extractedText.length} characters`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        text: extractedText,
        fileName: pdfFile.name 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Error processing PDF:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to process PDF' 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
