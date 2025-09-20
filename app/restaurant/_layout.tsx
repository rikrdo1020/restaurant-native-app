import { Stack } from "expo-router";

export default function RestaurantLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="[slug]"
        options={{
          title: "Restaurante",
        }}
      />
    </Stack>
  );
}
