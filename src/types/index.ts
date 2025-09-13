import { Session, User } from "@supabase/supabase-js";

export interface ActiveSession {
  session_id: string;
  user_name: string;
  user_email: string;
  user_role: string;
  device_info: any;
  ip_address: string;
  last_activity: string;
  created_at: string;
  expires_at: string;
}

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  userRestaurants: UserRestaurant[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (
    email: string,
    password: string,
    userData: SignUpData
  ) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
}

export interface UserRestaurant {
  restaurant_id: string;
  restaurant_name: string;
  restaurant_slug: string;
  user_role: string;
  permissions: any;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: User | null;
}

export interface SignUpData {
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  phone?: string;
  active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  position: number;
  active: boolean;
  items?: MenuItem[];
}

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

export interface CartItem {
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export type CreateOrderPayload = {
  p_restaurant_id: string;
  p_guest_name?: string | null;
  p_items: any;
  p_notes?: string | null;
};

export type CreateOrderResponse = {
  order_id: string;
  code?: string | null;
  total?: number | null;
  skipped_items?: any[] | null;
};

export interface CreateOrderRequest {
  restaurant_id: string;
  guest_name: string;
  items: CartItem[];
  table_number?: string;
  notes?: string;
}

export interface Order {
  id: string;
  code: string;
  restaurant_id: string;
  guest_name: string;
  table_number?: string;
  total_amount: number;
  status:
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";
  notes?: string;
  created_at: string;
}

export interface CartStore {
  items: CartItem[];
  restaurantId: string | null;
  addItem: (item: MenuItem, quantity?: number, notes?: string) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  updateNotes: (menuItemId: string, notes: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  setRestaurant: (restaurantId: string) => void;
  getItemById: (menuItemId: string) => CartItem | undefined;
  hasItemsFromRestaurant: (restaurantId: string) => boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  restaurant_id: string;
}

export interface MenuFilters {
  category_id?: string;
  is_available?: boolean;
  search?: string;
  restaurant_id?: string;
}
