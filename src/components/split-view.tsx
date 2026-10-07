import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Icon } from '@/components/icon';
import { smoothLayout } from '@/constants/motion';
import { Radius, Spacing, useTheme } from '@/constants/theme';

/** Distance between the two panes, centered on the hinge. */
const HINGE_GAP = Spacing.xl;

type Props = {
  pages: { key: string; node: ReactNode }[];
  swapped: boolean;
  onSwap: () => void;
};

/** Unfolded layout: both panes side by side, one per half of the screen. */
export function SplitView({ pages, swapped, onSwap }: Props) {
  const colors = useTheme();
  const ordered = swapped ? [...pages].reverse() : pages;

  return (
    <View style={styles.container}>
      {ordered.map((page) => (
        <Animated.View
          key={page.key}
          layout={smoothLayout}
          style={styles.pane}>
          {page.node}
        </Animated.View>
      ))}

      <View pointerEvents="box-none" style={styles.hinge}>
        <View style={[styles.hingeLine, { backgroundColor: colors.border }]} />
        <Pressable
          onPress={onSwap}
          accessibilityLabel="Trocar lados"
          style={({ pressed }) => [
            styles.swapButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              transform: [{ scale: pressed ? 0.92 : 1 }],
            },
          ]}>
          <Icon name="swap" size={20} color={colors.accent} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', gap: HINGE_GAP },
  pane: { flex: 1 },
  hinge: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: Spacing.xl,
  },
  hingeLine: {
    position: 'absolute',
    top: Spacing.xl,
    bottom: Spacing.xl,
    width: StyleSheet.hairlineWidth,
  },
  swapButton: {
    width: 48,
    height: 48,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
