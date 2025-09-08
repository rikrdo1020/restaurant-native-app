import { useAuth, useAuthProvider } from "@/src/hooks/useAuth";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, FAB, IconButton, Text } from "react-native-paper";

export default function DashboardScreen() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const { userRestaurants } = useAuthProvider();

  console.log(user);
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <IconButton
          icon={"arrow-left"}
          size={24}
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <Text variant="headlineLarge" style={styles.title}>
          Dashboard
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Bienvenido de vuelta,
        </Text>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.statNumber}>
                127
              </Text>
              <Text variant="bodyMedium">Pedidos Hoy</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.statNumber}>
                $2,450
              </Text>
              <Text variant="bodyMedium">Ventas Hoy</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.statNumber}>
                45
              </Text>
              <Text variant="bodyMedium">Items en Menú</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text variant="headlineSmall" style={styles.sectionTitle}>
            Acciones Rápidas
          </Text>

          <View style={styles.actionsGrid}>
            <Button
              mode="contained"
              onPress={() =>
                router.push(
                  `/(admin)/menu?restaurantId=${userRestaurants[0]?.restaurant_id}` as any
                )
              }
              style={styles.actionButton}
              contentStyle={{ paddingVertical: 12 }}
            >
              Gestionar Menú
            </Button>

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

        {/* Recent Orders */}
        <View style={styles.section}>
          <Text variant="headlineSmall" style={styles.sectionTitle}>
            Pedidos Recientes
          </Text>

          <Card style={styles.orderCard}>
            <Card.Content>
              <Text variant="titleMedium">Pedido #1234</Text>
              <Text variant="bodyMedium">Mesa 5 • $45.50 • Hace 5 min</Text>
            </Card.Content>
          </Card>

          <Card style={styles.orderCard}>
            <Card.Content>
              <Text variant="titleMedium">Pedido #1233</Text>
              <Text variant="bodyMedium">Mesa 2 • $32.00 • Hace 12 min</Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      {/* Preview Restaurant Button */}
      <FAB
        icon="eye"
        label="Ver Restaurante"
        onPress={() => router.push("/restaurant/demo")}
        style={styles.fab}
      />
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
