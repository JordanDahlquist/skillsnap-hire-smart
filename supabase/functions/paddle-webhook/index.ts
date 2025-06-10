
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
    const webhookData = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Paddle webhook received:', webhookData.event_type);

    switch (webhookData.event_type) {
      case 'subscription.created':
        await handleSubscriptionCreated(supabaseClient, webhookData.data);
        break;
      case 'subscription.updated':
        await handleSubscriptionUpdated(supabaseClient, webhookData.data);
        break;
      case 'subscription.canceled':
        await handleSubscriptionCanceled(supabaseClient, webhookData.data);
        break;
      case 'transaction.completed':
        await handleTransactionCompleted(supabaseClient, webhookData.data);
        break;
    }

    return new Response('OK', { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

async function handleSubscriptionCreated(supabase: any, data: any) {
  const userId = data.custom_data?.user_id;
  const planType = data.custom_data?.plan_type;

  if (!userId) return;

  await supabase
    .from('subscriptions')
    .update({
      paddle_subscription_id: data.id,
      paddle_customer_id: data.customer_id,
      status: 'active',
      plan_type: planType,
      subscription_start_date: new Date(data.created_at),
      current_period_start: new Date(data.current_billing_period.starts_at),
      current_period_end: new Date(data.current_billing_period.ends_at),
      updated_at: new Date(),
    })
    .eq('user_id', userId);
}

async function handleSubscriptionUpdated(supabase: any, data: any) {
  await supabase
    .from('subscriptions')
    .update({
      status: data.status,
      current_period_start: new Date(data.current_billing_period.starts_at),
      current_period_end: new Date(data.current_billing_period.ends_at),
      updated_at: new Date(),
    })
    .eq('paddle_subscription_id', data.id);
}

async function handleSubscriptionCanceled(supabase: any, data: any) {
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      subscription_end_date: new Date(data.canceled_at),
      updated_at: new Date(),
    })
    .eq('paddle_subscription_id', data.id);
}

async function handleTransactionCompleted(supabase: any, data: any) {
  // Handle successful payment - could be used for analytics or notifications
  console.log('Payment completed for subscription:', data.subscription_id);
}
