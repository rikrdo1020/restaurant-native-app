import { Stack, useLocalSearchParams } from "expo-router";
import { useRestaurant } from "../../../src/hooks/useApi";

export default function RestaurantLayout() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const { data: restaurant } = useRestaurant(restaurantId);

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: restaurant?.name || "Restaurante",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="menu"
        options={{
          title: `Menú - ${restaurant?.name || "Restaurante"}`,
          headerShown: true,
        }}
      />
    </Stack>
  );
}
