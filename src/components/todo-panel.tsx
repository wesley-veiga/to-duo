import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Icon } from '@/components/icon';
import { PanelHeader } from '@/components/panel-header';
import { smoothLayout } from '@/constants/motion';
import { Radius, Spacing, useTheme } from '@/constants/theme';
import { useTodos, type Todo } from '@/store/todos';
import { dayStartAgo, daysAgo, startOfDay } from '@/utils/day';

/** Completed to-dos are shown (and loaded more) in windows of this many days. */
const PAGE_DAYS = 7;

export function TodoPanel() {
  const colors = useTheme();
  const { state, dispatch } = useTodos();
  const [draft, setDraft] = useState('');
  const [visibleDays, setVisibleDays] = useState(PAGE_DAYS);

  const pending = state.todos.filter((t) => t.doneAt === null);
  const done = state.todos.filter((t) => t.doneAt !== null);
  // Midnight that starts the oldest day still inside the first page / the loaded window.
  const oldCutoff = dayStartAgo(PAGE_DAYS - 1);
  const visibleCutoff = dayStartAgo(visibleDays - 1);
  const doneGroups = groupByDoneDay(done.filter((t) => (t.doneAt ?? 0) >= visibleCutoff));
  const oldCount = done.filter((t) => (t.doneAt ?? 0) < oldCutoff).length;
  const hasMore = done.some((t) => (t.doneAt ?? 0) < visibleCutoff);

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  function submit() {
    dispatch({ type: 'add', title: draft });
    setDraft('');
  }

  function deleteOld() {
    const message = `Excluir ${oldCount} ${oldCount === 1 ? 'tarefa concluída' : 'tarefas concluídas'} há mais de ${PAGE_DAYS} dias?`;
    const confirm = () => {
      dispatch({ type: 'removeDoneBefore', before: oldCutoff });
      setVisibleDays(PAGE_DAYS);
    };
    // Alert.alert has no buttons on web.
    if (Platform.OS === 'web') {
      if (window.confirm(message)) confirm();
      return;
    }
    Alert.alert('Excluir antigas', message, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: confirm },
    ]);
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <PanelHeader
        overline={today}
        title="Tarefas"
        right={
          <View style={[styles.badge, { backgroundColor: colors.accentSoft }]}>
            <Text style={[styles.badgeText, { color: colors.accent }]}>
              {done.length}/{state.todos.length}
            </Text>
          </View>
        }
      />

      <View style={[styles.inputRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={submit}
          placeholder="Nova tarefa…"
          placeholderTextColor={colors.textSecondary}
          returnKeyType="done"
          submitBehavior="submit"
          style={[styles.input, { color: colors.text }]}
        />
        <Pressable
          onPress={submit}
          disabled={!draft.trim()}
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: colors.accent, opacity: !draft.trim() ? 0.4 : pressed ? 0.8 : 1 },
          ]}>
          <Icon name="plus" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      <Section title="Pendentes" count={pending.length} />
      {pending.length === 0 && (
        <Text style={[styles.empty, { color: colors.textSecondary }]}>Tudo feito por aqui ✨</Text>
      )}
      {pending.map((todo) => (
        <TodoRow key={todo.id} todo={todo} />
      ))}

      {done.length > 0 && <Section title="Concluídas" count={done.length} />}
      {doneGroups.map((group) => (
        <Animated.View key={group.key} layout={smoothLayout}>
          <Animated.Text
            layout={smoothLayout}
            style={[styles.dayTitle, { color: colors.textSecondary }]}>
            {group.label} · {group.todos.length}
          </Animated.Text>
          {group.todos.map((todo) => (
            <TodoRow key={todo.id} todo={todo} />
          ))}
        </Animated.View>
      ))}

      {oldCount > 0 && (
        <Animated.View layout={smoothLayout} style={styles.footer}>
          <Pressable
            onPress={deleteOld}
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
            <Text style={[styles.linkText, { color: colors.danger }]}>Excluir antigas</Text>
          </Pressable>
          {hasMore && (
            <Pressable
              onPress={() => setVisibleDays((d) => d + PAGE_DAYS)}
              style={({ pressed }) => [
                styles.moreButton,
                { backgroundColor: colors.accentSoft, opacity: pressed ? 0.7 : 1 },
              ]}>
              <Text style={[styles.moreText, { color: colors.accent }]}>Carregar mais</Text>
            </Pressable>
          )}
        </Animated.View>
      )}
    </ScrollView>
  );
}

type DayGroup = { key: string; label: string; todos: Todo[] };

function dayLabel(dayStart: number) {
  const diff = daysAgo(dayStart);
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Ontem';
  return new Date(dayStart).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/** Groups completed to-dos by the day they were completed (`doneAt`), newest day first. */
function groupByDoneDay(todos: Todo[]): DayGroup[] {
  const byDay = new Map<number, Todo[]>();
  for (const t of todos) {
    if (t.doneAt === null) continue;
    const day = startOfDay(t.doneAt);
    byDay.set(day, [...(byDay.get(day) ?? []), t]);
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => b - a)
    .map(([day, items]) => ({
      key: String(day),
      label: dayLabel(day),
      todos: items.sort((a, b) => (b.doneAt ?? 0) - (a.doneAt ?? 0)),
    }));
}

function Section({ title, count }: { title: string; count: number }) {
  const colors = useTheme();
  return (
    <Animated.View layout={smoothLayout} style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        {title} · {count}
      </Text>
    </Animated.View>
  );
}

function TodoRow({ todo }: { todo: Todo }) {
  const colors = useTheme();
  const { dispatch } = useTodos();
  const isDone = todo.doneAt !== null;

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      layout={smoothLayout}
      style={[styles.row, { backgroundColor: colors.surface }]}>
      <Pressable
        onPress={() => dispatch({ type: 'toggle', id: todo.id })}
        hitSlop={8}
        style={styles.rowMain}>
        <Icon
          name={isDone ? 'check' : 'circle'}
          size={24}
          color={isDone ? colors.success : colors.textSecondary}
        />
        <Text
          numberOfLines={2}
          style={[
            styles.rowTitle,
            { color: isDone ? colors.textSecondary : colors.text },
            isDone && styles.rowTitleDone,
          ]}>
          {todo.title}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => dispatch({ type: 'remove', id: todo.id })}
        hitSlop={8}
        style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
        <Icon name="trash" size={18} color={colors.textSecondary} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.xl, paddingBottom: 96 },
  badge: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.pill },
  badgeText: { fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingLeft: Spacing.lg,
    paddingRight: 6,
    paddingVertical: 6,
    marginBottom: Spacing.lg,
  },
  input: { flex: 1, fontSize: 17, paddingVertical: Spacing.sm },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { marginTop: Spacing.lg, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 },
  dayTitle: { fontSize: 13, fontWeight: '600', marginTop: Spacing.sm, marginBottom: Spacing.sm },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    minHeight: 40,
  },
  linkText: { fontSize: 15, fontWeight: '600', textDecorationLine: 'underline' },
  moreButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.pill,
  },
  moreText: { fontSize: 15, fontWeight: '600' },
  empty: { fontSize: 15, paddingVertical: Spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  rowTitle: { flex: 1, fontSize: 16, fontWeight: '500' },
  rowTitleDone: { textDecorationLine: 'line-through' },
});
