import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';
import { RsvpStatus } from '../types';
import { supabase } from '../lib/supabase';

interface GuestRow {
  id: string;
  status: RsvpStatus;
  children_count: number;
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
      .select('id, status, children_count, created_at, user_id')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (error || !data) {
      setLoading(false);
      return;
    }

    // Fetch user display names
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
        created_at: r.created_at,
        display_name: user?.display_name ?? null,
        email: user?.email ?? null,
      };
    });

    setGuests(rows);
    setLoading(false);
  };

  if (!visible) return null;

  const filtered = activeTab === 'all' ? guests : guests.filter((g) => g.status === activeTab);

  const yesCount = guests.filter((g) => g.status === RsvpStatus.Yes).length;
  const inshallahCount = guests.filter((g) => g.status === RsvpStatus.Inshallah).length;
  const noCount = guests.filter((g) => g.status === RsvpStatus.No).length;
  const totalChildren = guests
    .filter((g) => g.status === RsvpStatus.Yes)
    .reduce((sum, g) => sum + g.children_count, 0);
  const totalHeadcount = yesCount + totalChildren;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Guest List</Text>

      {/* Summary cards */}
      <View style={styles.summaryRow}>
        <SummaryCard label="Going" count={yesCount} color={COLORS.green} />
        <SummaryCard label="Inshallah" count={inshallahCount} color={COLORS.amber} />
        <SummaryCard label="Can't Go" count={noCount} color={COLORS.red} />
      </View>

      {totalChildren > 0 && (
        <View style={styles.headcountRow}>
          <Text style={styles.headcountText}>
            Total headcount: <Text style={styles.headcountBold}>{totalHeadcount}</Text>
            {' '}({yesCount} adults + {totalChildren} {totalChildren === 1 ? 'child' : 'children'})
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
            <GuestItem key={guest.id} guest={guest} />
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

function GuestItem({ guest }: { guest: GuestRow }) {
  const statusColor = {
    [RsvpStatus.Yes]: COLORS.green,
    [RsvpStatus.Inshallah]: COLORS.amber,
    [RsvpStatus.No]: COLORS.red,
  }[guest.status];

  const statusLabel = {
    [RsvpStatus.Yes]: 'Going',
    [RsvpStatus.Inshallah]: 'Inshallah',
    [RsvpStatus.No]: "Can't Go",
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
      </View>
      <View style={[styles.statusPill, { backgroundColor: `${statusColor}20` }]}>
        <Text style={[styles.statusPillText, { color: statusColor }]}>{statusLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
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
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
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
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
    color: COLORS.muted,
    ...FONTS.semibold,
  },
  listContainer: {
    minHeight: 100,
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  statusPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  statusPillText: {
    fontSize: 11,
    ...FONTS.semibold,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.hint,
    ...FONTS.regular,
    textAlign: 'center',
    paddingVertical: SPACING.xl,
  },
});
