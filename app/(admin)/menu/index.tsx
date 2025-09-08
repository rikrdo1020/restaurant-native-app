import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  Dialog,
  Divider,
  FAB,
  IconButton,
  Menu,
  Portal,
  Searchbar,
  Snackbar,
  Switch,
  Text,
  TextInput,
} from "react-native-paper";

// Interface actualizada según tu DB
export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  position: number;
  available: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  position: number;
  active: boolean;
  restaurant_id: string;
}

// Hooks simplificados para tu interface
import {
  useCreateCategory,
  useDeleteMenuItem,
  useMenuCategories,
  useMenuItems,
  useMenuStats,
  useUpdateMenuItem,
} from "@/src/hooks/useMenu";

export default function MenuManagementPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const restaurantId = Array.isArray(params.restaurantId)
    ? params.restaurantId[0]
    : params.restaurantId;
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<
    boolean | undefined
  >(undefined);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Estados para diálogos
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [categoryDialogVisible, setCategoryDialogVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");

  const {
    data: menuItems = [],
    isLoading: itemsLoading,
    isError: itemsError,
    error: itemsErrorMessage,
    refetch: refetchItems,
    isRefetching: itemsRefetching,
  } = useMenuItems({
    category_id: categoryFilter === "all" ? undefined : categoryFilter,
    is_available: availabilityFilter,
    search: searchQuery,
    restaurant_id: restaurantId,
  });

  // 🎯 Query para obtener categorías
  const { data: categories = [], refetch: refetchCategories } =
    useMenuCategories(restaurantId);

  // 🎯 Query para estadísticas
  const { data: stats, isLoading: statsLoading } = useMenuStats(restaurantId);

  // 🔄 Mutation para actualizar item
  const updateItemMutation = useUpdateMenuItem();

  // 🔄 Mutation para eliminar item
  const deleteItemMutation = useDeleteMenuItem();

  // 🔄 Mutation para crear categoría
  const createCategoryMutation = useCreateCategory();

  // Filtros de disponibilidad
  const availabilityOptions = [
    { value: undefined, label: "Todos" },
    { value: true, label: "Disponibles" },
    { value: false, label: "No Disponibles" },
  ];

  // Alternar disponibilidad de item
  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await updateItemMutation.mutateAsync({
        itemId: item.id,
        updates: { available: !item.available },
      });

      setSnackbarMessage(
        `${item.name} ${!item.available ? "activado" : "desactivado"}`
      );
      setSnackbarVisible(true);
    } catch (error) {
      setSnackbarMessage("Error al actualizar el item");
      setSnackbarVisible(true);
    }
  };

  // Eliminar item
  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    try {
      await deleteItemMutation.mutateAsync(selectedItem.id);

      setSnackbarMessage(`${selectedItem.name} eliminado`);
      setSnackbarVisible(true);
      setDeleteDialogVisible(false);
      setSelectedItem(null);
    } catch (error) {
      setSnackbarMessage("Error al eliminar el item");
      setSnackbarVisible(true);
    }
  };

  // Crear nueva categoría
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      await createCategoryMutation.mutateAsync({
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || undefined,
        restaurant_id: restaurantId,
        position: categories.length,
      });

      setSnackbarMessage("Categoría creada exitosamente");
      setSnackbarVisible(true);
      setCategoryDialogVisible(false);
      setNewCategoryName("");
      setNewCategoryDescription("");
    } catch (error) {
      setSnackbarMessage("Error al crear la categoría");
      setSnackbarVisible(true);
    }
  };

  // Formatear precio
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  // Obtener nombre de categoría
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || "Sin categoría";
  };

  // Refrescar datos
  const onRefresh = () => {
    refetchItems();
    refetchCategories();
  };

  // Manejar errores
  if (itemsError) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="headlineSmall">Error al cargar el menú</Text>
        <Text variant="bodyMedium" style={styles.errorText}>
          {itemsErrorMessage?.message || "Ha ocurrido un error inesperado"}
        </Text>
        <Button mode="contained" onPress={() => refetchItems()}>
          Reintentar
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con estadísticas */}
      <View style={styles.header}>
        {statsLoading ? (
          <ActivityIndicator size="small" />
        ) : (
          stats && (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text variant="bodySmall">Total Items</Text>
                <Badge style={[styles.badge, { backgroundColor: "#2196f3" }]}>
                  {stats.totalItems}
                </Badge>
              </View>
              <View style={styles.statItem}>
                <Text variant="bodySmall">Disponibles</Text>
                <Badge style={[styles.badge, { backgroundColor: "#4caf50" }]}>
                  {stats.availableItems}
                </Badge>
              </View>
              <View style={styles.statItem}>
                <Text variant="bodySmall">Categorías</Text>
                <Badge style={[styles.badge, { backgroundColor: "#9c27b0" }]}>
                  {stats.totalCategories}
                </Badge>
              </View>
              <View style={styles.statItem}>
                <Text variant="bodySmall">Precio Prom.</Text>
                <Badge style={[styles.badge, { backgroundColor: "#ff9800" }]}>
                  {"$" + stats.averagePrice.toFixed(0)}
                </Badge>
              </View>
            </View>
          )
        )}
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar items del menú..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipContainer}>
            {/* Filtro por categoría */}
            <Chip
              selected={categoryFilter === "all"}
              onPress={() => setCategoryFilter("all")}
              style={styles.chip}
            >
              Todas las categorías
            </Chip>

            {categories.map((category) => (
              <Chip
                key={category.id}
                selected={categoryFilter === category.id}
                onPress={() => setCategoryFilter(category.id)}
                style={styles.chip}
              >
                {category.name}
              </Chip>
            ))}

            <Divider style={styles.verticalDivider} />

            {/* Filtro por disponibilidad */}
            {availabilityOptions.map((option) => (
              <Chip
                key={option.label}
                selected={availabilityFilter === option.value}
                onPress={() => setAvailabilityFilter(option.value)}
                style={styles.chip}
              >
                {option.label}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Lista de items */}
      {itemsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            Cargando menú...
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={itemsRefetching}
              onRefresh={onRefresh}
            />
          }
        >
          {menuItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text variant="bodyLarge" style={styles.emptyText}>
                {searchQuery
                  ? "No se encontraron items"
                  : "No hay items en el menú"}
              </Text>
              <Button
                mode="contained"
                onPress={() =>
                  router.push(
                    `/(admin)/menu/new?restaurantId=${restaurantId}` as any
                  )
                }
                style={styles.emptyButton}
              >
                Agregar primer item
              </Button>
            </View>
          ) : (
            menuItems.map((item) => (
              <Card key={item.id} style={styles.itemCard}>
                <Card.Content>
                  <View style={styles.itemHeader}>
                    <View style={styles.itemInfo}>
                      <View style={styles.itemTitleRow}>
                        <Text variant="titleMedium" style={styles.itemTitle}>
                          {item.name}
                        </Text>
                        <View style={styles.itemActions}>
                          <Switch
                            value={item.available}
                            onValueChange={() => handleToggleAvailability(item)}
                            disabled={updateItemMutation.isPending}
                          />
                          <Menu
                            visible={menuVisible === item.id}
                            onDismiss={() => setMenuVisible(null)}
                            anchor={
                              <IconButton
                                icon="dots-vertical"
                                size={20}
                                onPress={() => setMenuVisible(item.id)}
                              />
                            }
                          >
                            <Menu.Item
                              onPress={() => {
                                setMenuVisible(null);
                                router.push(`/(admin)/menu/${item.id}` as any);
                              }}
                              title="Editar"
                              leadingIcon="pencil"
                            />
                            <Menu.Item
                              onPress={() => {
                                setMenuVisible(null);
                                setSelectedItem(item);
                                setDeleteDialogVisible(true);
                              }}
                              title="Eliminar"
                              leadingIcon="delete"
                            />
                          </Menu>
                        </View>
                      </View>

                      {item.description && (
                        <Text
                          variant="bodyMedium"
                          style={styles.itemDescription}
                        >
                          {item.description}
                        </Text>
                      )}

                      <View style={styles.itemMeta}>
                        <Chip
                          style={styles.categoryChip}
                          textStyle={styles.categoryChipText}
                        >
                          {getCategoryName(item.category_id)}
                        </Chip>

                        <Chip
                          icon="sort-numeric-ascending"
                          style={styles.positionChip}
                          textStyle={styles.positionChipText}
                        >
                          Pos. {item.position}
                        </Chip>
                      </View>
                    </View>

                    <View style={styles.itemRight}>
                      {item.image_url ? (
                        <Avatar.Image
                          size={60}
                          source={{ uri: item.image_url }}
                        />
                      ) : (
                        <Avatar.Icon
                          size={60}
                          icon="food"
                          style={{ backgroundColor: "#f5f5f5" }}
                        />
                      )}

                      <Text variant="titleLarge" style={styles.itemPrice}>
                        {formatPrice(item.price)}
                      </Text>

                      <Chip
                        style={[
                          styles.statusChip,
                          {
                            backgroundColor: item.available
                              ? "#4caf50"
                              : "#f44336",
                          },
                        ]}
                        textStyle={{ color: "white", fontSize: 10 }}
                      >
                        {item.available ? "Disponible" : "No disponible"}
                      </Chip>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </ScrollView>
      )}

      {/* FABs */}
      <View style={styles.fabContainer}>
        <FAB
          icon="plus"
          style={[styles.fab, styles.fabSecondary]}
          size="small"
          onPress={() => setCategoryDialogVisible(true)}
          label="Categoría"
        />
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() =>
            router.push(`/(admin)/menu/new?restaurantId=${restaurantId}` as any)
          }
          label="Item"
        />
      </View>

      {/* Dialog para eliminar item */}
      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title>Eliminar Item</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              ¿Estás seguro de que quieres eliminar "{selectedItem?.name}"? Esta
              acción no se puede deshacer.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>
              Cancelar
            </Button>
            <Button
              onPress={handleDeleteItem}
              loading={deleteItemMutation.isPending}
            >
              Eliminar
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Dialog para crear categoría */}
        <Dialog
          visible={categoryDialogVisible}
          onDismiss={() => setCategoryDialogVisible(false)}
        >
          <Dialog.Title>Nueva Categoría</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nombre de la categoría"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              style={styles.dialogInput}
            />
            <TextInput
              label="Descripción (opcional)"
              value={newCategoryDescription}
              onChangeText={setNewCategoryDescription}
              multiline
              numberOfLines={3}
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCategoryDialogVisible(false)}>
              Cancelar
            </Button>
            <Button
              onPress={handleCreateCategory}
              loading={createCategoryMutation.isPending}
              disabled={!newCategoryName.trim()}
            >
              Crear
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Snackbar para notificaciones */}
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
  verticalDivider: {
    width: 1,
    height: 32,
    marginHorizontal: 8,
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
    marginBottom: 16,
  },
  emptyButton: {
    marginTop: 8,
  },
  itemCard: {
    marginBottom: 16,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  itemTitle: {
    fontWeight: "bold",
    flex: 1,
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemDescription: {
    opacity: 0.8,
    marginBottom: 12,
  },
  itemMeta: {
    flexDirection: "row",
    gap: 8,
  },
  categoryChip: {
    backgroundColor: "#e3f2fd",
  },
  categoryChipText: {
    color: "#1976d2",
    fontSize: 12,
  },
  positionChip: {
    backgroundColor: "#fff3e0",
  },
  positionChipText: {
    color: "#f57c00",
    fontSize: 12,
  },
  itemRight: {
    alignItems: "center",
    gap: 8,
  },
  itemPrice: {
    fontWeight: "bold",
    color: "#ff6347",
  },
  statusChip: {
    minWidth: 80,
  },
  fabContainer: {
    position: "absolute",
    bottom: 16,
    right: 16,
    gap: 8,
  },
  fab: {
    backgroundColor: "#ff6347",
  },
  fabSecondary: {
    backgroundColor: "#2196f3",
  },
  dialogInput: {
    marginBottom: 16,
  },
});
