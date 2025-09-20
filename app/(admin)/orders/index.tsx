import {
  useCancelOrder,
  useOrders,
  useOrdersStats,
  useUpdateOrderStatus,
  type Order,
} from "@/src/hooks/useOrders";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Badge,
  Button,
  Card,
  Chip,
  Divider,
  FAB,
  IconButton,
  Searchbar,
  Snackbar,
  Text,
} from "react-native-paper";

export default function OrdersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // 🎯 TanStack Query hooks
  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useOrders({
    status: statusFilter,
    search: searchQuery,
  });

  const { data: stats, isLoading: statsLoading } = useOrdersStats();

  const updateOrderMutation = useUpdateOrderStatus();
  const cancelOrderMutation = useCancelOrder();

  const statusOptions = [
    { value: "all", label: "Todos" },
    { value: "pending", label: "Pendientes" },
    { value: "preparing", label: "Preparando" },
    { value: "ready", label: "Listos" },
    { value: "delivered", label: "Entregados" },
  ];

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    try {
      await updateOrderMutation.mutateAsync({
        orderId,
        status: newStatus,
      });

      setSnackbarMessage(`Orden actualizada a ${getStatusText(newStatus)}`);
      setSnackbarVisible(true);
    } catch (error) {
      setSnackbarMessage("Error al actualizar la orden");
      setSnackbarVisible(true);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrderMutation.mutateAsync({
        orderId,
        reason: "Cancelado desde admin",
      });

      setSnackbarMessage("Orden cancelada");
      setSnackbarVisible(true);
    } catch (error) {
      setSnackbarMessage("Error al cancelar la orden");
      setSnackbarVisible(true);
    }
  };

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

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <Text variant="headlineSmall">Error al cargar órdenes</Text>
        <Text variant="bodyMedium" style={styles.errorText}>
          {error?.message || "Ha ocurrido un error inesperado"}
        </Text>
        <Button mode="contained" onPress={() => refetch()}>
          Reintentar
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {statsLoading ? (
          <ActivityIndicator size="small" />
        ) : (
          stats && (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text variant="bodySmall">Pendientes</Text>
                <Badge style={[styles.badge, { backgroundColor: "#ff9800" }]}>
                  {stats.pending}
                </Badge>
              </View>
              <View style={styles.statItem}>
                <Text variant="bodySmall">Preparando</Text>
                <Badge style={[styles.badge, { backgroundColor: "#2196f3" }]}>
                  {stats.preparing}
                </Badge>
              </View>
              <View style={styles.statItem}>
                <Text variant="bodySmall">Listos</Text>
                <Badge style={[styles.badge, { backgroundColor: "#4caf50" }]}>
                  {stats.ready}
                </Badge>
              </View>
              <View style={styles.statItem}>
                <Text variant="bodySmall">Hoy</Text>
                <Badge style={[styles.badge, { backgroundColor: "#9c27b0" }]}>
                  {stats.todayTotal}
                </Badge>
              </View>
            </View>
          )
        )}
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar por mesa, cliente o ID..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipContainer}>
            {statusOptions.map((option) => (
              <Chip
                key={option.value}
                selected={statusFilter === option.value}
                onPress={() => setStatusFilter(option.value)}
                style={styles.chip}
              >
                {option.label}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            Cargando órdenes...
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        >
          {orders.length === 0 ? (
            <View style={styles.emptyState}>
              <Text variant="bodyLarge" style={styles.emptyText}>
                {searchQuery ? "No se encontraron órdenes" : "No hay órdenes"}
              </Text>
            </View>
          ) : (
            orders.map((order) => (
              <Card key={order.id} style={styles.orderCard}>
                <Card.Content>
                  <View style={styles.orderHeader}>
                    <View style={styles.orderInfo}>
                      <Text variant="titleMedium" style={styles.orderTitle}>
                        Mesa {order.table_number}
                      </Text>
                      <Text variant="bodySmall" style={styles.orderTime}>
                        {formatDate(order.created_at)}
                      </Text>
                    </View>
                    <Chip
                      style={[
                        styles.statusChip,
                        { backgroundColor: getStatusColor(order.status) },
                      ]}
                      textStyle={{ color: "white" }}
                    >
                      {getStatusText(order.status)}
                    </Chip>
                  </View>

                  {order.customer_name && (
                    <Text variant="bodyMedium" style={styles.customerName}>
                      Cliente: {order.customer_name}
                    </Text>
                  )}

                  <View style={styles.itemsContainer}>
                    <Text variant="bodySmall" style={styles.itemsTitle}>
                      Items ({order.order_items.length}):
                    </Text>
                    {order.order_items.slice(0, 3).map((item, index) => (
                      <Text
                        key={index}
                        variant="bodySmall"
                        style={styles.itemText}
                      >
                        • {item.quantity}x {item.menu_items.name}
                      </Text>
                    ))}
                    {order.order_items.length > 3 && (
                      <Text variant="bodySmall" style={styles.moreItems}>
                        +{order.order_items.length - 3} más...
                      </Text>
                    )}
                  </View>

                  {order.notes && (
                    <Text variant="bodySmall" style={styles.notes}>
                      Notas: {order.notes}
                    </Text>
                  )}

                  <Divider style={styles.divider} />

                  <View style={styles.orderFooter}>
                    <Text variant="titleMedium" style={styles.total}>
                      Total: ${order.total_amount.toFixed(2)}
                    </Text>

                    <View style={styles.actions}>
                      {order.status === "pending" && (
                        <>
                          <Button
                            mode="contained"
                            onPress={() =>
                              handleUpdateStatus(order.id, "preparing")
                            }
                            style={[
                              styles.actionButton,
                              { backgroundColor: "#2196f3" },
                            ]}
                            loading={updateOrderMutation.isPending}
                            compact
                          >
                            Preparar
                          </Button>
                          <Button
                            mode="outlined"
                            onPress={() => handleCancelOrder(order.id)}
                            loading={cancelOrderMutation.isPending}
                            compact
                          >
                            Cancelar
                          </Button>
                        </>
                      )}

                      {order.status === "preparing" && (
                        <Button
                          mode="contained"
                          onPress={() => handleUpdateStatus(order.id, "ready")}
                          style={[
                            styles.actionButton,
                            { backgroundColor: "#4caf50" },
                          ]}
                          loading={updateOrderMutation.isPending}
                          compact
                        >
                          Listo
                        </Button>
                      )}

                      {order.status === "ready" && (
                        <Button
                          mode="contained"
                          onPress={() =>
                            handleUpdateStatus(order.id, "delivered")
                          }
                          style={[
                            styles.actionButton,
                            { backgroundColor: "#9e9e9e" },
                          ]}
                          loading={updateOrderMutation.isPending}
                          compact
                        >
                          Entregado
                        </Button>
                      )}

                      <Button
                        mode="outlined"
                        onPress={() =>
                          router.push(`/(admin)/orders/${order.id}` as any)
                        }
                        compact
                      >
                        Detalles
                      </Button>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </ScrollView>
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          router.push("/(admin)/orders/new" as any);
        }}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 16,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    flex: 1,
    marginLeft: 8,
    fontWeight: "bold",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  badge: {
    marginTop: 4,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
  searchbar: {
    elevation: 0,
    backgroundColor: "#f5f5f5",
  },
  filtersContainer: {
    backgroundColor: "#fff",
    paddingBottom: 16,
  },
  chipContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    marginRight: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  errorText: {
    textAlign: "center",
    marginVertical: 16,
    opacity: 0.6,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    opacity: 0.6,
  },
  orderCard: {
    marginBottom: 16,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontWeight: "bold",
  },
  orderTime: {
    opacity: 0.6,
    marginTop: 2,
  },
  statusChip: {
    marginLeft: 8,
  },
  customerName: {
    marginBottom: 8,
    fontWeight: "500",
  },
  itemsContainer: {
    marginBottom: 8,
  },
  itemsTitle: {
    fontWeight: "500",
    marginBottom: 4,
  },
  itemText: {
    opacity: 0.8,
    marginLeft: 8,
  },
  moreItems: {
    opacity: 0.6,
    marginLeft: 8,
    fontStyle: "italic",
  },
  notes: {
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
    fontStyle: "italic",
  },
  divider: {
    marginVertical: 12,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  total: {
    fontWeight: "bold",
    color: "#ff6347",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    minWidth: 80,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#ff6347",
  },
});
