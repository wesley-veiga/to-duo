import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Spacing, useTheme } from '@/constants/theme';

type Props = { overline: string; title: string; right?: ReactNode };

export function PanelHeader({ overline, title, right }: Props) {
  const colors = useTheme();
  return (
    <View style={styles.row}>
      <View style={styles.titles}>
        <Text style={[styles.overline, { color: colors.textSecondary }]}>{overline}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  titles: { flexShrink: 1 },
  overline: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -0.8 },
});
