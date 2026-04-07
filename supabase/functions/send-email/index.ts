// supabase/functions/send-email/index.ts
// Deno Edge Function — runs on Supabase servers, never in the mobile app.
// Called via supabase.functions.invoke('send-email', { body: payload })
// Requires: RESEND_API_KEY secret set in Supabase dashboard.

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
// Using Resend's sandbox sender until dawat.app domain is verified
const FROM = 'Dawat <onboarding@resend.dev>';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Payload types ────────────────────────────────────────────

interface RsvpConfirmationPayload {
  to: string;
  guestName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventUrl: string;
  status: 'yes' | 'inshallah' | 'no';
}

interface HostNewRsvpPayload {
  to: string;
  hostName: string;
  guestName: string;
  eventTitle: string;
  status: 'yes' | 'inshallah' | 'no';
  totalYes: number;
  totalInshallah: number;
  eventUrl: string;
}

interface EventPublishedPayload {
  to: string;
  hostName: string;
  eventTitle: string;
  eventDate: string;
  eventUrl: string;
}

interface EventCancelledPayload {
  to: string;
  guestName: string;
  eventTitle: string;
  eventDate: string;
  hostName: string;
}

interface EventReminderPayload {
  to: string;
  guestName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventUrl: string;
  hoursUntil: 24 | 2;
}

type EmailRequest =
  | { type: 'rsvp_confirmation'; payload: RsvpConfirmationPayload }
  | { type: 'host_new_rsvp'; payload: HostNewRsvpPayload }
  | { type: 'event_published'; payload: EventPublishedPayload }
  | { type: 'event_cancelled'; payload: EventCancelledPayload }
  | { type: 'event_reminder'; payload: EventReminderPayload };

// ─── HTML shell ───────────────────────────────────────────────

