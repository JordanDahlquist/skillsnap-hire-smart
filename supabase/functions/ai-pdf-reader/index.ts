
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced PDF text extraction using multiple methods
async function extractTextFromPDF(pdfBuffer: Uint8Array): Promise<string> {
  try {
    console.log('Starting PDF text extraction, buffer size:', pdfBuffer.length);
    
    // Method 1: Try to use a more reliable PDF parsing approach
    let extractedText = await tryAdvancedPDFExtraction(pdfBuffer);
    
    // Method 2: Fallback to basic extraction if advanced fails
    if (!extractedText || !isQualityText(extractedText)) {
      console.log('Advanced extraction failed, trying basic method');
      extractedText = tryBasicPDFExtraction(pdfBuffer);
    }
    
    if (!extractedText || !isQualityText(extractedText)) {
      throw new Error('Could not extract readable text from this PDF. This may be an image-based PDF or use an unsupported format.');
    }
    
    return cleanExtractedText(extractedText);
    
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw error;
  }
}

// Advanced PDF extraction method
async function tryAdvancedPDFExtraction(pdfBuffer: Uint8Array): Promise<string> {
  try {
    const pdfString = new TextDecoder('latin1').decode(pdfBuffer);
    let extractedText = '';
    
    // Look for text content in a more structured way
    console.log('Attempting advanced PDF text extraction');
    
    // Method 1: Extract from text objects with better parsing
    const textObjectRegex = /BT\s+(.*?)\s+ET/gs;
    const textObjects = pdfString.match(textObjectRegex);
    
    if (textObjects && textObjects.length > 0) {
      console.log(`Found ${textObjects.length} text objects`);
      
      for (const textObj of textObjects) {
        // Extract text showing commands
        const tjRegex = /\(((?:[^()]|\([^)]*\))*)\)\s*Tj/g;
        const tjArrayRegex = /\[((?:[^\[\]]|\[[^\]]*\])*)\]\s*TJ/g;
        
        let match;
        
        // Process Tj commands
        while ((match = tjRegex.exec(textObj)) !== null) {
          const text = decodeTextString(match[1]);
          if (text && isReadableText(text)) {
            extractedText += text + ' ';
          }
        }
        
        // Process TJ array commands
        while ((match = tjArrayRegex.exec(textObj)) !== null) {
          const arrayContent = match[1];
          const textParts = arrayContent.match(/\(((?:[^()]|\([^)]*\))*)\)/g);
          if (textParts) {
            for (const part of textParts) {
              const text = decodeTextString(part.slice(1, -1));
              if (text && isReadableText(text)) {
                extractedText += text + ' ';
              }
            }
          }
        }
      }
    }
    
    return extractedText;
  } catch (error) {
    console.warn('Advanced extraction failed:', error);
    return '';
  }
}

// Basic PDF extraction as fallback
function tryBasicPDFExtraction(pdfBuffer: Uint8Array): string {
  try {
    console.log('Attempting basic PDF text extraction');
    const pdfString = new TextDecoder('latin1').decode(pdfBuffer);
    let extractedText = '';
    
    // Look for content streams
    const streamRegex = /stream\s+(.*?)\s+endstream/gs;
    const streams = pdfString.match(streamRegex);
    
    if (streams) {
      console.log(`Found ${streams.length} content streams`);
      
      for (const stream of streams) {
        const lines = stream.split(/[\r\n]+/);
        
        for (const line of lines) {
          if (line.includes('(') && line.includes(')')) {
            const textMatches = line.match(/\(((?:[^()]|\([^)]*\))*)\)/g);
            if (textMatches) {
              for (const match of textMatches) {
                const text = decodeTextString(match.slice(1, -1));
                if (text && isReadableText(text)) {
                  extractedText += text + ' ';
                }
              }
            }
          }
        }
      }
    }
    
    return extractedText;
  } catch (error) {
    console.warn('Basic extraction failed:', error);
    return '';
  }
}

// Improved text decoding
function decodeTextString(text: string): string {
  try {
    let decoded = text;
    
    // Handle common escape sequences
    decoded = decoded
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\\\/g, '\\')
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"');
    
    // Handle octal escape sequences
    decoded = decoded.replace(/\\([0-7]{1,3})/g, (match, octal) => {
      const charCode = parseInt(octal, 8);
      return (charCode >= 32 && charCode <= 126) ? String.fromCharCode(charCode) : ' ';
    });
    
    return decoded;
  } catch (error) {
    console.warn('Text decoding failed:', error);
    return text;
  }
}

