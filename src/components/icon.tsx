import { SymbolView } from 'expo-symbols';

const ICONS = {
  check: { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' },
  circle: { ios: 'circle', android: 'radio_button_unchecked', web: 'radio_button_unchecked' },
  plus: { ios: 'plus', android: 'add', web: 'add' },
  trash: { ios: 'trash', android: 'delete', web: 'delete' },
  swap: { ios: 'arrow.left.arrow.right', android: 'swap_horiz', web: 'swap_horiz' },
  list: { ios: 'checklist', android: 'checklist', web: 'checklist' },
  chart: { ios: 'chart.bar.fill', android: 'bar_chart', web: 'bar_chart' },
  flame: { ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' },
  clock: { ios: 'clock', android: 'schedule', web: 'schedule' },
} as const;

export type IconName = keyof typeof ICONS;

type Props = { name: IconName; size?: number; color: string };

export function Icon({ name, size = 22, color }: Props) {
  return (
    <SymbolView
      name={ICONS[name]}
      size={size}
      tintColor={color}
      style={{ width: size, height: size }}
    />
  );
}
