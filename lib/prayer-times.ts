import { Coordinates, PrayerTimes, CalculationMethod } from 'adhan';
import { format } from 'date-fns';

export interface PrayerTimeResult {
  name: string;
  time: Date;
  label: string;
}

export function getPrayerTimesForDate(
  date: Date,
  lat: number,
  lng: number,
): PrayerTimeResult[] {
  const coords = new Coordinates(lat, lng);
  const params = CalculationMethod.MuslimWorldLeague();
  const prayers = new PrayerTimes(coords, date, params);

  return [
    { name: 'fajr', time: prayers.fajr, label: `Fajr ${format(prayers.fajr, 'h:mm a')}` },
    { name: 'sunrise', time: prayers.sunrise, label: `Sunrise ${format(prayers.sunrise, 'h:mm a')}` },
    { name: 'dhuhr', time: prayers.dhuhr, label: `Dhuhr ${format(prayers.dhuhr, 'h:mm a')}` },
    { name: 'asr', time: prayers.asr, label: `Asr ${format(prayers.asr, 'h:mm a')}` },
    { name: 'maghrib', time: prayers.maghrib, label: `Maghrib ${format(prayers.maghrib, 'h:mm a')}` },
    { name: 'isha', time: prayers.isha, label: `Isha ${format(prayers.isha, 'h:mm a')}` },
  ];
}

export function checkPrayerOverlap(
  eventTime: Date,
  lat: number,
  lng: number,
): string | null {
  const prayers = getPrayerTimesForDate(eventTime, lat, lng);
  const eventMs = eventTime.getTime();

  for (const prayer of prayers) {
    const prayerMs = prayer.time.getTime();
    const diffMinutes = Math.abs(eventMs - prayerMs) / (1000 * 60);

    // Warn if event is within 15 minutes of a prayer time
    if (diffMinutes <= 15) {
      return `This overlaps ${prayer.name.charAt(0).toUpperCase() + prayer.name.slice(1)} (${format(prayer.time, 'h:mm a')}). Many guests may arrive late.`;
    }
  }

  return null;
}
