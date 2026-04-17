import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EventPage from './EventPage';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type Props = {
  params: Promise<{ slug: string }>;
};

async function getEvent(slug: string) {
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();
  return data;
}

async function getRsvpCounts(eventId: string) {
  const { data } = await supabase
    .from('rsvps')
    .select('status')
    .eq('event_id', eventId);

  const rsvps = data ?? [];
  return {
    yes: rsvps.filter((r) => r.status === 'yes').length,
    inshallah: rsvps.filter((r) => r.status === 'inshallah').length,
    total: rsvps.filter((r) => r.status === 'yes' || r.status === 'inshallah').length,
  };
}

async function getHost(hostId: string) {
  const { data } = await supabase
    .from('users')
    .select('display_name, avatar_url')
    .eq('id', hostId)
    .single();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    return { title: 'Event not found — Dawat' };
  }

  const dateStr = event.date_time
    ? new Date(event.date_time).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : 'Date TBD';

  const description = event.description
    ? event.description.slice(0, 160)
    : `${dateStr}${event.location_name ? ` · ${event.location_name}` : ''}`;

  return {
    title: `${event.title} — Dawat`,
    description,
    openGraph: {
      title: event.title,
      description,
      type: 'website',
      ...(event.poster_url ? { images: [{ url: event.poster_url, width: 1280, height: 1280 }] } : {}),
    },
    twitter: {
      card: event.poster_url ? 'summary_large_image' : 'summary',
      title: event.title,
      description,
      ...(event.poster_url ? { images: [event.poster_url] } : {}),
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) notFound();

  const [counts, host] = await Promise.all([
    getRsvpCounts(event.id),
    getHost(event.host_id),
  ]);

  return (
    <EventPage
      event={event}
      counts={counts}
      hostName={host?.display_name ?? 'Someone'}
      hostAvatar={host?.avatar_url ?? null}
    />
  );
}
