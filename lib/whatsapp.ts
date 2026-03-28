const THREESIXTY_BASE = 'https://waba.360dialog.io/v1';

export async function sendWhatsApp(to: string, message: string) {
  const response = await fetch(`${THREESIXTY_BASE}/messages`, {
    method: 'POST',
    headers: {
      'D360-API-KEY': process.env.THREESIXTY_DIALOG_API_KEY ?? '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to.replace(/\D/g, ''),
      type: 'text',
      text: { body: message },
    }),
  });
  return response.json();
}
