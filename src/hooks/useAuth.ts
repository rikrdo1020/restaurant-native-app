import { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  useCreateUserProfile,
  useCreateUserSession,
  useTerminateUserSession,
  useUserProfile,
  useUserRestaurants,
  userKeys,
} from "../hooks/useUserQueries";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  userRestaurants: UserRestaurant[];
  loading: boolean;
  profileLoading: boolean;
  restaurantsLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (
    email: string,
    password: string,
    userData: SignUpData
  ) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
}

interface UserRestaurant {
  restaurant_id: string;
  restaurant_name: string;
  restaurant_slug: string;
  user_role: string;
  permissions: any;
}

interface AuthResult {
  success: boolean;
  error?: string;
  user?: User | null;
  message?: string;
}

interface SignUpData {
  firstName: string;
  lastName: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const useAuthProvider = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const queryClient = useQueryClient();

  // TanStack Query hooks
  const {
    data: userProfile,
    isLoading: profileLoading,
    error: profileError,
  } = useUserProfile(user?.id || null);

  const { data: userRestaurants = [], isLoading: restaurantsLoading } =
    useUserRestaurants(user?.id || null);

  const sessionCreatedRef = useRef<string | null>(null);
  const profileCreatedRef = useRef<string | null>(null);
  // Mutations
  const createUserProfileMutation = useCreateUserProfile();
  const createUserSessionMutation = useCreateUserSession();
  const terminateUserSessionMutation = useTerminateUserSession();

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const previousUserId = user?.id;
      setSession(session);
      setUser(session?.user ?? null);

      if (!session?.user) {
        // Limpiar cache y refs cuando el usuario se desloguea
        queryClient.clear();
        sessionCreatedRef.current = null;
        profileCreatedRef.current = null;
      } else if (session.user.id !== previousUserId) {
        // Si es un usuario diferente, resetear refs
        sessionCreatedRef.current = null;
        profileCreatedRef.current = null;
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  // Crear perfil automáticamente si no existe
  useEffect(() => {
    if (
      user &&
      profileError &&
      !profileLoading &&
      !createUserProfileMutation.isPending
    ) {
      // Si hay error y el usuario existe, intentar crear el perfil
      createUserProfileMutation.mutate({
        userId: user.id,
        email: user.email || "",
        firstName: user.user_metadata?.first_name || "",
        lastName: user.user_metadata?.last_name || "",
        phone: user.user_metadata?.phone,
      });
    }
  }, [user, profileError, profileLoading, createUserProfileMutation]);

  // Crear sesión cuando el usuario tenga restaurantes
  useEffect(() => {
    if (
      user &&
      userRestaurants.length > 0 &&
      !createUserSessionMutation.isPending &&
      sessionCreatedRef.current !== user.id
    ) {
      sessionCreatedRef.current = user.id;

      createUserSessionMutation.mutate({
        userId: user.id,
        restaurantId: userRestaurants[0].restaurant_id,
      });
    }
  }, [user?.id, userRestaurants.length]);

  const signIn = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, user: data.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: SignUpData
  ): Promise<AuthResult> => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Si el usuario necesita verificar email
      if (data.user && !data.session) {
        return {
          success: true,
          user: data.user,
          message: "Revisa tu email para verificar tu cuenta",
        };
      }

      return { success: true, user: data.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);

      // Terminar sesión en nuestra tabla personalizada
      if (user && userRestaurants.length > 0) {
        await terminateUserSessionMutation.mutateAsync({
          userId: user.id,
          restaurantId: userRestaurants[0].restaurant_id,
        });
      }

      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = async () => {
    if (user) {
      // Invalidar queries para refrescar datos
      await queryClient.invalidateQueries({
        queryKey: userKeys.profile(user.id),
      });
      await queryClient.invalidateQueries({
        queryKey: userKeys.restaurants(user.id),
      });
    }
  };

  return {
    session,
    user,
    userProfile: userProfile || null,
    userRestaurants,
    loading: loading || profileLoading || restaurantsLoading,
    profileLoading,
    restaurantsLoading,
    signIn,
    signUp,
    signOut,
    refreshUserData,
  };
};

export { AuthContext };
