import {
  useCancelOrder,
  useOrder,
  useUpdateOrderStatus,
} from "@/src/hooks/useOrders";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Chip,
  Divider,
  IconButton,
  Text,
} from "react-native-paper";

export default function OrderDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: order, isLoading, isError, error } = useOrder(id);
  const updateOrderMutation = useUpdateOrderStatus();
  const cancelOrderMutation = useCancelOrder();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#ff9800";
      case "preparing":
        return "#2196f3";
      case "ready":
        return "#4caf50";
      case "delivered":
        return "#9e9e9e";
      case "cancelled":
        return "#f44336";
      default:
        return "#9e9e9e";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "preparing":
        return "Preparando";
      case "ready":
        return "Listo";
      case "delivered":
        return "Entregado";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Cargando orden...</Text>
      </View>
    );
  }

  if (isError || !order) {
    return (
      <View style={styles.center}>
        <IconButton icon="arrow-left" onPress={() => router.back()} />
        <Text variant="headlineSmall">Error al cargar orden</Text>
        <Text>{error?.message || "No se encontró la orden"}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text variant="headlineSmall" style={{ flex: 1 }}>
          Orden {order.id}
        </Text>
        <Chip
          style={{ backgroundColor: getStatusColor(order.status) }}
          textStyle={{ color: "#fff" }}
        >
          {getStatusText(order.status)}
        </Chip>
      </View>

      <Divider style={{ marginVertical: 12 }} />

      <Text variant="bodyMedium">Mesa: {order.table_number || "-"}</Text>
      {order.customer_name && (
        <Text variant="bodyMedium">Cliente: {order.customer_name}</Text>
      )}
      <Text variant="bodySmall">Creado: {formatDate(order.created_at)}</Text>

      {order.notes && <Text style={styles.notes}>Notas: {order.notes}</Text>}

      <Divider style={{ marginVertical: 12 }} />

      <Text variant="titleMedium" style={{ marginBottom: 8 }}>
        Items:
      </Text>
      {order.order_items.map((item, idx) => (
        <View key={idx} style={{ marginBottom: 4 }}>
          <Text variant="bodyMedium">
            • {item.quantity}x {item.menu_items?.name} - $
            {item.price?.toFixed(2)}
          </Text>
        </View>
      ))}

      <Divider style={{ marginVertical: 12 }} />

      <Text variant="titleMedium" style={{ color: "#ff6347" }}>
        Total: ${order.total_amount?.toFixed(2)}
      </Text>

      <View
        style={{
          flexDirection: "row",
          marginTop: 16,
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        {order.status === "pending" && (
          <>
            <Button
              mode="contained"
              onPress={() =>
                updateOrderMutation.mutate({
                  orderId: order.id,
                  status: "preparing",
                })
              }
              style={{ backgroundColor: "#2196f3" }}
            >
              Preparar
            </Button>
            <Button
              mode="outlined"
              onPress={() =>
                cancelOrderMutation.mutate({
                  orderId: order.id,
                  reason: "Cancelado desde admin",
                })
              }
              textColor="#f44336"
            >
              Cancelar
            </Button>
          </>
        )}
        {order.status === "preparing" && (
          <Button
            mode="contained"
            onPress={() =>
              updateOrderMutation.mutate({ orderId: order.id, status: "ready" })
            }
            style={{ backgroundColor: "#4caf50" }}
          >
            Listo
          </Button>
        )}
        {order.status === "ready" && (
          <Button
            mode="contained"
            onPress={() =>
              updateOrderMutation.mutate({
                orderId: order.id,
                status: "delivered",
              })
            }
            style={{ backgroundColor: "#9e9e9e" }}
          >
            Entregado
          </Button>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerRow: { flexDirection: "row", alignItems: "center" },
  notes: {
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
    fontStyle: "italic",
  },
});