// Check if text contains readable content
function isReadableText(text: string): boolean {
  if (!text || text.length < 3) return false;
  
  // Check for minimum ratio of alphabetic characters
  const alphaCount = (text.match(/[a-zA-Z]/g) || []).length;
  const alphaRatio = alphaCount / text.length;
  
  return alphaRatio > 0.5 && text.trim().length > 2;
}

// Validate if extracted text is of good quality
function isQualityText(text: string): boolean {
  if (!text || text.trim().length < 20) return false;
  
  const trimmed = text.trim();
  
  // Check for minimum word count
  const words = trimmed.split(/\s+/).filter(word => /^[a-zA-Z]+$/.test(word));
  if (words.length < 5) return false;
  
  // Check for readable character ratio
  const readableChars = (trimmed.match(/[a-zA-Z0-9\s.,!?;:()\-'"]/g) || []).length;
  const readableRatio = readableChars / trimmed.length;
  
  if (readableRatio < 0.7) return false;
  
  // Check for common English words
  const commonWords = ['the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'be', 'have', 'has', 'will', 'would'];
  const foundCommonWords = words.filter(word => 
    commonWords.includes(word.toLowerCase())
  ).length;
  
  return foundCommonWords >= 2;
}

// Clean extracted text
function cleanExtractedText(extractedText: string): string {
  console.log('Cleaning extracted text, original length:', extractedText.length);
  
  let cleanText = extractedText
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s\-.,!?():'\n]/g, ' ') // Remove non-printable chars
    .trim();
  
  // Split into sentences and clean each one
  const sentences = cleanText.split(/[.!?]+/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 5 && isReadableText(sentence))
    .map(sentence => sentence.charAt(0).toUpperCase() + sentence.slice(1));
  
  cleanText = sentences.join('. ');
  
  if (cleanText && !cleanText.endsWith('.')) {
    cleanText += '.';
  }
  
  console.log('Cleaned text length:', cleanText.length);
  return cleanText;
}

// Enhanced file validation
function validatePDFFile(file: File): { valid: boolean; error?: string; errorCode?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!file) {
    return { valid: false, error: 'No file provided', errorCode: 'NO_FILE' };
  }
  
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'File must be a PDF', errorCode: 'INVALID_TYPE' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB', errorCode: 'FILE_TOO_LARGE' };
  }
  
  if (file.size === 0) {
    return { valid: false, error: 'File appears to be empty', errorCode: 'EMPTY_FILE' };
  }

  if (file.size < 100) {
    return { valid: false, error: 'File appears to be too small', errorCode: 'FILE_TOO_SMALL' };
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
    
    // Validate file
    const validation = validatePDFFile(pdfFile);
    if (!validation.valid) {
      console.error('File validation failed:', validation.error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: validation.error,
          errorCode: validation.errorCode || 'VALIDATION_ERROR',
          canRetry: false
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log(`Processing PDF: ${pdfFile.name}, size: ${pdfFile.size} bytes`);
    
    // Convert file to buffer
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdfBuffer = new Uint8Array(arrayBuffer);
    
    // Extract text
    let extractedText: string;
    try {
      extractedText = await extractTextFromPDF(pdfBuffer);
    } catch (extractionError) {
      console.error('Text extraction failed:', extractionError);
      
      // Provide helpful error message based on common issues
      let errorMessage = 'Could not extract text from this PDF.';
      let suggestions: string[] = [];
      
      if (pdfFile.size < 5000) {
        errorMessage = 'This PDF appears to be very small and may not contain much text content.';
        suggestions = ['Try a PDF with more content', 'Manually enter the job description'];
      } else {
        errorMessage = 'This PDF may be image-based (scanned) or use an unsupported format.';
        suggestions = [
          'Try a text-based PDF with selectable text',
          'Use "Save as PDF" instead of scanning',
          'Manually copy and paste the text below'
        ];
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          errorCode: 'EXTRACTION_FAILED',
          suggestions,
          canRetry: true,
          fileName: pdfFile.name
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    if (!extractedText || extractedText.length < 10) {
      console.error('Insufficient text extracted');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'The PDF contains no readable text or very little content.',
          errorCode: 'INSUFFICIENT_TEXT',
          suggestions: [
            'This may be an image-based PDF',
            'Try a different PDF file',
            'Manually enter the job description'
          ],
          canRetry: true
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log(`Successfully extracted ${extractedText.length} characters`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        text: extractedText,
        fileName: pdfFile.name,
        extractedLength: extractedText.length,
        qualityScore: 'good'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('=== PDF processing error ===');
    console.error('Error details:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'An unexpected error occurred while processing the PDF',
        errorCode: 'PROCESSING_ERROR',
        canRetry: true
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
