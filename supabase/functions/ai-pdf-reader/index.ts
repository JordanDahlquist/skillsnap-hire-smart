
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Improved PDF text extraction with better quality validation
function extractTextFromPDF(pdfBuffer: Uint8Array): string {
  try {
    console.log('Starting enhanced PDF text extraction, buffer size:', pdfBuffer.length);
    
    const pdfString = new TextDecoder('latin1').decode(pdfBuffer);
    let extractedText = '';
    
    // Method 1: Enhanced BT...ET text block extraction
    console.log('Attempting Method 1: Enhanced BT...ET text blocks');
    const textObjectRegex = /BT\s+(.*?)\s+ET/gs;
    const textObjects = pdfString.match(textObjectRegex);
    
    if (textObjects && textObjects.length > 0) {
      console.log(`Found ${textObjects.length} text objects`);
      
      for (const textObj of textObjects) {
        // Extract text showing commands with better parsing
        const showTextRegex = /\(((?:[^\\()]|\\.|\\[0-7]{1,3})*)\)\s*Tj/g;
        const arrayTextRegex = /\[((?:[^\[\]]|\[[^\]]*\])*)\]\s*TJ/g;
        
        let match;
        
        // Process Tj commands
        while ((match = showTextRegex.exec(textObj)) !== null) {
          const text = decodeTextString(match[1]);
          if (text && isReadableText(text)) {
            extractedText += text + ' ';
          }
        }
        
        // Process TJ array commands
        while ((match = arrayTextRegex.exec(textObj)) !== null) {
          const arrayContent = match[1];
          const textParts = arrayContent.match(/\(((?:[^\\()]|\\.|\\[0-7]{1,3})*)\)/g);
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
    
    // Method 2: Stream content analysis with improved filtering
    if (!isQualityText(extractedText)) {
      console.log('Method 1 produced poor quality, attempting Method 2: Stream analysis');
      extractedText = '';
      
      // Look for content streams
      const streamRegex = /stream\s+(.*?)\s+endstream/gs;
      const streams = pdfString.match(streamRegex);
      
      if (streams) {
        console.log(`Found ${streams.length} content streams`);
        
        for (const stream of streams) {
          const lines = stream.split(/[\r\n]+/);
          
          for (const line of lines) {
            // Look for text content patterns
            if (line.includes('(') && line.includes(')')) {
              const textMatches = line.match(/\(((?:[^\\()]|\\.|\\[0-7]{1,3})*)\)/g);
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
    }
    
    // Method 3: Direct text pattern search as last resort
    if (!isQualityText(extractedText)) {
      console.log('Method 2 failed, attempting Method 3: Direct text patterns');
      extractedText = '';
      
      // Look for common English words and patterns
      const wordPattern = /\b[A-Za-z]{2,}\b/g;
      const potentialText = pdfString.match(wordPattern);
      
      if (potentialText && potentialText.length > 10) {
        // Filter and join words that form coherent text
        const filteredWords = potentialText.filter(word => 
          word.length > 2 && 
          !/^[A-Z]+$/.test(word) && // Skip all caps technical terms
          !/^\d+$/.test(word) // Skip pure numbers
        );
        
        if (filteredWords.length > 20) {
          extractedText = filteredWords.join(' ');
        }
      }
    }
    
    // Final quality check
    if (!isQualityText(extractedText)) {
      throw new Error('Could not extract readable text from PDF. The PDF may be image-based, encrypted, or use an unsupported format.');
    }
    
    console.log(`Successfully extracted ${extractedText.length} characters`);
    return cleanExtractedText(extractedText);
    
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw error;
  }
}

// Enhanced text decoding with better escape sequence handling
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
    
    // Handle hexadecimal escape sequences
    decoded = decoded.replace(/\\x([0-9A-Fa-f]{2})/g, (match, hex) => {
      const charCode = parseInt(hex, 16);
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
  if (!text || text.trim().length < 50) return false;
  
  const trimmed = text.trim();
  
  // Check for minimum word count
  const words = trimmed.split(/\s+/).filter(word => /^[a-zA-Z]+$/.test(word));
  if (words.length < 10) return false;
  
  // Check for readable character ratio
  const readableChars = (trimmed.match(/[a-zA-Z0-9\s.,!?;:()\-'"]/g) || []).length;
  const readableRatio = readableChars / trimmed.length;
  
  if (readableRatio < 0.8) return false;
  
  // Check for common English words
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'will', 'would', 'could', 'should'];
  const foundCommonWords = words.filter(word => 
    commonWords.includes(word.toLowerCase())
  ).length;
  
  return foundCommonWords >= 3;
}

// Enhanced text cleaning
function cleanExtractedText(extractedText: string): string {
  console.log('Cleaning extracted text, original length:', extractedText.length);
  
  let cleanText = extractedText
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s\-.,!?():'\n]/g, ' ') // Remove non-printable chars
    .trim();
  
  // Split into sentences and clean each one
  const sentences = cleanText.split(/[.!?]+/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 10 && isReadableText(sentence))
    .map(sentence => sentence.charAt(0).toUpperCase() + sentence.slice(1));
  
  cleanText = sentences.join('. ');
  
  if (cleanText && !cleanText.endsWith('.')) {
    cleanText += '.';
  }
  
  console.log('Cleaned text length:', cleanText.length);
  return cleanText;
}

// Enhanced AI text cleaning with quality focus
async function cleanTextWithAI(rawText: string, fileName: string): Promise<string> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    console.log('No OpenAI API key found, skipping AI cleanup');
    return rawText;
  }

  try {
    console.log('Attempting AI text cleanup and validation');
    
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
            content: 'You are an expert at cleaning up and validating text extracted from PDF documents. Your task is to take extracted text and make it clean, readable, and properly formatted while preserving ALL original content. If the text appears to be gibberish or corrupted, respond with "EXTRACTION_FAILED" instead of trying to fix it.'
          },
          {
            role: 'user',
            content: `Please clean up this text extracted from PDF file "${fileName}". If this text appears to be mostly gibberish, corrupted data, or unreadable characters, respond with exactly "EXTRACTION_FAILED". Otherwise, clean and format it properly:\n\n${rawText.substring(0, 2000)}`
          }
        ],
        max_tokens: 3000,
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
    
    if (cleanedText === 'EXTRACTION_FAILED') {
      throw new Error('AI detected that the extracted text is corrupted or unreadable');
    }
    
    if (cleanedText && cleanedText.length > 0 && isQualityText(cleanedText)) {
      console.log('AI cleanup successful');
      return cleanedText;
    } else {
      console.warn('AI cleanup returned poor quality result');
      return rawText;
    }

  } catch (error) {
    console.warn('AI cleanup error:', error);
    return rawText;
  }
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
    return { valid: false, error: 'File appears to be too small to contain meaningful content', errorCode: 'FILE_TOO_SMALL' };
  }
  
  return { valid: true };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Enhanced PDF processing request received ===');
    
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
          errorCode: validation.errorCode || 'VALIDATION_ERROR'
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
    
    console.log('PDF buffer created, attempting enhanced text extraction');
    
    // Extract text with enhanced quality validation
    let rawText: string;
    try {
      rawText = extractTextFromPDF(pdfBuffer);
    } catch (extractionError) {
      console.error('Text extraction failed:', extractionError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: extractionError.message || 'Could not extract readable text from PDF',
          errorCode: 'EXTRACTION_FAILED',
          suggestions: [
            'The PDF may be image-based (scanned document) - try using OCR software first',
            'The PDF may be password protected or encrypted',
            'The PDF may use an unsupported format or encoding',
            'Try manually copying and pasting the text instead',
            'Consider converting the PDF to a text-based format'
          ]
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    if (!rawText || rawText.length < 20) {
      console.error('Insufficient text extracted:', rawText?.length || 0, 'characters');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'The PDF appears to contain no readable text or only minimal content. This might be an image-based PDF or contain mostly graphics.',
          errorCode: 'INSUFFICIENT_TEXT',
          extractedLength: rawText?.length || 0
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log(`Successfully extracted ${rawText.length} characters of quality text`);
    
    // Enhanced AI text cleaning with quality validation
    const finalText = await cleanTextWithAI(rawText, pdfFile.name);
    
    // Final quality check
    if (!isQualityText(finalText)) {
      console.error('Final text quality check failed');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'The extracted text appears to be corrupted or unreadable. This PDF may not be suitable for automatic text extraction.',
          errorCode: 'POOR_QUALITY_TEXT',
          extractedSample: finalText.substring(0, 200) + '...'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log(`=== PDF processing completed successfully ===`);
    console.log(`Final text length: ${finalText.length} characters`);
    console.log(`Text quality: High`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        text: finalText,
        fileName: pdfFile.name,
        method: 'enhanced-quality-extraction',
        extractedLength: finalText.length,
        qualityScore: 'high',
        processingSteps: ['validation', 'enhanced-extraction', 'quality-check', 'ai-cleanup']
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
