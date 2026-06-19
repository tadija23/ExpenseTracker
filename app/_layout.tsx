import { Stack } from "expo-router";
import { Provider } from "react-redux";

import { ThemeProvider } from "../context/ThemeContext";
import { store } from "../store/store";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="expense/add" />
          <Stack.Screen name="expense/edit" />
          <Stack.Screen name="expense/details" />
        </Stack>
      </ThemeProvider>
    </Provider>
  );
}