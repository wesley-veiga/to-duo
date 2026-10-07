/** Midnight (local time) of the day containing `time`, as a timestamp. Used as the day key everywhere. */
export function startOfDay(time: number) {
  const d = new Date(time);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Whole calendar days from `time` until `now` (0 = today, 1 = yesterday). DST-safe. */
export function daysAgo(time: number, now = Date.now()) {
  return Math.round((startOfDay(now) - startOfDay(time)) / (24 * 60 * 60 * 1000));
}

/** Midnight of the day `n` calendar days before `now`. */
export function dayStartAgo(n: number, now = Date.now()) {
  const d = new Date(startOfDay(now));
  d.setDate(d.getDate() - n);
  return d.getTime();
}
