import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import { useRestaurant } from "../../../src/hooks/useApi";

export default function RestaurantScreen() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const router = useRouter();

  const { data: restaurant, isLoading, error } = useRestaurant(restaurantId);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Cargando restaurante...</Text>
      </View>
    );
  }

  if (error || !restaurant) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text
          variant="headlineSmall"
          style={{ textAlign: "center", marginBottom: 16 }}
        >
          Restaurante no encontrado
        </Text>
        <Text variant="bodyMedium" style={{ textAlign: "center" }}>
          Verifica que el enlace sea correcto.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text
        variant="headlineLarge"
        style={{ textAlign: "center", marginBottom: 16 }}
      >
        ¡Bienvenido a {restaurant.name}!
      </Text>

      {restaurant.description && (
        <Text
          variant="bodyLarge"
          style={{ textAlign: "center", marginBottom: 24, opacity: 0.7 }}
        >
          {restaurant.description}
        </Text>
      )}

      <Button
        mode="contained"
        onPress={() => router.push(`/restaurant/${restaurantId}/menu`)}
        style={{ backgroundColor: "#ff6347", marginTop: 20 }}
        contentStyle={{ paddingVertical: 8 }}
      >
        Ver Menú
      </Button>
    </View>
  );
}
