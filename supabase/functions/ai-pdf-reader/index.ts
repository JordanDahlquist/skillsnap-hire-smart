
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced PDF text extraction with multiple methods
function extractTextFromPDF(pdfBuffer: Uint8Array): string {
  try {
    console.log('Starting PDF text extraction, buffer size:', pdfBuffer.length);
    
    const pdfString = new TextDecoder('latin1').decode(pdfBuffer);
    let extractedText = '';
    
    // Method 1: Extract from BT...ET blocks (most reliable for text-based PDFs)
    console.log('Attempting Method 1: BT...ET text blocks');
    const textObjectRegex = /BT\s*(.*?)\s*ET/gs;
    const textObjects = pdfString.match(textObjectRegex);
    
    if (textObjects && textObjects.length > 0) {
      console.log(`Found ${textObjects.length} text objects`);
      for (const textObj of textObjects) {
        // Extract from Tj operations
        const tjRegex = /\((.*?)\)\s*Tj/g;
        let match;
        while ((match = tjRegex.exec(textObj)) !== null) {
          const text = match[1];
          if (text && text.length > 0) {
            extractedText += decodeText(text) + ' ';
          }
        }
        
        // Extract from TJ array operations
        const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
        while ((match = tjArrayRegex.exec(textObj)) !== null) {
          const arrayContent = match[1];
          const textParts = arrayContent.match(/\((.*?)\)/g);
          if (textParts) {
            for (const part of textParts) {
              const text = part.slice(1, -1);
              if (text && text.length > 2) {
                extractedText += decodeText(text) + ' ';
              }
            }
          }
        }
      }
    }
    
    // Method 2: Extract from stream content if Method 1 failed
    if (!extractedText.trim()) {
      console.log('Method 1 failed, attempting Method 2: Stream content');
      const streamRegex = /stream\s*(.*?)\s*endstream/gs;
      const streams = pdfString.match(streamRegex);
      
      if (streams && streams.length > 0) {
        console.log(`Found ${streams.length} streams`);
        for (const stream of streams) {
          const contentLines = stream.split('\n');
          for (const line of contentLines) {
            if (line.includes('(') && line.includes(')') && 
                !line.includes('<<') && !line.includes('>>') &&
                line.length < 500) {
              const textMatch = line.match(/\((.*?)\)/g);
              if (textMatch) {
                for (const match of textMatch) {
                  const text = match.slice(1, -1);
                  if (text && text.length > 2 && /[a-zA-Z]/.test(text)) {
                    extractedText += decodeText(text) + ' ';
                  }
                }
              }
            }
          }
        }
      }
    }
    
    // Method 3: Fallback - look for readable text patterns
    if (!extractedText.trim()) {
      console.log('Method 2 failed, attempting Method 3: Text pattern matching');
      const lines = pdfString.split('\n');
      for (const line of lines) {
        if (line.length > 10 && line.length < 500 && 
            /[a-zA-Z]{3,}/.test(line) && 
            !line.includes('%') && 
            !line.includes('<<') && 
            !line.includes('>>') &&
            !line.includes('obj') &&
            !line.includes('endobj') &&
            !line.includes('stream') &&
            !line.includes('endstream')) {
          
          const cleanLine = line.replace(/[^\w\s\-.,!?():'"]/g, ' ').trim();
          if (cleanLine.length > 5 && /[a-zA-Z]/.test(cleanLine)) {
            extractedText += cleanLine + '\n';
          }
        }
      }
    }
    
    if (extractedText.trim()) {
      console.log(`Successfully extracted ${extractedText.length} characters using PDF parsing`);
      return extractedText;
    } else {
      throw new Error('No readable text found in PDF. The PDF may be image-based, encrypted, or corrupted.');
    }
    
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

// Enhanced text decoding with better error handling
function decodeText(text: string): string {
  try {
    let decoded = text
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '')
      .replace(/\\t/g, ' ')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\\\/g, '\\');
    
    // Handle octal escape sequences
    decoded = decoded.replace(/\\(\d{3})/g, (match, octal) => {
      const charCode = parseInt(octal, 8);
      return charCode >= 32 && charCode <= 126 ? String.fromCharCode(charCode) : ' ';
    });
    
    return decoded;
  } catch (error) {
    console.warn('Text decoding failed, returning original:', error);
    return text;
  }
}

// Enhanced text cleaning
function cleanExtractedText(extractedText: string): string {
  console.log('Cleaning extracted text, original length:', extractedText.length);
  
  let cleanText = extractedText
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\\t/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\-.,!?():'\n]/g, ' ')
    .trim();
  
  // Remove excessive whitespace and normalize
  cleanText = cleanText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    .replace(/\n\s*\n/g, '\n\n');
  
  console.log('Cleaned text length:', cleanText.length);
  return cleanText;
}

// Enhanced AI text cleaning with better error handling
async function cleanTextWithAI(rawText: string, fileName: string): Promise<string> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    console.log('No OpenAI API key found, skipping AI cleanup');
    return rawText;
  }

  try {
    console.log('Attempting AI text cleanup');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are an expert at cleaning up text extracted from PDF documents. Clean up the formatting, fix spacing issues, and make the text readable while preserving ALL the original content exactly as written. Do not summarize, rewrite, or change the meaning - just fix formatting issues.'
          },
          {
            role: 'user',
            content: `Please clean up this text extracted from a PDF file (${fileName}). Fix any formatting issues, spacing problems, or encoding artifacts, but preserve all the original content exactly:\n\n${rawText.substring(0, 3000)}${rawText.length > 3000 ? '...' : ''}`
          }
        ],
        max_tokens: 4000,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('AI cleanup API error:', response.status, errorText);
      return rawText;
    }

    const data = await response.json();
    const cleanedText = data.choices[0]?.message?.content?.trim();
    
    if (cleanedText && cleanedText.length > 0) {
      console.log('AI cleanup successful');
      return cleanedText;
    } else {
      console.warn('AI cleanup returned empty result');
      return rawText;
    }

  } catch (error) {
    console.warn('AI cleanup error:', error);
    return rawText;
  }
}

