import { Easing, LinearTransition } from 'react-native-reanimated';

/** Eases out without overshooting, so views settle in place instead of bouncing. */
export const Motion = {
  duration: 280,
  easing: Easing.out(Easing.cubic),
} as const;

/** Layout transition for views that move when siblings are added, removed or reordered. */
export const smoothLayout = LinearTransition.duration(Motion.duration).easing(Motion.easing);
