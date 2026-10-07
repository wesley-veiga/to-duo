import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/icon';
import { PanelHeader } from '@/components/panel-header';
import { Motion } from '@/constants/motion';
import { Radius, Spacing, useTheme } from '@/constants/theme';
import { computeStats } from '@/store/stats';
import { useTodos } from '@/store/todos';

export function StatsPanel() {
  const colors = useTheme();
  const { state } = useTodos();
  const stats = computeStats(state.todos);
  const maxDay = Math.max(1, ...stats.lastWeek.map((d) => d.count));

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <PanelHeader overline="Visão geral" title="Estatísticas" />

      <View style={[styles.card, { backgroundColor: colors.accent }]}>
        <Text style={styles.heroValue}>{Math.round(stats.rate * 100)}%</Text>
        <Text style={styles.heroLabel}>das tarefas concluídas</Text>
        <View style={styles.heroTrack}>
          <Fill ratio={stats.rate} axis="width" style={styles.heroFill} />
        </View>
      </View>

      <View style={styles.grid}>
        <StatTile icon="check" label="Concluídas" value={stats.done} tint={colors.success} />
        <StatTile icon="clock" label="Pendentes" value={stats.pending} tint={colors.accent} />
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Últimos 7 dias</Text>
        <View style={styles.chart}>
          {stats.lastWeek.map((day) => (
            <View key={day.key} style={styles.barColumn}>
              <Text style={[styles.barValue, { color: colors.textSecondary }]}>
                {day.count > 0 ? day.count : ''}
              </Text>
              <View style={[styles.barTrack, { backgroundColor: colors.surfaceMuted }]}>
                <Fill
                  ratio={day.count / maxDay}
                  axis="height"
                  style={[
                    styles.barFill,
                    { backgroundColor: day.isToday ? colors.accent : colors.accentMuted },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.barLabel,
                  { color: day.isToday ? colors.text : colors.textSecondary },
                  day.isToday && styles.barLabelToday,
                ]}>
                {day.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function StatTile({
  icon,
  label,
  value,
  tint,
}: {
  icon: IconName;
  label: string;
  value: number;
  tint: string;
}) {
  const colors = useTheme();
  return (
    <View style={[styles.tile, { backgroundColor: colors.surface }]}>
      <Icon name={icon} size={20} color={tint} />
      <Text style={[styles.tileValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.tileLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

/** A bar segment that eases to `ratio` (0–1) of its parent along one axis. */
function Fill({
  ratio,
  axis,
  style,
}: {
  ratio: number;
  axis: 'width' | 'height';
  style: React.ComponentProps<typeof Animated.View>['style'];
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(withTiming(ratio, { duration: Motion.duration * 2, easing: Motion.easing }));
  }, [progress, ratio]);

  const animated = useAnimatedStyle(() => ({ [axis]: `${progress.get() * 100}%` }));

  return <Animated.View style={[style, animated]} />;
}

const styles = StyleSheet.create({
  content: { padding: Spacing.xl, paddingBottom: 96 },
  card: { borderRadius: Radius.lg, padding: Spacing.xl, marginBottom: Spacing.lg },
  heroValue: {
    color: '#FFFFFF',
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
  },
  heroLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '500' },
  heroTrack: {
    height: 10,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginTop: Spacing.lg,
    overflow: 'hidden',
  },
  heroFill: { height: '100%', borderRadius: Radius.pill, backgroundColor: '#FFFFFF' },
  grid: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  tile: { flex: 1, borderRadius: Radius.md, padding: Spacing.lg, gap: Spacing.xs },
  tileValue: { fontSize: 28, fontWeight: '800', marginTop: Spacing.sm, fontVariant: ['tabular-nums'] },
  tileLabel: { fontSize: 13, fontWeight: '500' },
  cardTitle: { fontSize: 17, fontWeight: '700', marginBottom: Spacing.lg },
  chart: { flexDirection: 'row', gap: Spacing.sm, height: 180 },
  barColumn: { flex: 1, alignItems: 'center', gap: 6 },
  barValue: { fontSize: 12, fontWeight: '600', height: 16, fontVariant: ['tabular-nums'] },
  barTrack: {
    flex: 1,
    width: '100%',
    maxWidth: 36,
    borderRadius: Radius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { width: '100%', borderRadius: Radius.sm },
  barLabel: { fontSize: 12, fontWeight: '500' },
  barLabelToday: { fontWeight: '800' },
});
