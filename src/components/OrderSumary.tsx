import React from "react";
import { View } from "react-native";
import { Card, Divider, Text } from "react-native-paper";

interface Props {
  subtotal: number;
  tax?: number;
  delivery?: number;
  discount?: number;
  total: number;
  itemCount: number;
}

export function OrderSummary({
  subtotal,
  tax = 0,
  delivery = 0,
  discount = 0,
  total,
  itemCount,
}: Props) {
  return (
    <Card style={{ elevation: 2 }}>
      <Card.Content>
        <Text
          variant="titleMedium"
          style={{ fontWeight: "bold", marginBottom: 16 }}
        >
          Resumen del Pedido
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <Text variant="bodyMedium">
            {itemCount} {itemCount === 1 ? "producto" : "productos"}
          </Text>
          <Text variant="bodyMedium">${subtotal.toFixed(2)}</Text>
        </View>

        {tax > 0 && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text variant="bodyMedium">Impuestos</Text>
            <Text variant="bodyMedium">${tax.toFixed(2)}</Text>
          </View>
        )}

        {delivery > 0 && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text variant="bodyMedium">Envío</Text>
            <Text variant="bodyMedium">${delivery.toFixed(2)}</Text>
          </View>
        )}

        {discount > 0 && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text variant="bodyMedium" style={{ color: "#4caf50" }}>
              Descuento
            </Text>
            <Text variant="bodyMedium" style={{ color: "#4caf50" }}>
              -${discount.toFixed(2)}
            </Text>
          </View>
        )}

        <Divider style={{ marginVertical: 12 }} />

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
            Total
          </Text>
          <Text
            variant="titleMedium"
            style={{ fontWeight: "bold", color: "#ff6347" }}
          >
            ${total.toFixed(2)}
          </Text>
        </View>

        <Text
          variant="bodySmall"
          style={{
            marginTop: 12,
            textAlign: "center",
            opacity: 0.6,
            fontStyle: "italic",
          }}
        >
          Los precios incluyen todos los impuestos
        </Text>
      </Card.Content>
    </Card>
  );
}
