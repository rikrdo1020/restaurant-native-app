import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { Platform, View } from "react-native";
import { ActivityIndicator, IconButton } from "react-native-paper";
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
  }

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
    return null; // Se redirigirá al login
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#ffffff",
        },
        headerTintColor: "#292929",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerLeft: () => (
          <IconButton
            icon="arrow-left"
            iconColor="#2e2e2e"
            size={24}
            onPress={handleBack}
            style={{ marginLeft: Platform.OS === "ios" ? 4 : -8 }}
          />
        ),
      }}
    >
      <Stack.Screen
        name="dashboard"
        options={{ title: "Panel de Administración" }}
      />
      <Stack.Screen name="menu/index" options={{ title: "Gestión de Menú" }} />
      <Stack.Screen
        name="restaurant/settings"
        options={{ title: "Configuración" }}
      />
      <Stack.Screen name="orders/index" options={{ title: "Pedidos" }} />
    </Stack>
  );
}
