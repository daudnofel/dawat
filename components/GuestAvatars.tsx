import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';
import { supabase } from '../lib/supabase';

interface GuestAvatarsProps {
  eventId: string;
  refreshKey: number;
}

interface GuestInfo {
  id: string;
  display_name: string | null;
}

const MAX_AVATARS = 5;

export default function GuestAvatars({ eventId, refreshKey }: GuestAvatarsProps) {
  const [guests, setGuests] = useState<GuestInfo[]>([]);
  const [totalGoing, setTotalGoing] = useState(0);

  useEffect(() => {
    fetchGuests();
  }, [eventId, refreshKey]);

  const fetchGuests = async () => {
    // Get all "yes" RSVPs
    const { data: rsvps, count } = await supabase
      .from('rsvps')
      .select('user_id', { count: 'exact' })
      .eq('event_id', eventId)
      .eq('status', 'yes');

    setTotalGoing(count ?? 0);

    if (!rsvps || rsvps.length === 0) {
      setGuests([]);
      return;
    }

    const userIds = rsvps.map((r) => r.user_id).filter(Boolean) as string[];
    if (userIds.length === 0) {
      setGuests([]);
      return;
    }

    const { data: users } = await supabase
      .from('users')
      .select('id, display_name')
      .in('id', userIds)
      .limit(MAX_AVATARS);

    setGuests((users ?? []) as GuestInfo[]);
  };

  if (totalGoing === 0) return null;

  const extraCount = totalGoing - guests.length;

  return (
    <View style={styles.container}>
      <View style={styles.avatarRow}>
        {guests.map((guest, i) => {
          const initial = (guest.display_name ?? '?').charAt(0).toUpperCase();
          return (
            <View key={guest.id} style={[styles.avatar, i > 0 && { marginLeft: -8 }]}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          );
        })}
        {extraCount > 0 && (
          <View style={[styles.avatar, styles.extraAvatar, { marginLeft: -8 }]}>
            <Text style={styles.extraText}>+{extraCount}</Text>
          </View>
        )}
      </View>
      <Text style={styles.label}>
        {totalGoing} {totalGoing === 1 ? 'person' : 'people'} going
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card2,
    borderWidth: 2,
    borderColor: COLORS.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    color: COLORS.gold,
    ...FONTS.bold,
  },
  extraAvatar: {
    backgroundColor: COLORS.border,
  },
  extraText: {
    fontSize: 10,
    color: COLORS.muted,
    ...FONTS.bold,
  },
  label: {
    fontSize: 13,
    color: COLORS.muted,
    ...FONTS.medium,
  },
});
