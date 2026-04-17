'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface EventPageProps {
  event: {
    id: string;
    title: string;
    description: string | null;
    theme_id: string;
    poster_url: string | null;
    date_time: string | null;
    date_tbd: boolean;
    location_name: string | null;
    location_address: string | null;
    is_location_hidden: boolean;
    price: number;
    gender_mode: string;
    is_halal_venue: boolean;
    capacity: number | null;
  };
  counts: { yes: number; inshallah: number; total: number };
  hostName: string;
  hostAvatar: string | null;
}

type RsvpChoice = 'yes' | 'inshallah' | 'no' | null;

export default function EventPage({ event, counts, hostName }: EventPageProps) {
  const [rsvpChoice, setRsvpChoice] = useState<RsvpChoice>(null);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const dateStr = event.date_time
    ? new Date(event.date_time).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })
    : null;

  const timeStr = event.date_time
    ? new Date(event.date_time).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    : null;

  const genderLabel = {
    mixed: 'Open to all',
    sisters_only: 'Sisters only',
    brothers_only: 'Brothers only',
    family: 'Family event',
  }[event.gender_mode] ?? event.gender_mode;

  const handleSubmitRsvp = async () => {
    if (!rsvpChoice || !guestName.trim()) return;
    setSubmitting(true);

    await supabase.from('rsvps').insert({
      event_id: event.id,
      guest_name: guestName.trim(),
      guest_phone: guestPhone.trim() || null,
      status: rsvpChoice,
      children_count: 0,
      plus_one_names: [],
    });

    setSubmitting(false);
    setSubmitted(true);
  };

  const rsvpLabel = {
    yes: "You're in! See you there 🎉",
    inshallah: "Inshallah! We'll keep a spot for you 🤲",
    no: "We'll miss you! Maybe next time",
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      {/* ─── Dawat header bar ─── */}
      <header className="w-full border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-baseline gap-4">
            <span className="text-2xl tracking-[6px] font-light text-white">DAWAT</span>
            <span className="text-xl text-white/20 font-light">|</span>
            <span className="text-xl text-[#C9A84C]">دعوت</span>
          </div>
          <span className="text-sm text-white/30 hidden sm:block">The Muslim Events Platform</span>
        </div>
      </header>

      {/* ─── Main content — responsive card layout ─── */}
      <main className="w-full">
        {/* Desktop: centered card with max-width + shadow. Mobile: full bleed */}
        <div className="max-w-5xl mx-auto lg:my-10 lg:rounded-3xl lg:overflow-hidden lg:border lg:border-white/5 lg:shadow-2xl lg:shadow-black/40 bg-[#111111] lg:bg-[#131313]">

          {/* Poster hero */}
          {event.poster_url && (
            <div className="w-full aspect-square lg:aspect-[16/9] overflow-hidden">
              <img
                src={event.poster_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="px-6 lg:px-12 py-8 lg:py-10">
            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">{event.title}</h1>

            {/* Date + time */}
            <div className="mb-8">
              {event.date_tbd ? (
                <p className="text-xl font-semibold text-[#C9A84C]">Date TBD</p>
              ) : (
                <>
                  <p className="text-xl lg:text-2xl font-semibold">{dateStr}</p>
                  {timeStr && <p className="text-lg text-white/50">{timeStr}</p>}
                </>
              )}
            </div>

            {/* Two-column layout on desktop */}
            <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-16">
              {/* Left column — event details */}
              <div>
                {/* Host */}
                <div className="mb-6">
                  <p className="text-sm text-white/40 mb-1">Hosted by</p>
                  <p className="text-lg font-medium">{hostName}</p>
                </div>

                {/* Location */}
                {event.location_name && !event.is_location_hidden && (
                  <div className="mb-6">
                    <p className="text-lg font-semibold">📍 {event.location_name}</p>
                    {event.location_address && (
                      <p className="text-white/40 text-sm mt-1">{event.location_address}</p>
                    )}
                  </div>
                )}
                {event.is_location_hidden && (
                  <div className="mb-6">
                    <p className="text-white/40">📍 Address revealed after RSVP</p>
                  </div>
                )}

                {/* Info pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1.5 rounded-full border border-white/10 text-sm text-white/70">
                    {event.price === 0 ? 'Free' : `$${(event.price / 100).toFixed(0)}`}
                  </span>
                  <span className="px-3 py-1.5 rounded-full border border-white/10 text-sm text-white/70">
                    {genderLabel}
                  </span>
                  {event.is_halal_venue && (
                    <span className="px-3 py-1.5 rounded-full border border-white/10 text-sm text-white/70">
                      Halal ✓
                    </span>
                  )}
                  {event.capacity && (
                    <span className="px-3 py-1.5 rounded-full border border-white/10 text-sm text-white/70">
                      {Math.max(event.capacity - counts.yes, 0)}/{event.capacity} spots
                    </span>
                  )}
                </div>

                {/* Going count */}
                <p className="text-white/40 text-sm mb-6">
                  {counts.total > 0
                    ? `${counts.yes} going${counts.inshallah > 0 ? ` · ${counts.inshallah} inshallah` : ''}`
                    : 'Be the first to RSVP'}
                </p>

                {/* Description */}
                {event.description && (
                  <p className="text-white/60 text-base leading-relaxed mb-8 whitespace-pre-line">
                    {event.description}
                  </p>
                )}
              </div>

              {/* Right column — RSVP card (sticky on desktop) */}
              <div className="lg:sticky lg:top-8 lg:self-start">
                <div className="lg:bg-white/[0.03] lg:border lg:border-white/5 lg:rounded-2xl lg:p-8">
                  {submitted ? (
                    <div className="text-center py-6">
                      <p className="text-xl font-semibold text-[#C9A84C] mb-2">
                        {rsvpLabel[rsvpChoice!]}
                      </p>
                      <p className="text-white/40 text-sm">
                        Download Dawat to manage your RSVP and get reminders
                      </p>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold mb-5 text-center">Will you be attending?</h2>

                      {/* RSVP buttons */}
                      <div className="flex gap-3 mb-6 justify-center">
                        {(['yes', 'inshallah', 'no'] as RsvpChoice[]).map((choice) => (
                          <button
                            key={choice}
                            onClick={() => setRsvpChoice(choice)}
                            className={`flex-1 py-4 rounded-xl text-base font-semibold transition-all cursor-pointer text-center ${
                              rsvpChoice === choice
                                ? choice === 'yes'
                                  ? 'bg-green-600/20 text-green-400 ring-1 ring-green-500'
                                  : choice === 'inshallah'
                                    ? 'bg-amber-600/20 text-amber-400 ring-1 ring-amber-500'
                                    : 'bg-red-600/20 text-red-400 ring-1 ring-red-500'
                                : 'bg-white/5 text-white/50 hover:bg-white/10'
                            }`}
                          >
                            {choice === 'yes' ? 'Yes' : choice === 'inshallah' ? 'Inshallah' : "Can't Go"}
                          </button>
                        ))}
                      </div>

                      {/* Guest info form */}
                      {rsvpChoice && (
                        <div className="space-y-3 mb-4">
                          <input
                            type="text"
                            placeholder="Your name"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-[#C9A84C] focus:outline-none transition-colors"
                          />
                          <input
                            type="tel"
                            placeholder="Phone number (optional)"
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-[#C9A84C] focus:outline-none transition-colors"
                          />
                          <button
                            onClick={handleSubmitRsvp}
                            disabled={!guestName.trim() || submitting}
                            className="w-full py-3 rounded-xl font-bold text-[#0D0D0D] bg-gradient-to-r from-[#FFDFA1] via-[#E6C27A] to-[#FFDFA1] disabled:opacity-40 transition-opacity cursor-pointer"
                          >
                            {submitting ? 'Submitting...' : 'Confirm RSVP'}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Download CTA */}
          <div className="text-center py-8 px-6 border-t border-white/5">
            <p className="text-white/30 text-sm mb-3">
              Get the full experience — posters, themes, and community
            </p>
            <p className="text-[#C9A84C] font-semibold">
              Download Dawat on the App Store
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-sm tracking-[3px] font-light text-white/30">DAWAT</span>
          <span className="text-sm text-white/10">|</span>
          <span className="text-sm text-[#C9A84C]/40">دعوت</span>
        </div>
        <p className="text-white/20 text-xs">The Muslim Events Platform</p>
      </footer>
    </div>
  );
}
