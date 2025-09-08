import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export interface OrderItem {
  id: string;
  menu_item_id: string;
  quantity: number;
  price: number;
  menu_items: {
    name: string;
    description: string;
    image_url?: string;
  };
}

export interface Order {
  id: string;
  table_number: number;
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  total_amount: number;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  notes?: string;
  order_items: OrderItem[];
}

export interface OrdersFilters {
  status?: string;
  search?: string;
  table_number?: number;
  date_from?: string;
  date_to?: string;
}

// 📊 Hook para obtener todas las órdenes
export const useOrders = (filters: OrdersFilters = {}) => {
  return useQuery({
    queryKey: ["orders", filters],
    queryFn: async (): Promise<Order[]> => {
      let query = supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            *,
            menu_items (
              name,
              description,
              image_url
            )
          )
        `
        )
        .order("created_at", { ascending: false });

      // Aplicar filtros
      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters.table_number) {
        query = query.eq("table_number", filters.table_number);
      }

      if (filters.date_from) {
        query = query.gte("created_at", filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte("created_at", filters.date_to);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error fetching orders: ${error.message}`);
      }

      // Filtrar por búsqueda en el cliente (más eficiente)
      let filteredData = data || [];

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(
          (order) =>
            order.table_number.toString().includes(searchLower) ||
            order.customer_name?.toLowerCase().includes(searchLower) ||
            order.id.toLowerCase().includes(searchLower)
        );
      }

      return filteredData;
    },
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 60 * 1000, // Refetch cada minuto para órdenes en tiempo real
  });
};

// 📊 Hook para obtener una orden específica
export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async (): Promise<Order> => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            *,
            menu_items (
              name,
              description,
              image_url,
              price
            )
          )
        `
        )
        .eq("id", orderId)
        .single();

      if (error) {
        throw new Error(`Error fetching order: ${error.message}`);
      }

      return data;
    },
    enabled: !!orderId,
  });
};

// 📊 Hook para estadísticas de órdenes
export const useOrdersStats = () => {
  return useQuery({
    queryKey: ["orders-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("status, total_amount, created_at");

      if (error) {
        throw new Error(`Error fetching orders stats: ${error.message}`);
      }

      const today = new Date().toISOString().split("T")[0];
      const todayOrders =
        data?.filter((order) => order.created_at.startsWith(today)) || [];

      return {
        total: data?.length || 0,
        pending: data?.filter((o) => o.status === "pending").length || 0,
        preparing: data?.filter((o) => o.status === "preparing").length || 0,
        ready: data?.filter((o) => o.status === "ready").length || 0,
        delivered: data?.filter((o) => o.status === "delivered").length || 0,
        cancelled: data?.filter((o) => o.status === "cancelled").length || 0,
        todayTotal: todayOrders.length,
        todayRevenue: todayOrders.reduce(
          (sum, order) => sum + order.total_amount,
          0
        ),
      };
    },
    staleTime: 60 * 1000, // 1 minuto
  });
};

// 🔄 Hook para actualizar estado de orden
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: Order["status"];
    }) => {
      const { data, error } = await supabase
        .from("orders")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating order status: ${error.message}`);
      }

      return data;
    },
    onSuccess: (updatedOrder) => {
      // Invalidar y actualizar caché
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders-stats"] });
      queryClient.invalidateQueries({ queryKey: ["order", updatedOrder.id] });

      // Actualización optimista
      queryClient.setQueryData(["order", updatedOrder.id], updatedOrder);
    },
    onError: (error) => {
      console.error("Error updating order status:", error);
    },
  });
};

// 🗑️ Hook para cancelar orden
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      reason,
    }: {
      orderId: string;
      reason?: string;
    }) => {
      const { data, error } = await supabase
        .from("orders")
        .update({
          status: "cancelled",
          notes: reason ? `Cancelado: ${reason}` : "Cancelado",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) {
        throw new Error(`Error cancelling order: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders-stats"] });
    },
  });
};

// 📝 Hook para crear nueva orden
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: {
      table_number: number;
      customer_name?: string;
      notes?: string;
      items: Array<{
        menu_item_id: string;
        quantity: number;
        price: number;
      }>;
    }) => {
      // Calcular total
      const total_amount = orderData.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Crear orden
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          table_number: orderData.table_number,
          customer_name: orderData.customer_name,
          notes: orderData.notes,
          total_amount,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) {
        throw new Error(`Error creating order: ${orderError.message}`);
      }

      // Crear items de la orden
      const orderItems = orderData.items.map((item) => ({
        ...item,
        order_id: order.id,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        throw new Error(`Error creating order items: ${itemsError.message}`);
      }

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders-stats"] });
    },
  });
};
