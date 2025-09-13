import { Stack } from "expo-router";

export default function RestaurantLayout() {

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Restaurante",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="menu"
        options={{
          title: "Restaurante",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="cart"
        options={{
          title: "Carrito",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="checkout"
        options={{
          title: "Confirmar pedido",
          headerShown: true,
        }}
      />
    </Stack>
  );
}
