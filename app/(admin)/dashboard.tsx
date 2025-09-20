import { useAuthProvider } from "@/src/hooks/useAuth";
import { useMenuItems } from "@/src/hooks/useMenu";
import { useOrders, useOrdersStats } from "@/src/hooks/useOrders";
import { useUserRestaurants } from "@/src/hooks/useUserQueries";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Text } from "react-native-paper";

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthProvider();
  const { data: userRestaurantsData, isLoading: userRestaurantsLoading } =
    useUserRestaurants(user?.id || "");

  const { data: ordersData } = useOrders({
    status: "pending",
  });
  const { data: ordersStatsData, isLoading: isOrdersLoading } =
    useOrdersStats();
  const { data: menuData, isLoading: isLoadingMenu } = useMenuItems();

  if (isOrdersLoading || isLoadingMenu || userRestaurantsLoading)
    return <ActivityIndicator style={{ margin: 16 }} />;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Bienvenido de vuelta,
        </Text>

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.statNumber}>
                {ordersStatsData?.todayTotal || 0}
              </Text>
              <Text variant="bodyMedium">Pedidos Hoy</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.statNumber}>
                $ {ordersStatsData?.todayRevenue || 0}
              </Text>
              <Text variant="bodyMedium">Ventas Hoy</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.statNumber}>
                {menuData?.length || 0}
              </Text>
              <Text variant="bodyMedium">Items en Menú</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.section}>
          <Text variant="headlineSmall" style={styles.sectionTitle}>
            Acciones Rápidas
          </Text>

          <View style={styles.actionsGrid}>
            {userRestaurantsData?.length === 1 && (
              <Button
                mode="contained"
                onPress={() =>
                  router.push(
                    `/(admin)/menu?restaurantId=${userRestaurantsData[0]?.restaurant_id}` as any
                  )
                }
                style={styles.actionButton}
                contentStyle={{ paddingVertical: 12 }}
              >
                Gestionar Menú
              </Button>
            )}

            <Button
              mode="contained"
              onPress={() => router.push("/(admin)/orders" as any)}
              style={styles.actionButton}
              contentStyle={{ paddingVertical: 12 }}
            >
              Ver Pedidos
            </Button>

            <Button
              mode="contained"
              onPress={() => router.push("/(admin)/restaurant/settings" as any)}
              style={styles.actionButton}
              contentStyle={{ paddingVertical: 12 }}
            >
              Configuración
            </Button>
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="headlineSmall" style={styles.sectionTitle}>
            Pedidos Recientes
          </Text>

          {ordersData?.length === 0 && (
            <Text variant="bodyMedium" style={{ opacity: 0.7 }}>
              No hay pedidos recientes.
            </Text>
          )}

          {ordersData?.map((order) => (
            <Card key={order.id} style={styles.orderCard}>
              <Card.Content>
                <Text variant="titleMedium">Pedido {order.id}</Text>
                <Text variant="bodyMedium">
                  Mesa {order.table_number} • ${order.total_amount} • Hace 5 min
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* <FAB
        icon="eye"
        label="Ver Restaurante"
        onPress={() =>
          router.replace(`/restaurant/${userRestaurants[0]?.restaurant_slug}`)
        }
        style={styles.fab}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 32,
    flexWrap: "wrap",
  },
  statCard: {
    flex: 1,
    minWidth: 120,
  },
  statNumber: {
    color: "#ff6347",
    fontWeight: "bold",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  actionButton: {
    backgroundColor: "#ff6347",
    flex: 1,
    minWidth: 150,
  },
  orderCard: {
    marginBottom: 8,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#ff6347",
  },
  backButton: {
    alignSelf: "flex-start",
    marginLeft: -8,
    marginBottom: 8,
  },
});
