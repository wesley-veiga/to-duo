import { Stack } from 'expo-router';

import { TodosProvider } from '@/store/todos';

export default function RootLayout() {
  return (
    <TodosProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </TodosProvider>
  );
}
