
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple PDF text extraction function
function extractTextFromPDF(pdfBuffer: Uint8Array): string {
  try {
    const pdfString = new TextDecoder('latin1').decode(pdfBuffer);
    
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
    
    // Method 2: If no text found, try stream content
    if (!extractedText.trim()) {
      const streamRegex = /stream\s*(.*?)\s*endstream/gs;
      const streams = pdfString.match(streamRegex);
      
      if (streams) {
        for (const stream of streams) {
          const contentLines = stream.split('\n');
          for (const line of contentLines) {
            if (line.includes('(') && line.includes(')') && 
                !line.includes('<<') && !line.includes('>>') &&
                line.length < 200) {
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
        if (line.length > 10 && line.length < 500 && 
            /[a-zA-Z]{3,}/.test(line) && 
            !line.includes('%') && 
            !line.includes('<<') && 
            !line.includes('>>') &&
            !line.includes('obj') &&
            !line.includes('endobj')) {
          
          const cleanLine = line.replace(/[^\w\s\-.,!?():]/g, ' ').trim();
          if (cleanLine.length > 5 && /[a-zA-Z]/.test(cleanLine)) {
            extractedText += cleanLine + '\n';
          }
        }
      }
    }
    
    return extractedText.trim();
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

// Helper function to decode PDF text encoding
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
    return text;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('PDF text extraction request received');
    
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
    
    console.log(`Successfully extracted ${extractedText.length} characters from PDF`);
    
    return new Response(JSON.stringify({ 
      success: true, 
      text: extractedText,
      fileName: pdfFile.name 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error processing PDF:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Failed to process PDF' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
