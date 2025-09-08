import AuthProvider from "@/src/providers/auth-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { MD3LightTheme, PaperProvider } from "react-native-paper";

const queryClient = new QueryClient();

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "rgb(104, 16, 0)",
    onPrimary: "rgb(255, 255, 255)",
    primaryContainer: "rgb(255, 218, 212)",
    onPrimaryContainer: "rgb(65, 0, 0)",
  },
};

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="restaurant" />
            <Stack.Screen name="(admin)" />
          </Stack>
        </AuthProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}
