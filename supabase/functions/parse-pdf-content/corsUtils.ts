
// CORS configuration utilities
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function createCorsResponse(body: any, status = 200): Response {
  return new Response(
    JSON.stringify(body),
    { 
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

export function createCorsOptionsResponse(): Response {
  return new Response(null, { headers: corsHeaders });
}
