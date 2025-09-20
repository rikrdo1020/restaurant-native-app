import { Stack } from "expo-router";

export default function OrdersLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitle: () => <>HEADER</>,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Órdenes" }} />
      <Stack.Screen name="new" options={{ title: "Nueva Orden" }} />
      <Stack.Screen name="[id]" options={{ title: "Detalle de Orden" }} />
    </Stack>
  );
}
