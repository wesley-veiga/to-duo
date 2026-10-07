import type { Todo } from "@/store/todos";
import { dayStartAgo, startOfDay } from "@/utils/day";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export type DayStat = {
  key: string;
  label: string;
  count: number;
  isToday: boolean;
};

export type Stats = {
  total: number;
  done: number;
  pending: number;
  rate: number;
  lastWeek: DayStat[];
};

export function computeStats(todos: Todo[], now = Date.now()): Stats {
  const total = todos.length;
  const completions = new Map<number, number>();
  for (const t of todos) {
    if (t.doneAt === null) continue;
    const key = startOfDay(t.doneAt);
    completions.set(key, (completions.get(key) ?? 0) + 1);
  }
  const done = todos.filter((t) => t.doneAt !== null).length;

  const lastWeek: DayStat[] = [];
  for (let i = 6; i >= 0; i--) {
    const key = dayStartAgo(i, now);
    lastWeek.push({
      key: String(key),
      label: WEEKDAYS[new Date(key).getDay()],
      count: completions.get(key) ?? 0,
      isToday: i === 0,
    });
  }

  return {
    total,
    done,
    pending: total - done,
    rate: total === 0 ? 0 : done / total,
    lastWeek,
  };
}
