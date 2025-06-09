
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple PDF text extraction function
function extractTextFromPDF(pdfBuffer: Uint8Array): string {
  try {
    // Convert PDF buffer to string for text extraction
    const pdfString = new TextDecoder('latin1').decode(pdfBuffer);
    
    // Look for text content in PDF structure
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
    
    // Method 2: Fallback - look for readable text patterns in streams
    if (!extractedText.trim()) {
      const streamRegex = /stream\s*(.*?)\s*endstream/gs;
      const streams = pdfString.match(streamRegex);
      
      if (streams) {
        for (const stream of streams) {
          const contentLines = stream.split('\n');
          for (const line of contentLines) {
            // Look for text content in streams, avoiding binary data
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
    
    // Clean up the extracted text
    let cleanText = extractedText
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '')
      .replace(/\\t/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Remove excessive whitespace and normalize
    cleanText = cleanText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
    
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

async function cleanTextWithAI(rawText: string, fileName: string): Promise<string> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    // If no OpenAI key, return the raw text
    return rawText;
  }

  try {
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
            content: `Please clean up this text extracted from a PDF file (${fileName}). Fix any formatting issues, spacing problems, or encoding artifacts, but preserve all the original content exactly:\n\n${rawText}`
          }
        ],
        max_tokens: 4000,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      console.warn('AI cleanup failed, returning raw text');
      return rawText;
    }

    const data = await response.json();
    return data.choices[0].message.content.trim() || rawText;

  } catch (error) {
    console.warn('AI cleanup error, returning raw text:', error);
    return rawText;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
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
    
    // Extract text directly from PDF
    const rawText = extractTextFromPDF(pdfBuffer);
    
    if (!rawText || rawText.length < 10) {
      throw new Error('Could not extract meaningful text from PDF. Please ensure the PDF contains readable text.');
    }
    
    console.log(`Successfully extracted ${rawText.length} characters`);
    
    // Clean up the text with AI if available
    const cleanedText = await cleanTextWithAI(rawText, pdfFile.name);
    
    console.log(`Final text length after AI cleanup: ${cleanedText.length} characters`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        text: cleanedText,
        fileName: pdfFile.name,
        method: 'direct-extraction'
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
