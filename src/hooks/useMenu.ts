import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { supabase } from "../lib/supabase";
import { MenuCategory, MenuFilters, MenuItem } from "../types";

// 📊 Hook para obtener categorías
export const useMenuCategories = (restaurantId?: string) => {
  return useQuery({
    queryKey: ["menu-categories", restaurantId],
    queryFn: async (): Promise<MenuCategory[]> => {
      let query = supabase
        .from("categories")
        .select("*")
        .order("position", { ascending: true });

      if (restaurantId) {
        query = query.eq("restaurant_id", restaurantId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error fetching categories: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// 📊 Hook para obtener items del menú
export const useMenuItems = (filters: MenuFilters = {}) => {
  return useQuery({
    queryKey: ["menu-items", filters],
    queryFn: async (): Promise<MenuItem[]> => {
      let query = supabase
        .from("menu_items")
        .select(
          `
          *,
          category:categories(*)
        `
        )
        .order("position", { ascending: true });

      // Aplicar filtros
      if (filters.restaurant_id) {
        query = query.eq("restaurant_id", filters.restaurant_id);
      }

      if (filters.category_id) {
        query = query.eq("category_id", filters.category_id);
      }

      if (filters.is_available !== undefined) {
        query = query.eq("available", filters.is_available);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error fetching menu items: ${error.message}`);
      }

      // Filtrar por búsqueda en el cliente
      let filteredData = data || [];

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(
          (item) =>
            item.name.toLowerCase().includes(searchLower) ||
            item.description.toLowerCase().includes(searchLower)
        );
      }

      return filteredData;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// 📊 Hook para obtener un item específico
export const useMenuItem = (itemId: string) => {
  return useQuery({
    queryKey: ["menu-item", itemId],
    queryFn: async (): Promise<MenuItem> => {
      const { data, error } = await supabase
        .from("menu_items")
        .select(
          `
          *,
          category:categories(*)
        `
        )
        .eq("id", itemId)
        .single();

      if (error) {
        throw new Error(`Error fetching menu item: ${error.message}`);
      }

      return data;
    },
    enabled: !!itemId,
  });
};

// 📊 Hook para estadísticas del menú
export const useMenuStats = (restaurantId?: string) => {
  return useQuery({
    queryKey: ["menu-stats", restaurantId],
    queryFn: async () => {
      let itemsQuery = supabase.from("menu_items").select("available, price");
      let categoriesQuery = supabase.from("categories").select("active");

      if (restaurantId) {
        itemsQuery = itemsQuery.eq("restaurant_id", restaurantId);
        categoriesQuery = categoriesQuery.eq("restaurant_id", restaurantId);
      }

      const [itemsResult, categoriesResult] = await Promise.all([
        itemsQuery,
        categoriesQuery,
      ]);

      if (itemsResult.error) {
        throw new Error(
          `Error fetching items stats: ${itemsResult.error.message}`
        );
      }

      if (categoriesResult.error) {
        throw new Error(
          `Error fetching categories stats: ${categoriesResult.error.message}`
        );
      }

      const items = itemsResult.data || [];
      const categories = categoriesResult.data || [];

      return {
        totalItems: items.length,
        availableItems: items.filter((item) => item.available).length,
        unavailableItems: items.filter((item) => !item.available).length,
        totalCategories: categories.length,
        activeCategories: categories.filter((cat) => cat.active).length,
        averagePrice:
          items.length > 0
            ? items.reduce((sum, item) => sum + item.price, 0) / items.length
            : 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// 🔄 Hook para crear categoría
export const useCreateCategory = () => {

  return useMutation({
    mutationFn: async (categoryData: {
      name: string;
      description?: string;
      restaurant_id: string;
      position?: number;
    }) => {
      const { data, error } = await supabase
        .from("categories")
        .insert({
          ...categoryData,
          active: true,
          position: categoryData.position || 0,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating category: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-categories"] });
      queryClient.invalidateQueries({ queryKey: ["menu-stats"] });
    },
  });
};

// 🔄 Hook para actualizar categoría
export const useUpdateCategory = () => {

  return useMutation({
    mutationFn: async ({
      categoryId,
      updates,
    }: {
      categoryId: string;
      updates: Partial<MenuCategory>;
    }) => {
      const { data, error } = await supabase
        .from("categories")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", categoryId)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating category: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-categories"] });
      queryClient.invalidateQueries({ queryKey: ["menu-stats"] });
    },
  });
};

// 🔄 Hook para crear item del menú
export const useCreateMenuItem = () => {

  return useMutation({
    mutationFn: async (itemData: {
      name: string;
      description: string;
      price: number;
      category_id: string;
      restaurant_id: string;
      image_url?: string;
      preparation_time?: number;
      allergens?: string[];
      position?: number;
    }) => {
      const { data, error } = await supabase
        .from("menu_items")
        .insert({
          ...itemData,
          available: true,
          position: itemData.position || 0,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating menu item: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      queryClient.invalidateQueries({ queryKey: ["menu-stats"] });
    },
  });
};

// 🔄 Hook para actualizar item del menú
export const useUpdateMenuItem = () => {

  return useMutation({
    mutationFn: async ({
      itemId,
      updates,
    }: {
      itemId: string;
      updates: Partial<MenuItem>;
    }) => {
      const { data, error } = await supabase
        .from("menu_items")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", itemId)
        .select()
        .maybeSingle();

      if (error) {
        throw new Error(`Error updating menu item: ${error.message}`);
      }

      return data;
    },
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      queryClient.invalidateQueries({
        queryKey: ["menu-item", updatedItem.id],
      });
      queryClient.invalidateQueries({ queryKey: ["menu-stats"] });
    },
  });
};

// 🗑️ Hook para eliminar item del menú
export const useDeleteMenuItem = () => {

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", itemId);

      if (error) {
        throw new Error(`Error deleting menu item: ${error.message}`);
      }

      return itemId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      queryClient.invalidateQueries({ queryKey: ["menu-stats"] });
    },
  });
};

// 🗑️ Hook para eliminar categoría
export const useDeleteCategory = () => {

  return useMutation({
    mutationFn: async (categoryId: string) => {
      // Primero verificar si hay items en esta categoría
      const { data: items } = await supabase
        .from("menu_items")
        .select("id")
        .eq("category_id", categoryId);

      if (items && items.length > 0) {
        throw new Error(
          "No se puede eliminar una categoría que tiene items. Elimina los items primero."
        );
      }

      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);

      if (error) {
        throw new Error(`Error deleting category: ${error.message}`);
      }

      return categoryId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-categories"] });
      queryClient.invalidateQueries({ queryKey: ["menu-stats"] });
    },
  });
};
