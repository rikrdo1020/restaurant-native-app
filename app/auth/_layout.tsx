import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../src/hooks/useAuth";

export default function AuthLayout() {
  const { user } = useAuth();

  // Si el usuario ya está autenticado, redirigir al home
  if (user) {
    return <Redirect href="/(admin)/dashboard" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#f5f5f5" },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="callback" />
    </Stack>
  );
}
