import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { Radius, useTheme } from '@/constants/theme';

/** Folded layout: one full-width page at a time, swiped horizontally. */
export function Pager({ pages }: { pages: { key: string; node: ReactNode }[] }) {
  const window = useWindowDimensions();
  // Pages must match the ScrollView's own width, not the window's: safe-area insets
  // (e.g. the side status bar on the iPhone Duo cover display) make it narrower, and
  // `pagingEnabled` snaps by the ScrollView's width.
  const [width, setWidth] = useState(window.width);
  const colors = useTheme();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.set(e.contentOffset.x);
  });

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled">
        {pages.map((page) => (
          <View key={page.key} style={{ width }}>
            {page.node}
          </View>
        ))}
      </Animated.ScrollView>

      <View style={[styles.dots, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {pages.map((page, index) => (
          <Pressable
            key={page.key}
            hitSlop={10}
            onPress={() => scrollRef.current?.scrollTo({ x: index * width, animated: true })}>
            <Dot index={index} width={width} scrollX={scrollX} color={colors.accent} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function Dot({
  index,
  width,
  scrollX,
  color,
}: {
  index: number;
  width: number;
  scrollX: SharedValue<number>;
  color: string;
}) {
  const style = useAnimatedStyle(() => {
    const position = scrollX.get() / width;
    const range = [index - 1, index, index + 1];
    return {
      width: interpolate(position, range, [8, 24, 8], Extrapolation.CLAMP),
      opacity: interpolate(position, range, [0.35, 1, 0.35], Extrapolation.CLAMP),
    };
  });
  return <Animated.View style={[styles.dot, { backgroundColor: color }, style]} />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  dots: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dot: { height: 8, borderRadius: Radius.pill },
});
