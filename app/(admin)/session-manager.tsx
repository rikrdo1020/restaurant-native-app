import { queryClient } from "@/src/lib/queryClient";
import { supabase } from "@/src/lib/supabase";
import { ActiveSession } from "@/src/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import { ScrollView, View } from "react-native";
import { Button, Card, Chip, Text } from "react-native-paper";

export default function SessionsManager({
  restaurantId,
}: {
  restaurantId: string;
}) {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["active-sessions", restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_active_sessions", {
        p_restaurant_id: restaurantId,
      });
      if (error) throw error;
      return data as ActiveSession[];
    },
    refetchInterval: 30000,
  });

  const terminateSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase.rpc("terminate_user_session", {
        p_session_id: sessionId,
        p_terminated_by: "current-admin-user-id",
        p_reason: "admin_force",
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
    },
  });

  const formatTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Ahora";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  if (isLoading) return <Text>Cargando sesiones...</Text>;

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text variant="headlineSmall" style={{ marginBottom: 16 }}>
        Sesiones Activas ({sessions?.length || 0})
      </Text>

      {sessions?.map((session) => (
        <Card key={session.session_id} style={{ marginBottom: 12 }}>
          <Card.Content>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text variant="titleMedium">{session.user_name}</Text>
                <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                  {session.user_email}
                </Text>
                <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                  <Chip mode="outlined">{session.user_role}</Chip>
                  <Chip mode="outlined">{session.ip_address}</Chip>
                </View>
                <Text
                  variant="bodySmall"
                  style={{ marginTop: 4, opacity: 0.6 }}
                >
                  Última actividad: {formatTimeAgo(session.last_activity)}
                </Text>
                <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                  Dispositivo: {session.device_info?.platform || "Desconocido"}
                </Text>
              </View>

              <Button
                mode="outlined"
                onPress={() =>
                  terminateSessionMutation.mutate(session.session_id)
                }
                loading={terminateSessionMutation.isPending}
                textColor="#d32f2f"
                style={{ borderColor: "#d32f2f" }}
              >
                Cerrar Sesión
              </Button>
            </View>
          </Card.Content>
        </Card>
      ))}

      {sessions?.length === 0 && (
        <Text style={{ textAlign: "center", opacity: 0.7, marginTop: 32 }}>
          No hay sesiones activas
        </Text>
      )}
    </ScrollView>
  );
}
