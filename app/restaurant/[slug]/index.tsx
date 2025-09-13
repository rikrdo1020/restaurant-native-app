import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import { useRestaurant } from "../../../src/hooks/useApi";

export default function RestaurantScreen() {
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const router = useRouter();

  const restaurantQuery = useRestaurant(slug);

  // Si slug aún no está disponible
  if (!slug) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Esperando slug...</Text>
      </View>
    );
  }

  if (restaurantQuery.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Cargando restaurante...</Text>
      </View>
    );
  }

  if (restaurantQuery.error || !restaurantQuery.data) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text variant="headlineSmall" style={{ textAlign: "center", marginBottom: 16 }}>
          Restaurante no encontrado
        </Text>
        <Text variant="bodyMedium" style={{ textAlign: "center" }}>
          {restaurantQuery.error?.message ?? "Verifica que el enlace sea correcto."}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text variant="headlineLarge" style={{ textAlign: "center", marginBottom: 16 }}>
        ¡Bienvenido a {restaurantQuery.data.name}!
      </Text>

      {restaurantQuery.data.description && (
        <Text variant="bodyLarge" style={{ textAlign: "center", marginBottom: 24, opacity: 0.7 }}>
          {restaurantQuery.data.description}
        </Text>
      )}

      <Button
        mode="contained"
        onPress={() => router.push(`/restaurant/${slug}/menu`)}
        style={{ backgroundColor: "#ff6347", marginTop: 20 }}
        contentStyle={{ paddingVertical: 8 }}
      >
        Ver Menú
      </Button>
    </View>
  );
}