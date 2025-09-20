import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useAuth } from "../../src/hooks/useAuth";

export default function AdminLayout() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleBack = () => {
    try {
      router.back();
    } catch {
      router.replace("/");
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login" as any);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="dashboard"
        options={{ title: "Panel de Administración" }}
      />
      <Stack.Screen name="menu/index" options={{ title: "Gestión de Menú" }} />
      <Stack.Screen name="settings" options={{ title: "Configuración" }} />
    </Stack>
  );
}
