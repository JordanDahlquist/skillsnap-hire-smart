
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Improved PDF text extraction function using better parsing logic
function extractTextFromPDF(pdfBuffer: Uint8Array): string {
  try {
    const pdfString = new TextDecoder('latin1').decode(pdfBuffer);
    
    // Look for text objects and content streams
    let extractedText = '';
    
    // Method 1: Extract text from BT...ET blocks (text objects)
    const textObjectRegex = /BT\s*(.*?)\s*ET/gs;
    const textObjects = pdfString.match(textObjectRegex);
    
    if (textObjects) {
      for (const textObj of textObjects) {
        // Extract text from Tj and TJ operators
        const tjRegex = /\((.*?)\)\s*Tj/g;
        const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
        
        let match;
        while ((match = tjRegex.exec(textObj)) !== null) {
          const text = match[1];
          if (text && text.length > 0) {
            extractedText += decodeText(text) + ' ';
          }
        }
        
        while ((match = tjArrayRegex.exec(textObj)) !== null) {
          const arrayContent = match[1];
          const textParts = arrayContent.match(/\((.*?)\)/g);
          if (textParts) {
            for (const part of textParts) {
              const text = part.slice(1, -1); // Remove parentheses
              if (text && text.length > 0) {
                extractedText += decodeText(text) + ' ';
              }
            }
          }
        }
      }
    }
    
    // Method 2: If no text found in BT blocks, try stream content
    if (!extractedText.trim()) {
      const streamRegex = /stream\s*(.*?)\s*endstream/gs;
      const streams = pdfString.match(streamRegex);
      
      if (streams) {
        for (const stream of streams) {
          // Look for text content in streams
          const contentLines = stream.split('\n');
          for (const line of contentLines) {
            // Skip binary data and PDF commands
            if (line.includes('(') && line.includes(')') && 
                !line.includes('<<') && !line.includes('>>') &&
                line.length < 200) { // Avoid binary data
              const textMatch = line.match(/\((.*?)\)/g);
              if (textMatch) {
                for (const match of textMatch) {
                  const text = match.slice(1, -1);
                  if (text && text.length > 2) {
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
      const lines = pdfString.split('\n');
      for (const line of lines) {
        // Look for lines that contain readable text
        if (line.length > 10 && line.length < 500 && 
            /[a-zA-Z]{3,}/.test(line) && 
            !line.includes('%') && 
            !line.includes('<<') && 
            !line.includes('>>') &&
            !line.includes('obj') &&
            !line.includes('endobj')) {
          
          // Clean the line and check if it looks like readable text
          const cleanLine = line.replace(/[^\w\s\-.,!?():]/g, ' ').trim();
          if (cleanLine.length > 5 && /[a-zA-Z]/.test(cleanLine)) {
            extractedText += cleanLine + '\n';
          }
        }
      }
    }
    
    // Clean up the extracted text
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
    
    return cleanText;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

// Helper function to decode PDF text encoding
function decodeText(text: string): string {
  try {
    // Handle common PDF text encodings
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
    return text;
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
