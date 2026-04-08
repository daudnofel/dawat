// supabase/functions/send-push/index.ts
// Deno Edge Function — sends a push notification via the Expo Push API.
// Looks up the recipient's push_token from the users table (service role bypasses RLS).
//
// Called from the mobile app via: supabase.functions.invoke('send-push', { body: {...} })

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushRequest {
  user_id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      console.error('[send-push] Missing Supabase env vars');
      return new Response(JSON.stringify({ error: 'Server not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = (await req.json()) as PushRequest;

    if (!payload.user_id || !payload.title || !payload.body) {
      return new Response(JSON.stringify({ error: 'Missing user_id / title / body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Look up the recipient's push token via service role (bypasses RLS)
    const userRes = await fetch(
      `${SUPABASE_URL}/rest/v1/users?id=eq.${payload.user_id}&select=push_token,push_platform`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      },
    );

    if (!userRes.ok) {
      console.error('[send-push] Failed to look up user:', userRes.status);
      return new Response(JSON.stringify({ error: 'User lookup failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const users = (await userRes.json()) as Array<{ push_token: string | null; push_platform: string | null }>;
    const user = users[0];

    if (!user || !user.push_token) {
      // Not an error — user just hasn't registered for push (or denied permission)
      console.log('[send-push] No push token for user', payload.user_id);
      return new Response(JSON.stringify({ ok: true, skipped: 'no_token' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send via Expo Push API
    const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: user.push_token,
        sound: 'default',
        title: payload.title,
        body: payload.body,
        data: payload.data ?? {},
        priority: 'high',
      }),
    });

    const expoResult = await expoRes.json();

    if (!expoRes.ok) {
      console.error('[send-push] Expo API error:', expoResult);
      return new Response(JSON.stringify({ error: 'Push API error', detail: expoResult }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true, expo: expoResult }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[send-push] Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
