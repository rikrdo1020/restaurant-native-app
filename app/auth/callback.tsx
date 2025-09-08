import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Card, Text } from "react-native-paper";
import { supabase } from "../../src/lib/supabase";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Verificando...");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Obtener los parámetros de la URL
        const { access_token, refresh_token, type } = params;

        if (type === "signup" && access_token && refresh_token) {
          // Establecer la sesión con los tokens
          const { error } = await supabase.auth.setSession({
            access_token: access_token as string,
            refresh_token: refresh_token as string,
          });

          if (error) {
            throw error;
          }

          setStatus("success");
          setMessage("¡Email verificado exitosamente!");

          // Redirigir al home después de un momento
          setTimeout(() => {
            router.replace("/");
          }, 2000);
        } else {
          throw new Error("Parámetros de verificación inválidos");
        }
      } catch (error: any) {
        console.error("Error en callback de auth:", error);
        setStatus("error");
        setMessage(error.message || "Error al verificar el email");

        // Redirigir al login después de un momento
        setTimeout(() => {
          router.replace("/auth/login" as any);
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [params, router]);

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          {status === "loading" && (
            <>
              <ActivityIndicator size="large" style={styles.loader} />
              <Text variant="headlineSmall" style={styles.title}>
                Verificando Email
              </Text>
            </>
          )}

          {status === "success" && (
            <Text
              variant="headlineSmall"
              style={[styles.title, styles.success]}
            >
              ✅ Verificación Exitosa
            </Text>
          )}

          {status === "error" && (
            <Text variant="headlineSmall" style={[styles.title, styles.error]}>
              ❌ Error de Verificación
            </Text>
          )}

          <Text variant="bodyMedium" style={styles.message}>
            {message}
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
    justifyContent: "center",
  },
  card: {
    elevation: 4,
    borderRadius: 12,
  },
  content: {
    alignItems: "center",
    padding: 32,
  },
  loader: {
    marginBottom: 16,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  success: {
    color: "#4caf50",
  },
  error: {
    color: "#f44336",
  },
  message: {
    textAlign: "center",
    lineHeight: 22,
  },
});
