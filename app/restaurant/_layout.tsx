import { Stack } from "expo-router";

export default function RestaurantLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // ✅ Configuración para transiciones suaves
        animation: "slide_from_right",
        gestureEnabled: true,
      }}
    >
      {/* ✅ Rutas dinámicas del restaurante */}
      <Stack.Screen
        name="[slug]"
        options={{
          title: "Restaurante",
        }}
      />
    </Stack>
  );
}
