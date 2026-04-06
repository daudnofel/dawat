import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';
import { RsvpStatus } from '../types';
import { supabase } from '../lib/supabase';

interface GuestRow {
  id: string;
  status: RsvpStatus;
  children_count: number;
  plus_one_names: string[];
  created_at: string;
  display_name: string | null;
  email: string | null;
}

interface GuestListDashboardProps {
  eventId: string;
  visible: boolean;
  refreshKey: number;
}

type FilterTab = 'all' | RsvpStatus;

const TABS: { key: FilterTab; label: string; color: string }[] = [
  { key: 'all', label: 'All', color: COLORS.gold },
  { key: RsvpStatus.Yes, label: 'Yes', color: COLORS.green },
  { key: RsvpStatus.Inshallah, label: 'Inshallah', color: COLORS.amber },
  { key: RsvpStatus.Waitlist, label: 'Waitlist', color: COLORS.blue },
  { key: RsvpStatus.No, label: "Can't Go", color: COLORS.red },
];

export default function GuestListDashboard({ eventId, visible, refreshKey }: GuestListDashboardProps) {
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) fetchGuests();
  }, [visible, eventId, refreshKey]);

  const fetchGuests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('rsvps')
      .select('id, status, children_count, plus_one_names, created_at, user_id')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (error || !data) {
      setLoading(false);
      return;
    }

    const userIds = data.map((r) => r.user_id).filter(Boolean) as string[];
    const { data: users } = await supabase
      .from('users')
      .select('id, display_name, email')
      .in('id', userIds.length > 0 ? userIds : ['__none__']);

    const userMap = new Map(
      (users ?? []).map((u) => [u.id, { display_name: u.display_name, email: u.email }]),
    );

    const rows: GuestRow[] = data.map((r) => {
      const user = r.user_id ? userMap.get(r.user_id) : null;
      return {
        id: r.id,
        status: r.status as RsvpStatus,
        children_count: r.children_count ?? 0,
        plus_one_names: r.plus_one_names ?? [],
        created_at: r.created_at,
        display_name: user?.display_name ?? null,
        email: user?.email ?? null,
      };
    });

    setGuests(rows);
    setLoading(false);
  };

  const admitFromWaitlist = async (rsvpId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const { error } = await supabase
      .from('rsvps')
      .update({ status: 'yes', updated_at: new Date().toISOString() })
      .eq('id', rsvpId);

    if (error) {
      Alert.alert('Error', 'Could not admit guest');
      return;
    }

    fetchGuests();
  };

  if (!visible) return null;

  const filtered = activeTab === 'all' ? guests : guests.filter((g) => g.status === activeTab);

  const yesCount = guests.filter((g) => g.status === RsvpStatus.Yes).length;
  const inshallahCount = guests.filter((g) => g.status === RsvpStatus.Inshallah).length;
  const waitlistCount = guests.filter((g) => g.status === RsvpStatus.Waitlist).length;
  const noCount = guests.filter((g) => g.status === RsvpStatus.No).length;
  const totalChildren = guests
    .filter((g) => g.status === RsvpStatus.Yes)
    .reduce((sum, g) => sum + g.children_count, 0);
  const totalPlusOnes = guests
    .filter((g) => g.status === RsvpStatus.Yes)
    .reduce((sum, g) => sum + g.plus_one_names.length, 0);
  const totalHeadcount = yesCount + totalChildren + totalPlusOnes;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Guest List</Text>

      {/* Summary cards */}
      <View style={styles.summaryRow}>
        <SummaryCard label="Going" count={yesCount} color={COLORS.green} />
        <SummaryCard label="Inshallah" count={inshallahCount} color={COLORS.amber} />
        {waitlistCount > 0 && <SummaryCard label="Waitlist" count={waitlistCount} color={COLORS.blue} />}
        <SummaryCard label="Can't Go" count={noCount} color={COLORS.red} />
      </View>

      {(totalChildren > 0 || totalPlusOnes > 0) && (
        <View style={styles.headcountRow}>
          <Text style={styles.headcountText}>
            Total headcount: <Text style={styles.headcountBold}>{totalHeadcount}</Text>
            {' '}({yesCount} adults{totalPlusOnes > 0 ? ` + ${totalPlusOnes} +1s` : ''}{totalChildren > 0 ? ` + ${totalChildren} ${totalChildren === 1 ? 'child' : 'children'}` : ''})
          </Text>
        </View>
      )}

      {/* Filter tabs */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[styles.tab, isActive && { backgroundColor: `${tab.color}20`, borderColor: tab.color }]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, isActive && { color: tab.color }]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Guest list */}
      {loading ? (
        <Text style={styles.emptyText}>Loading...</Text>
      ) : filtered.length === 0 ? (
        <Text style={styles.emptyText}>No guests yet</Text>
      ) : (
        <View>
          {filtered.map((guest) => (
            <GuestItem
              key={guest.id}
              guest={guest}
              onAdmit={guest.status === RsvpStatus.Waitlist ? () => admitFromWaitlist(guest.id) : undefined}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function SummaryCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <View style={[styles.summaryCard, { borderColor: `${color}40` }]}>
      <Text style={[styles.summaryCount, { color }]}>{count}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function GuestItem({ guest, onAdmit }: { guest: GuestRow; onAdmit?: () => void }) {
  const statusColor = {
    [RsvpStatus.Yes]: COLORS.green,
    [RsvpStatus.Inshallah]: COLORS.amber,
    [RsvpStatus.No]: COLORS.red,
    [RsvpStatus.Waitlist]: COLORS.blue,
  }[guest.status];

  const statusLabel = {
    [RsvpStatus.Yes]: 'Going',
    [RsvpStatus.Inshallah]: 'Inshallah',
    [RsvpStatus.No]: "Can't Go",
    [RsvpStatus.Waitlist]: 'Waitlisted',
  }[guest.status];

  const name = guest.display_name || guest.email || 'Guest';

  return (
    <View style={styles.guestRow}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.guestInfo}>
        <Text style={styles.guestName} numberOfLines={1}>{name}</Text>
        {guest.children_count > 0 && (
          <Text style={styles.childrenText}>
            +{guest.children_count} {guest.children_count === 1 ? 'child' : 'children'}
          </Text>
        )}
        {guest.plus_one_names.length > 0 && (
          <Text style={styles.plusOneText}>
            +{guest.plus_one_names.length}: {guest.plus_one_names.join(', ')}
          </Text>
        )}
      </View>
      {onAdmit ? (
        <Pressable
          style={({ pressed }) => [styles.admitBtn, pressed && { opacity: 0.8 }]}
          onPress={onAdmit}
        >
          <Text style={styles.admitBtnText}>Admit</Text>
        </Pressable>
      ) : (
        <View style={[styles.statusPill, { backgroundColor: `${statusColor}20` }]}>
          <Text style={[styles.statusPillText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 223, 161, 0.10)',
  },
  sectionTitle: {
    fontSize: 18,
    color: COLORS.white,
    ...FONTS.bold,
    marginBottom: SPACING.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'rgba(30, 30, 30, 0.55)',
    borderRadius: RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  summaryCount: {
    fontSize: 24,
    ...FONTS.bold,
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.muted,
    ...FONTS.medium,
    marginTop: 2,
  },
  headcountRow: {
    backgroundColor: 'rgba(30, 30, 30, 0.55)',
    borderRadius: RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.10)',
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  headcountText: {
    fontSize: 13,
    color: COLORS.muted,
    ...FONTS.regular,
    textAlign: 'center',
  },
  headcountBold: {
    color: COLORS.white,
    ...FONTS.bold,
  },
  tabRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.10)',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 11,
    color: COLORS.muted,
    ...FONTS.semibold,
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 223, 161, 0.06)',
    gap: SPACING.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    color: COLORS.gold,
    ...FONTS.bold,
  },
  guestInfo: {
    flex: 1,
  },
  guestName: {
    fontSize: 14,
    color: COLORS.white,
    ...FONTS.medium,
  },
  childrenText: {
    fontSize: 12,
    color: COLORS.teal,
    ...FONTS.regular,
    marginTop: 2,
  },
  plusOneText: {
    fontSize: 12,
    color: COLORS.gold,
    ...FONTS.regular,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  statusPillText: {
    fontSize: 11,
    ...FONTS.semibold,
  },
  admitBtn: {
    backgroundColor: COLORS.green,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  admitBtnText: {
    fontSize: 12,
    color: '#FFFFFF',
    ...FONTS.bold,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.hint,
    ...FONTS.regular,
    textAlign: 'center',
    paddingVertical: SPACING.xl,
  },
});
