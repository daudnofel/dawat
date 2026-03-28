import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';

interface OrgCardProps {
  id: string;
  name: string;
  handle: string;
  is_verified: boolean;
  follower_count: number;
  event_count: number;
}

export default function OrgCard(props: OrgCardProps) {
  const router = useRouter();
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
      onPress={() => router.push(`/org/${props.id}`)}
    >
      <View style={styles.logo}>
        <Text style={styles.logoText}>{props.name.charAt(0)}</Text>
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{props.name}</Text>
          {props.is_verified && <Text style={styles.verified}>✓</Text>}
        </View>
        <Text style={styles.handle}>@{props.handle}</Text>
        <Text style={styles.stats}>{props.follower_count} followers · {props.event_count} events</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg, borderWidth: 1,
    borderColor: COLORS.border, padding: SPACING.md, marginBottom: SPACING.sm,
  },
  logo: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.gold,
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: { color: COLORS.dark, fontSize: 20, ...FONTS.bold },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  name: { fontSize: 15, color: COLORS.white, ...FONTS.bold },
  verified: { color: COLORS.gold, fontSize: 14, ...FONTS.bold },
  handle: { fontSize: 12, color: COLORS.muted, ...FONTS.regular, marginTop: 1 },
  stats: { fontSize: 11, color: COLORS.hint, ...FONTS.regular, marginTop: 4 },
});
