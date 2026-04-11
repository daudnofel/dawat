// supabase/functions/event-reminders/index.ts
// DAW-46: Cron-triggered Edge Function that sends event reminders:
//   - 24h reminder → all "yes" RSVPs
//   - 2h reminder  → all "yes" RSVPs
//   - Inshallah nudge → all "inshallah" RSVPs, 24h before
//
// Idempotent: tracks sent reminders in event_reminders_sent table.
// Designed to run every 15 minutes via pg_cron or Supabase cron.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, serviceKey);

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

// ─── Types ──────────────────────────────────────────────────

interface ReminderJob {
  type: "24h" | "2h" | "inshallah_nudge";
  rsvpStatus: string[];
  windowStart: Date;
  windowEnd: Date;
  title: (eventTitle: string) => string;
  body: (eventTitle: string, dateStr: string) => string;
}

// ─── Push helper ────────────────────────────────────────────

async function sendPush(
  token: string,
  title: string,
  body: string,
  data: Record<string, string>,
) {
  try {
    await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: token, title, body, data, sound: "default" }),
    });
  } catch {
    // Fire-and-forget — individual push failures don't block the batch
  }
}

// ─── Main handler ───────────────────────────────────────────

Deno.serve(async (req) => {
  // Optional: verify cron secret header to prevent unauthorized invocations
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const now = new Date();

  // Define the 3 reminder jobs with their time windows.
  // Each window is 15 minutes wide (matching the cron interval)
  // so we catch events exactly once as they enter the window.
  const jobs: ReminderJob[] = [
    {
      type: "24h",
      rsvpStatus: ["yes"],
      windowStart: new Date(now.getTime() + 23.75 * 60 * 60 * 1000), // 23h45m from now
      windowEnd: new Date(now.getTime() + 24.25 * 60 * 60 * 1000),   // 24h15m from now
      title: (t) => `Tomorrow: ${t}`,
      body: (t, d) => `${t} is tomorrow at ${d}. See you there!`,
    },
    {
      type: "2h",
      rsvpStatus: ["yes"],
      windowStart: new Date(now.getTime() + 1.75 * 60 * 60 * 1000),  // 1h45m
      windowEnd: new Date(now.getTime() + 2.25 * 60 * 60 * 1000),    // 2h15m
      title: (t) => `Starting soon: ${t}`,
      body: (t, d) => `${t} starts at ${d}. Don't forget!`,
    },
    {
      type: "inshallah_nudge",
      rsvpStatus: ["inshallah"],
      windowStart: new Date(now.getTime() + 23.75 * 60 * 60 * 1000),
      windowEnd: new Date(now.getTime() + 24.25 * 60 * 60 * 1000),
      title: (t) => `Are you coming? ${t}`,
      body: (t, d) =>
        `${t} is tomorrow at ${d}. You said Inshallah — will you make it?`,
    },
  ];

  let totalSent = 0;

  for (const job of jobs) {
    // Find events in this reminder's time window
    const { data: events, error: evErr } = await supabase
      .from("events")
      .select("id, title, date_time")
      .eq("is_published", true)
      .eq("is_cancelled", false)
      .not("date_time", "is", null)
      .gte("date_time", job.windowStart.toISOString())
      .lt("date_time", job.windowEnd.toISOString());

    if (evErr || !events || events.length === 0) continue;

    for (const event of events) {
      // Find matching RSVPs
      const { data: rsvps } = await supabase
        .from("rsvps")
        .select("user_id")
        .eq("event_id", event.id)
        .in("status", job.rsvpStatus);

      if (!rsvps || rsvps.length === 0) continue;

      const userIds = rsvps
        .map((r: { user_id: string | null }) => r.user_id)
        .filter(Boolean) as string[];

      if (userIds.length === 0) continue;

      // Check which reminders have already been sent
      const { data: alreadySent } = await supabase
        .from("event_reminders_sent")
        .select("user_id")
        .eq("event_id", event.id)
        .eq("reminder_type", job.type)
        .in("user_id", userIds);

      const sentSet = new Set(
        (alreadySent ?? []).map((r: { user_id: string }) => r.user_id),
      );
      const pendingUserIds = userIds.filter((id) => !sentSet.has(id));

      if (pendingUserIds.length === 0) continue;

      // Get push tokens for pending users
      const { data: users } = await supabase
        .from("users")
        .select("id, push_token")
        .in("id", pendingUserIds)
        .not("push_token", "is", null);

      if (!users || users.length === 0) continue;

      const dateStr = new Date(event.date_time).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });

      // Send pushes + record as sent
      for (const user of users) {
        await sendPush(
          user.push_token,
          job.title(event.title),
          job.body(event.title, dateStr),
          { type: "event_reminder", event_id: event.id },
        );

        // Record sent (upsert to handle races)
        await supabase.from("event_reminders_sent").upsert(
          {
            event_id: event.id,
            user_id: user.id,
            reminder_type: job.type,
          },
          { onConflict: "event_id,user_id,reminder_type" },
        );

        totalSent++;
      }
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      sent: totalSent,
      timestamp: now.toISOString(),
    }),
    { headers: { "Content-Type": "application/json" } },
  );
});