function html(body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0D0D0D;font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0D0D;padding:40px 20px">
    <tr><td>
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto">
        <tr>
          <td style="padding-bottom:28px">
            <span style="color:#C9A84C;font-size:22px;font-weight:bold;letter-spacing:-0.5px">Dawat 🌙</span>
          </td>
        </tr>
        <tr>
          <td style="background:#161616;border-radius:16px;border:1px solid #2A2A2A;padding:32px">
            ${body}
          </td>
        </tr>
        <tr>
          <td style="padding-top:24px;color:#555;font-size:12px;text-align:center">
            Dawat — Muslim community events
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(url: string, label: string): string {
  return `<a href="${url}" style="display:inline-block;background:#C9A84C;color:#0D0D0D;font-weight:bold;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none;margin-top:24px">${label}</a>`;
}

function h1(text: string): string {
  return `<h1 style="color:#ffffff;font-size:22px;font-weight:bold;margin:0 0 16px 0;line-height:1.3">${text}</h1>`;
}

function p(text: string): string {
  return `<p style="color:#888888;font-size:15px;line-height:1.6;margin:0 0 12px 0">${text}</p>`;
}

function detail(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;border-bottom:1px solid #2A2A2A">
      <span style="color:#555;font-size:13px">${label}</span>
    </td>
    <td style="padding:8px 0;border-bottom:1px solid #2A2A2A;text-align:right">
      <span style="color:#ffffff;font-size:13px;font-weight:bold">${value}</span>
    </td>
  </tr>`;
}

// ─── Templates ────────────────────────────────────────────────

function buildEmail(req: EmailRequest): { subject: string; html: string } {
  switch (req.type) {
    case 'rsvp_confirmation': {
      const { guestName, eventTitle, eventDate, eventLocation, eventUrl, status } = req.payload;
      const statusLine =
        status === 'yes' ? "You're going 🎉" :
        status === 'inshallah' ? "You're tentatively going (Inshallah) 🤲" :
        "You've declined";
      return {
        subject: status === 'yes'
          ? `You're going to ${eventTitle}! 🌙`
          : `Your RSVP for ${eventTitle}`,
        html: html(`
          ${h1(`RSVP confirmed: ${eventTitle}`)}
          ${p(`As-salamu alaykum ${guestName}, your RSVP has been received.`)}
          ${p(`<strong style="color:#C9A84C">${statusLine}</strong>`)}
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0">
            ${detail('Event', eventTitle)}
            ${detail('Date', eventDate)}
            ${detail('Location', eventLocation)}
          </table>
          ${btn(eventUrl, 'View Event →')}
        `),
      };
    }

    case 'host_new_rsvp': {
      const { hostName, guestName, eventTitle, status, totalYes, totalInshallah, eventUrl } = req.payload;
      const statusLabel =
        status === 'yes' ? 'Going ✓' :
        status === 'inshallah' ? 'Inshallah (Tentative)' :
        'Not going';
      return {
        subject: `${guestName} RSVPd to ${eventTitle}`,
        html: html(`
          ${h1(`New RSVP for ${eventTitle}`)}
          ${p(`As-salamu alaykum ${hostName},`)}
          ${p(`<strong style="color:#ffffff">${guestName}</strong> just RSVPd: <strong style="color:#C9A84C">${statusLabel}</strong>`)}
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0">
            ${detail('Going', `${totalYes}`)}
            ${detail('Inshallah', `${totalInshallah}`)}
          </table>
          ${btn(eventUrl, 'View Guest List →')}
        `),
      };
    }

    case 'event_published': {
      const { hostName, eventTitle, eventDate, eventUrl } = req.payload;
      return {
        subject: `Your event is live: ${eventTitle} 🌙`,
        html: html(`
          ${h1(`Your event is live!`)}
          ${p(`Masha'Allah ${hostName}, <strong style="color:#ffffff">${eventTitle}</strong> has been published.`)}
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0">
            ${detail('Event', eventTitle)}
            ${detail('Date', eventDate)}
          </table>
          ${p('Share the link with your guests and start collecting RSVPs.')}
          ${btn(eventUrl, 'View & Share Event →')}
        `),
      };
    }

    case 'event_cancelled': {
      const { guestName, eventTitle, eventDate, hostName } = req.payload;
      return {
        subject: `Event cancelled: ${eventTitle}`,
        html: html(`
          ${h1(`${eventTitle} has been cancelled`)}
          ${p(`As-salamu alaykum ${guestName},`)}
          ${p(`We're sorry to let you know that <strong style="color:#ffffff">${eventTitle}</strong> scheduled for <strong style="color:#ffffff">${eventDate}</strong> has been cancelled by the host.`)}
          ${p(`JazakAllah khair for your understanding. — ${hostName}`)}
        `),
      };
    }

    case 'event_reminder': {
      const { guestName, eventTitle, eventDate, eventLocation, eventUrl, hoursUntil } = req.payload;
      const timeLabel = hoursUntil === 24 ? 'tomorrow' : 'in 2 hours';
      return {
        subject: `Reminder: ${eventTitle} is ${timeLabel} 🌙`,
        html: html(`
          ${h1(`${eventTitle} is ${timeLabel}`)}
          ${p(`As-salamu alaykum ${guestName}, just a friendly reminder:`)}
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0">
            ${detail('Event', eventTitle)}
            ${detail('Date', eventDate)}
            ${detail('Location', eventLocation)}
          </table>
          ${btn(eventUrl, 'View Event →')}
        `),
      };
    }
  }
}

// ─── Handler ──────────────────────────────────────────────────

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error('[send-email] RESEND_API_KEY is not set');
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json() as EmailRequest;

    if (!body.type || !body.payload?.to) {
      return new Response(JSON.stringify({ error: 'Missing type or payload.to' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { subject, html: htmlBody } = buildEmail(body);

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: body.payload.to,
        subject,
        html: htmlBody,
      }),
    });

    const result = await resendRes.json();

    if (!resendRes.ok) {
      console.error('[send-email] Resend error:', result);
      return new Response(JSON.stringify({ error: 'Failed to send email', detail: result }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true, id: result.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[send-email] Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
