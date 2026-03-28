// Email client using Resend — server-side only (Edge Functions)
// Not imported in the React Native app directly

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? '';

export async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Dawat <events@dawatapp.com>',
      to,
      subject,
      html,
    }),
  });
  return response.json();
}

export async function sendRsvpConfirmation(to: string, eventTitle: string, eventDate: string) {
  return sendEmail(
    to,
    `You're going to ${eventTitle}! 🌙`,
    `<h2>You're going to ${eventTitle}</h2><p>${eventDate}</p><p>JazakAllah khair for RSVPing via Dawat 🤲</p>`,
  );
}