// File validation
function validatePDFFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'File must be a PDF' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  if (file.size === 0) {
    return { valid: false, error: 'File appears to be empty' };
  }
  
  return { valid: true };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== PDF processing request received ===');
    
    const formData = await req.formData();
    const pdfFile = formData.get('pdf') as File;
    
    // Enhanced validation
    const validation = validatePDFFile(pdfFile);
    if (!validation.valid) {
      console.error('File validation failed:', validation.error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: validation.error,
          errorCode: 'VALIDATION_ERROR'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log(`Processing PDF: ${pdfFile.name}, size: ${pdfFile.size} bytes, type: ${pdfFile.type}`);
    
    // Convert file to buffer
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdfBuffer = new Uint8Array(arrayBuffer);
    
    console.log('PDF buffer created, attempting text extraction');
    
    // Extract text with enhanced error handling
    let rawText: string;
    try {
      rawText = extractTextFromPDF(pdfBuffer);
    } catch (extractionError) {
      console.error('Text extraction failed:', extractionError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: extractionError.message || 'Could not extract text from PDF',
          errorCode: 'EXTRACTION_ERROR',
          suggestions: [
            'The PDF may be image-based (scanned document)',
            'The PDF may be password protected',
            'The PDF may be corrupted',
            'Try a different PDF or convert to text manually'
          ]
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Clean the extracted text
    const cleanText = cleanExtractedText(rawText);
    
    if (!cleanText || cleanText.length < 10) {
      console.error('Insufficient text extracted:', cleanText.length, 'characters');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Could not extract meaningful text from PDF. The PDF may contain only images or be corrupted.',
          errorCode: 'INSUFFICIENT_TEXT',
          extractedLength: cleanText.length
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log(`Successfully extracted ${cleanText.length} characters`);
    
    // Enhanced AI text cleaning
    const finalText = await cleanTextWithAI(cleanText, pdfFile.name);
    
    console.log(`=== PDF processing completed successfully ===`);
    console.log(`Final text length: ${finalText.length} characters`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        text: finalText,
        fileName: pdfFile.name,
        method: 'enhanced-extraction',
        extractedLength: finalText.length,
        processingSteps: ['extraction', 'cleaning', 'ai-enhancement']
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('=== PDF processing error ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An unexpected error occurred while processing the PDF',
        errorCode: 'PROCESSING_ERROR'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
