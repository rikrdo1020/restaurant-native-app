import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Text } from "react-native-paper";
import { useMenu, useRestaurant } from "../../../src/hooks/useApi";
import { useCart } from "../../../src/hooks/useCart";

export default function MenuScreen() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const router = useRouter();
  const { data: restaurant } = useRestaurant(restaurantId);

  if (!restaurant) {
    return (
      <View style={styles.centered}>
        <Text style={{ marginTop: 16 }}>Error, vuelve a intentarlo.</Text>
      </View>
    );
  }

  const { data: categories, isLoading, error } = useMenu(restaurant?.id);
  const { addItem, getItemCount } = useCart();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Cargando menú...</Text>
      </View>
    );
  }

  if (error || !categories) {
    return (
      <View style={styles.centered}>
        <Text variant="headlineSmall">Error al cargar el menú</Text>
        <Text variant="bodyMedium" style={{ marginTop: 8 }}>
          {error?.message || "Intenta nuevamente"}
        </Text>
      </View>
    );
  }

  const cartItemCount = getItemCount();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {categories.map((category: any) => (
          <View key={category.id} style={styles.categorySection}>
            <Text variant="headlineSmall" style={styles.categoryTitle}>
              {category.name}
            </Text>

            {category.items.map((item: any) => (
              <Card key={item.id} style={styles.menuItem}>
                <Card.Content>
                  <View style={styles.itemHeader}>
                    <Text variant="titleMedium" style={styles.itemName}>
                      {item.name}
                    </Text>
                    <Text variant="titleMedium" style={styles.itemPrice}>
                      ${item.price.toFixed(2)}
                    </Text>
                  </View>

                  {item.description && (
                    <Text variant="bodyMedium" style={styles.itemDescription}>
                      {item.description}
                    </Text>
                  )}

                  <Button
                    mode="contained"
                    onPress={() => addItem(item)}
                    style={styles.addButton}
                    contentStyle={{ paddingVertical: 4 }}
                  >
                    Agregar al carrito
                  </Button>
                </Card.Content>
              </Card>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Botón flotante del carrito */}
      {cartItemCount > 0 && (
        <View style={styles.cartButton}>
          <Button
            mode="contained"
            onPress={() => router.push("/cart" as any)}
            style={{ backgroundColor: "#ff6347" }}
            contentStyle={{ paddingVertical: 8 }}
          >
            Ver Carrito ({cartItemCount})
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    marginBottom: 12,
    fontWeight: "bold",
  },
  menuItem: {
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemName: {
    flex: 1,
    fontWeight: "bold",
  },
  itemPrice: {
    fontWeight: "bold",
    color: "#ff6347",
  },
  itemDescription: {
    marginBottom: 12,
    opacity: 0.7,
  },
  addButton: {
    backgroundColor: "#ff6347",
  },
  cartButton: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
  },
});
