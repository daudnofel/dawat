/**
 * ToolSheet — the shell every editor tool renders inside.
 *
 * Structure (inside a `@gorhom/bottom-sheet` BottomSheet):
 *
 *   <View flex:1>
 *     <View>Fixed header (title + Done, plus optional subheader row)</View>
 *     <BottomSheetScrollView flex:1>Body content (scrollable)</BottomSheetScrollView>
 *   </View>
 *
 * The fixed header is a sibling of the scroll view, not a sticky child of
 * it — this is more reliable than `stickyHeaderIndices` on the animated
 * ScrollView used by gorhom.
 */

import React, { ReactNode } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
} from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { COLORS, FONTS, SPACING } from '../lib/theme';

export interface ToolSheetProps {
  title: string;
  onClose: () => void;
  /**
   * Scrollable by default. Set `false` for tools that render their own
   * inner scroll (rare).
   */
  scrollable?: boolean;
  /** Optional right-side element instead of the default "Done" button. */
  rightAction?: ReactNode;
  /**
   * Optional row rendered inside the fixed header, below the title row.
   * Stays pinned while the body scrolls. Good for tab pills / filter chips.
   */
  subheader?: ReactNode;
  children: ReactNode;
}

export default function ToolSheet({
  title,
  onClose,
  scrollable = true,
  rightAction,
  subheader,
  children,
}: ToolSheetProps) {
  const insets = useSafeAreaInsets();

  const handleDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const bottomPad = insets.bottom + 100;

  const fixedHeader = (
    <View style={styles.fixedHeader}>
      <View style={styles.headerRow}>
        <View style={styles.headerSide} />
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerSide}>
          {rightAction ?? (
            <Pressable onPress={handleDone} hitSlop={12}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          )}
        </View>
      </View>
      {subheader && <View style={styles.subheader}>{subheader}</View>}
    </View>
  );

  return (
    <View style={styles.container}>
      {fixedHeader}
      {scrollable ? (
        <BottomSheetScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.bodyContent,
            { paddingBottom: bottomPad },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </BottomSheetScrollView>
      ) : (
        <View style={[styles.scroll, { paddingBottom: bottomPad }]}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.card,
  },
  fixedHeader: {
    backgroundColor: COLORS.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,223,161,0.10)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    // Minimal top padding so Done sits close to the sheet's top corner
    // (just below the grabber).
    paddingTop: 2,
    paddingBottom: SPACING.md,
  },
  subheader: {
    paddingBottom: SPACING.md,
  },
  headerSide: {
    minWidth: 56,
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    ...FONTS.bold,
    color: COLORS.white,
    letterSpacing: -0.2,
  },
  doneText: {
    fontSize: 15,
    ...FONTS.bold,
    color: COLORS.gold,
  },
  scroll: { flex: 1 },
  bodyContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
});
