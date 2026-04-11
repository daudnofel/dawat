// lib/islamicMoments.ts
// DAW-33 — Muslim cultural / religious moment metadata.
//
// Pure data module. No UI, no network, no side effects. Consumers import
// `getMomentForDate(date)` to decide whether a given day is culturally
// significant and, if so, which warm copy to show in the agenda panel
// (MomentBanner, DAW-36).
//
// V1.5 uses a hardcoded 2026 Hijri→Gregorian map plus a weekly Jumu'ah
// fallback. V2 will replace this with a Supabase-backed `cultural_moments`
// table editable by admins, so `getMomentForDate` is the seam every
// consumer should depend on — never the raw maps.
//
// Rationale for hardcoding:
//   • Real Hijri calculation needs a library (hijri-converter / moment-hijri)
//     and astronomical moonsighting decisions that vary by region.
//   • For V1.5 we ship tasteful copy for the next ~12 months of moments
//     with no extra deps. Each year the map gets a refresh until V2 ships.

export type MomentTone = 'blessed' | 'celebration' | 'reflection';

export interface IslamicMoment {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  tone: MomentTone;
}

// ─── Weekly moments ───────────────────────────────────────────────────
// Keyed by JS Date.getDay() — 0=Sun, 5=Fri.
const WEEKLY_MOMENTS: Record<number, IslamicMoment | null> = {
  0: null,
  1: null,
  2: null,
  3: null,
  4: null,
  5: {
    id: 'jumuah',
    emoji: '🕌',
    title: "Jumu'ah Mubarak",
    subtitle:
      'May your Friday be filled with barakah, peace, and a full masjid.',
    tone: 'blessed',
  },
  6: null,
};

// ─── Specific-date moments (2026) ─────────────────────────────────────
// YYYY-MM-DD → moment. Dates sourced from the 2026 Hijri calendar for
// Madinah-aligned moonsighting. Adjust once a year until V2 ships.
//
// Note on precedence: getMomentForDate checks this map first, then falls
// back to WEEKLY_MOMENTS. So if Eid al-Fitr happens to land on a Friday,
// the Eid moment wins.
const SPECIFIC_MOMENTS: Record<string, IslamicMoment> = {
  // Ramadan 1447 AH began mid-February 2026 (approx. Feb 17).
  '2026-02-17': {
    id: 'ramadan-start',
    emoji: '🌙',
    title: 'Ramadan Kareem',
    subtitle:
      'The first day of Ramadan. May this month bring you closeness, patience, and light.',
    tone: 'reflection',
  },
  // Laylatul Qadr — odd nights of the last 10, most commonly the 27th.
  '2026-03-14': {
    id: 'laylatul-qadr',
    emoji: '✨',
    title: 'Laylatul Qadr',
    subtitle:
      'The Night of Power — better than a thousand months. Every duʿaʾ is heard tonight.',
    tone: 'reflection',
  },
  // Eid al-Fitr 1447 AH — approx. March 20, 2026.
  '2026-03-20': {
    id: 'eid-al-fitr',
    emoji: '🌟',
    title: 'Eid Mubarak',
    subtitle:
      'Eid al-Fitr — may your celebration be full of family, sweetness, and gratitude.',
    tone: 'celebration',
  },
  // Day of Arafah — approx. May 26, 2026.
  '2026-05-26': {
    id: 'arafah',
    emoji: '⛰️',
    title: 'Day of Arafah',
    subtitle:
      'The greatest day of the year. Fast, make duʿaʾ, and remember those standing on the plain.',
    tone: 'reflection',
  },
  // Eid al-Adha 1447 AH — approx. May 27, 2026.
  '2026-05-27': {
    id: 'eid-al-adha',
    emoji: '🕋',
    title: 'Eid al-Adha Mubarak',
    subtitle:
      'Eid al-Adha — honoring the sacrifice of Ibrahim (AS). May your qurbani be accepted.',
    tone: 'celebration',
  },
  // Islamic New Year — 1 Muharram 1448 AH, approx. June 17, 2026.
  '2026-06-17': {
    id: 'muharram-1',
    emoji: '🌙',
    title: 'Happy Islamic New Year',
    subtitle: 'Muharram 1 — a new Hijri year, a fresh page. May it be blessed.',
    tone: 'reflection',
  },
  // Day of Ashura — 10 Muharram, approx. June 26, 2026.
  '2026-06-26': {
    id: 'ashura',
    emoji: '🤲',
    title: 'Day of Ashura',
    subtitle:
      'A day of remembrance and fasting. The day Musa (AS) and his people were saved.',
    tone: 'reflection',
  },
  // Mawlid an-Nabi — 12 Rabi al-Awwal, approx. August 26, 2026.
  '2026-08-26': {
    id: 'mawlid',
    emoji: '💚',
    title: 'Mawlid an-Nabi',
    subtitle:
      'Remembering the mercy sent to the worlds ﷺ. Send salawat upon him today and every day.',
    tone: 'blessed',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────
function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

/**
 * Returns the Islamic moment for a given date, or null if the day has
 * none. Specific-date moments take precedence over weekly (Jumu'ah).
 *
 * This is the ONLY public entry point — consumers never touch the raw
 * maps so we can swap the data source in V2 without breaking callers.
 */
export function getMomentForDate(d: Date): IslamicMoment | null {
  const specific = SPECIFIC_MOMENTS[dateKey(d)];
  if (specific) return specific;
  return WEEKLY_MOMENTS[d.getDay()] ?? null;
}
