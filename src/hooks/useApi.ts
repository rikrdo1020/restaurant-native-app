import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { supabase } from "../lib/supabase";
import { Category, CreateOrderRequest } from "../types";

// Hook para obtener restaurante por slug
export function useRestaurant(slug?: string) {
  return useQuery({
    queryKey: ['restaurant', slug],
    queryFn: async () => {
      console.log('[useRestaurant] queryFn start slug=', slug);
      if (!slug) throw new Error('slug missing');
      const res = await supabase
        .from('restaurants')
        .select('id, name, description, slug')
        .eq('slug', slug)
        .eq('active', true)
        .single();
      if (res.error) throw res.error;
      return res.data;
    },
  });
}

// Hook para obtener menú completo usando función RPC
export function useMenu(restaurantId: string) {
  return useQuery({
    queryKey: ["menu", restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_menu_by_restaurant", {
        p_restaurant_id: restaurantId,
      });

      if (error) throw error;

      // Agrupar por categorías
      const grouped = data.reduce((acc: any, item: any) => {
        if (!item.category_id) return acc;

        if (!acc[item.category_id]) {
          acc[item.category_id] = {
            id: item.category_id,
            name: item.category_name,
            position: item.category_position,
            items: [],
          };
        }

        if (item.item_id) {
          acc[item.category_id].items.push({
            id: item.item_id,
            restaurant_id: item.restaurant_id,
            category_id: item.category_id,
            name: item.item_name,
            description: item.item_description,
            price: item.item_price,
            image_url: item.item_image,
            position: item.item_position,
            available: true,
          });
        }

        return acc;
      }, {});

      return Object.values(grouped) as Category[];
    },
    enabled: !!restaurantId,
  });
}

// Hook para crear pedido
export function useCreateOrder() {

  return useMutation({
    mutationFn: async (orderData: CreateOrderRequest) => {
      const { data, error } = await supabase.rpc("create_order", {
        p_restaurant_id: orderData.restaurant_id,
        p_guest_name: orderData.guest_name,
        p_items: orderData.items,
        p_table_number: orderData.table_number || null,
        p_notes: orderData.notes || null,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

// Hook para obtener pedido por código
export function useOrderByCode(code: string) {
  return useQuery({
    queryKey: ["order", code],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders_with_details")
        .select("*")
        .eq("code", code)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!code,
  });
}
