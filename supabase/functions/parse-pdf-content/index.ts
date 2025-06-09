
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { extractTextFromPDF } from "./pdfExtraction.ts";
import { cleanExtractedText, validateExtractedText } from "./textProcessing.ts";
import { corsHeaders, createCorsResponse, createCorsOptionsResponse } from "./corsUtils.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
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
    const rawText = extractTextFromPDF(pdfBuffer);
    
    // Clean up the extracted text
    const cleanText = cleanExtractedText(rawText);
    
    if (!validateExtractedText(cleanText)) {
      throw new Error('Could not extract meaningful text from PDF. Please ensure the PDF contains readable text.');
    }
    
    console.log(`Successfully extracted ${cleanText.length} characters`);
    
    return createCorsResponse({ 
      success: true, 
      text: cleanText,
      fileName: pdfFile.name 
    });
    
  } catch (error) {
    console.error('Error processing PDF:', error);
    return createCorsResponse({ 
      success: false, 
      error: error.message || 'Failed to process PDF' 
    }, 400);
  }
});
