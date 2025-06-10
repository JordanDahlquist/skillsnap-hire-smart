
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { plan_type, user_id } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user profile for customer creation
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single();

    // Create Paddle checkout session
    const paddleResponse = await fetch('https://sandbox-api.paddle.com/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PADDLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{
          price_id: getPaddlePriceId(plan_type),
          quantity: 1,
        }],
        customer_email: profile?.email,
        custom_data: {
          user_id: user_id,
          plan_type: plan_type,
        },
        return_url: `${Deno.env.get('SITE_URL')}/subscription/success`,
        discount_url: `${Deno.env.get('SITE_URL')}/subscription/canceled`,
      }),
    });

    if (!paddleResponse.ok) {
      throw new Error(`Paddle API error: ${paddleResponse.statusText}`);
    }

    const checkoutData = await paddleResponse.json();

    return new Response(
      JSON.stringify({ checkout_url: checkoutData.data.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error creating checkout:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

function getPaddlePriceId(planType: string): string {
  switch (planType) {
    case 'starter':
      return Deno.env.get('PADDLE_STARTER_PRICE_ID') ?? '';
    case 'professional':
      return Deno.env.get('PADDLE_PROFESSIONAL_PRICE_ID') ?? '';
    case 'enterprise':
      return Deno.env.get('PADDLE_ENTERPRISE_PRICE_ID') ?? '';
    default:
      throw new Error('Invalid plan type');
  }
}
