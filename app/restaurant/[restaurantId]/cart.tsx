import { OrderSummary } from "@/src/components/OrderSumary";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";
import { Button, Divider, FAB, Text } from "react-native-paper";
import { CartItem } from "../../../src/components/CartItem";
import { useCart } from "../../../src/hooks/useCart";

export default function CartScreen() {
  // 🔄 Cambio: useRouter en lugar de navigation prop
  const router = useRouter();

  const { items, getTotal, getItemCount, clearCart } = useCart();

  const total = getTotal();
  const itemCount = getItemCount();

  if (items.length === 0) {
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
          Tu pedido está vacío
        </Text>
        <Text
          variant="bodyMedium"
          style={{ textAlign: "center", marginBottom: 24, opacity: 0.7 }}
        >
          Agrega algunos productos del menú para continuar
        </Text>
        <Button
          mode="contained"
          // 🔄 Cambio: router.back() en lugar de navigation.goBack()
          onPress={() => router.back()}
          style={{ backgroundColor: "#ff6347" }}
        >
          Volver al Menú
        </Button>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 16 }}>
          {/* Header */}
          <View style={{ marginBottom: 24 }}>
            <Text variant="headlineSmall" style={{ marginBottom: 8 }}>
              Mi Pedido
            </Text>
            <Text variant="bodyMedium" style={{ opacity: 0.7 }}>
              {itemCount} {itemCount === 1 ? "producto" : "productos"}{" "}
              seleccionados
            </Text>
          </View>

          {/* Items del carrito */}
          <View style={{ marginBottom: 24 }}>
            {items.map((item, index) => (
              <View key={`${item.menu_item_id}-${index}`}>
                <CartItem item={item} />
                {index < items.length - 1 && (
                  <Divider style={{ marginVertical: 12 }} />
                )}
              </View>
            ))}
          </View>

          {/* Resumen del pedido */}
          <OrderSummary subtotal={total} total={total} itemCount={itemCount} />

          {/* Botón limpiar carrito */}
          <Button
            mode="outlined"
            onPress={clearCart}
            style={{
              marginTop: 16,
              borderColor: "#ff6347",
            }}
            textColor="#ff6347"
          >
            Limpiar Pedido
          </Button>

          {/* Espacio para el FAB */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* FAB para continuar */}
      <FAB
        icon="arrow-right"
        label={`Continuar • $${total.toFixed(2)}`}
        style={{
          position: "absolute",
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: "#ff6347",
        }}
        // 🔄 Cambio: router.push en lugar de navigation.navigate
        onPress={() => router.push("/checkout" as any)}
      />
    </View>
  );
}
