
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { videoUrl, questionIndex, questionText } = await req.json()
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    console.log('Transcribing video:', videoUrl)

    // Download the video file
    const videoResponse = await fetch(videoUrl)
    if (!videoResponse.ok) {
      throw new Error(`Failed to download video: ${videoResponse.statusText}`)
    }

    const videoBlob = await videoResponse.blob()
    
    // Create form data for OpenAI Whisper API
    const formData = new FormData()
    formData.append('file', videoBlob, 'video.webm')
    formData.append('model', 'whisper-1')
    formData.append('response_format', 'json')
    formData.append('language', 'en')

    // Call OpenAI Whisper API
    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: formData,
    })

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text()
      console.error('OpenAI API error:', errorText)
      throw new Error(`Transcription failed: ${transcriptionResponse.statusText}`)
    }

    const transcriptionResult = await transcriptionResponse.json()
    
    const result = {
      questionIndex,
      questionText,
      transcript: transcriptionResult.text,
      confidence: 1.0, // Whisper doesn't provide confidence scores
      processedAt: new Date().toISOString(),
    }

    console.log('Transcription completed:', result.transcript.substring(0, 100) + '...')

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in video transcription:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
