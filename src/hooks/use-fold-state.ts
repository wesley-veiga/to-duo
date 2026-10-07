import { useWindowDimensions } from 'react-native';

export type FoldState = 'folded' | 'unfolded';

/**
 * Below this width a single pane is shown. Matches Android's "medium" window
 * size class, which unfolded foldables and tablets fall into.
 */
const UNFOLDED_MIN_WIDTH = 600;

export function useFoldState(): FoldState {
  const { width } = useWindowDimensions();
  return width >= UNFOLDED_MIN_WIDTH ? 'unfolded' : 'folded';
}
