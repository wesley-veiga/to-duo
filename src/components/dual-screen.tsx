import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Pager } from "@/components/pager";
import { SplitView } from "@/components/split-view";
import { StatsPanel } from "@/components/stats-panel";
import { TodoPanel } from "@/components/todo-panel";
import { useTheme } from "@/constants/theme";
import { useFoldState } from "@/hooks/use-fold-state";
import { useTodos } from "@/store/todos";

const PAGES = [
  { key: "todo", node: <TodoPanel /> },
  { key: "stats", node: <StatsPanel /> },
];

/** Picks the layout for the current window: swipeable pages when folded, split when unfolded. */
export function DualScreen() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const fold = useFoldState();
  const { state, dispatch } = useTodos();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      {fold === "unfolded" ? (
        <SplitView
          pages={PAGES}
          swapped={state.swapped}
          onSwap={() => dispatch({ type: "swap" })}
        />
      ) : (
        <Pager pages={PAGES} />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
