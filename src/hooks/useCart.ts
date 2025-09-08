// src/hooks/useCart.ts - Versión sin middleware
import { create } from "zustand";
import { CartItem, CartStore, MenuItem } from "../types";

// 🔧 Store básico sin middleware
export const useCart = create<CartStore>((set, get) => ({
  items: [],
  restaurantId: null,

  addItem: (item: MenuItem, quantity = 1, notes = "") => {
    const { items, restaurantId } = get();

    if (restaurantId && restaurantId !== item.restaurant_id) {
      set({
        items: [
          {
            menu_item_id: item.id,
            name: item.name,
            price: item.price,
            quantity,
            notes,
          },
        ],
        restaurantId: item.restaurant_id,
      });
      return;
    }

    const existingItem = items.find(
      (i: CartItem) => i.menu_item_id === item.id
    );

    if (existingItem) {
      set({
        items: items.map((i: CartItem) =>
          i.menu_item_id === item.id
            ? { ...i, quantity: i.quantity + quantity, notes }
            : i
        ),
      });
    } else {
      set({
        items: [
          ...items,
          {
            menu_item_id: item.id,
            name: item.name,
            price: item.price,
            quantity,
            notes,
          },
        ],
        restaurantId: item.restaurant_id,
      });
    }
  },

  removeItem: (menuItemId: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.menu_item_id !== menuItemId),
    }));
  },

  updateQuantity: (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(menuItemId);
      return;
    }

    set((state) => ({
      items: state.items.map((item) =>
        item.menu_item_id === menuItemId ? { ...item, quantity } : item
      ),
    }));
  },

  updateNotes: (menuItemId: string, notes: string) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.menu_item_id === menuItemId ? { ...item, notes } : item
      ),
    }));
  },

  clearCart: () => {
    set({ items: [], restaurantId: null });
  },

  getTotal: () => {
    const { items } = get();
    return items.reduce(
      (total: number, item: CartItem) => total + item.price * item.quantity,
      0
    );
  },

  getItemCount: () => {
    const { items } = get();
    return items.reduce(
      (count: number, item: CartItem) => count + item.quantity,
      0
    );
  },

  setRestaurant: (restaurantId: string) => {
    set({ restaurantId });
  },

  getItemById: (menuItemId: string) => {
    const { items } = get();
    return items.find((item: CartItem) => item.menu_item_id === menuItemId);
  },

  hasItemsFromRestaurant: (restaurantId: string) => {
    const { restaurantId: cartRestaurantId, items } = get();
    return cartRestaurantId === restaurantId && items.length > 0;
  },
}));
