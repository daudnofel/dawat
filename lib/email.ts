// lib/email.ts
// Client-side trigger for email notifications.
// Calls the Supabase Edge Function 'send-email' — the Resend API key
// never touches the mobile app. All sending happens server-side.

import { supabase } from './supabase';

// ─── Payload types ────────────────────────────────────────────
// These must stay in sync with supabase/functions/send-email/index.ts

export interface RsvpConfirmationPayload {
  to: string;
  guestName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventUrl: string;
  status: 'yes' | 'inshallah' | 'no';
}

export interface HostNewRsvpPayload {
  to: string;
  hostName: string;
  guestName: string;
  eventTitle: string;
  status: 'yes' | 'inshallah' | 'no';
  totalYes: number;
  totalInshallah: number;
  eventUrl: string;
}

export interface EventPublishedPayload {
  to: string;
  hostName: string;
  eventTitle: string;
  eventDate: string;
  eventUrl: string;
}

export interface EventCancelledPayload {
  to: string;
  guestName: string;
  eventTitle: string;
  eventDate: string;
  hostName: string;
}

export interface EventReminderPayload {
  to: string;
  guestName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventUrl: string;
  hoursUntil: 24 | 2;
}

export type EmailParams =
  | { type: 'rsvp_confirmation'; payload: RsvpConfirmationPayload }
  | { type: 'host_new_rsvp'; payload: HostNewRsvpPayload }
  | { type: 'event_published'; payload: EventPublishedPayload }
  | { type: 'event_cancelled'; payload: EventCancelledPayload }
  | { type: 'event_reminder'; payload: EventReminderPayload };

// ─── Public API ───────────────────────────────────────────────
// Fire-and-forget safe: silently logs on failure, never throws.
// Call without await from the mobile app when you want non-blocking send.

export async function triggerEmail(params: EmailParams): Promise<void> {
  const { error } = await supabase.functions.invoke('send-email', {
    body: params,
  });
  if (error) {
    // Fire-and-forget: log a warning but don't trigger the dev red screen.
    // Email failures are non-blocking and happen regularly while we're on
    // Resend's sandbox sender (which can only deliver to the account owner).
    console.warn('[email] Failed to send:', params.type, error.message);
  }
}
