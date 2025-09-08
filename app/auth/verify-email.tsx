import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";

export default function VerifyEmailScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>
            Verifica tu Email
          </Text>

          <Text variant="bodyMedium" style={styles.message}>
            Te hemos enviado un enlace de verificación a tu correo electrónico.
            Por favor, revisa tu bandeja de entrada y haz clic en el enlace para
            activar tu cuenta.
          </Text>

          <Text variant="bodySmall" style={styles.note}>
            Si no ves el email, revisa tu carpeta de spam.
          </Text>

          <Button
            mode="outlined"
            onPress={() => router.replace("/auth/login" as any)}
            style={styles.button}
          >
            Volver al Login
          </Button>
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
    padding: 24,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  message: {
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 22,
  },
  note: {
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 24,
  },
  button: {
    borderRadius: 8,
  },
});
