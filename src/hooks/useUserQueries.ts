import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { supabase } from "../lib/supabase";
import { UserProfile, UserRestaurant } from "../types";

// Query Keys
export const userKeys = {
  all: ["user"] as const,
  profile: (userId: string) => [...userKeys.all, "profile", userId] as const,
  restaurants: (userId: string) =>
    [...userKeys.all, "restaurants", userId] as const,
};

// Hook para obtener perfil del usuario
export const useUserProfile = (userId: string | null) => {
  return useQuery({
    queryKey: userKeys.profile(userId || ""),
    queryFn: async (): Promise<UserProfile | null> => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para obtener restaurantes del usuario
export const useUserRestaurants = (userId: string | null) => {
  return useQuery({
    queryKey: userKeys.restaurants(userId || ""),
    queryFn: async (): Promise<UserRestaurant[]> => {
      if (!userId) return [];

      const { data, error } = await supabase.rpc("get_user_restaurants", {
        p_user_id: userId,
      });

      if (error) {
        throw error;
      }

      return data || [];
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Mutation para crear perfil de usuario
export const useCreateUserProfile = () => {

  return useMutation({
    mutationFn: async (params: {
      userId: string;
      email: string;
      firstName: string;
      lastName: string;
      phone?: string;
    }) => {
      const { data, error } = await supabase
        .from("users")
        .insert({
          id: params.userId,
          email: params.email,
          first_name: params.firstName,
          last_name: params.lastName,
          phone: params.phone,
          email_verified: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidar y actualizar cache
      queryClient.setQueryData(userKeys.profile(variables.userId), data);
      queryClient.invalidateQueries({
        queryKey: userKeys.profile(variables.userId),
      });
    },
  });
};

// Mutation para actualizar perfil
export const useUpdateUserProfile = () => {

  return useMutation({
    mutationFn: async (params: {
      userId: string;
      updates: Partial<UserProfile>;
    }) => {
      const { data, error } = await supabase
        .from("users")
        .update({
          ...params.updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(userKeys.profile(variables.userId), data);
    },
  });
};

// Hook para crear sesión de usuario
export const useCreateUserSession = () => {
  return useMutation({
    mutationFn: async (params: { userId: string; restaurantId: string }) => {
      const sessionToken = `${params.userId}_${Date.now()}_${Math.random()}`;

      const { error } = await supabase.rpc("create_user_session", {
        p_user_id: params.userId,
        p_restaurant_id: params.restaurantId,
        p_session_token: sessionToken,
        p_device_info: {
          platform: "web",
          timestamp: new Date().toISOString(),
        },
      });

      if (error) throw error;
      return { sessionToken };
    },
  });
};

// Hook para terminar sesión de usuario
export const useTerminateUserSession = () => {
  return useMutation({
    mutationFn: async (params: { userId: string; restaurantId: string }) => {
      const { error } = await supabase
        .from("user_sessions")
        .update({
          is_active: false,
          terminated_at: new Date().toISOString(),
          termination_reason: "logout",
        })
        .eq("user_id", params.userId)
        .eq("restaurant_id", params.restaurantId)
        .eq("is_active", true);

      if (error) throw error;
    },
  });
};
