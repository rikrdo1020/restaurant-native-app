import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";

export default function LandingPage() {
  const router = useRouter();

  const handleRegister = () => {
    try {
      router.push("/auth/register");
    } catch (error) {
      console.error("🔥 Error en navegación:", error);
    }
  };

  const handleDemo = () => {
    try {
      router.push("/restaurant/606b4a75-42c5-4f1c-8620-66adf9ec8c35");
    } catch (error) {
      console.error("🔥 Error en navegación:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text variant="displayMedium" style={styles.heroTitle}>
          RestaurantApp
        </Text>
        <Text variant="headlineSmall" style={styles.heroSubtitle}>
          Digitaliza tu restaurante en minutos
        </Text>
        <Text variant="bodyLarge" style={styles.heroDescription}>
          Crea menús digitales, recibe pedidos sin contacto y mejora la
          experiencia de tus clientes con códigos QR.
        </Text>

        <View style={styles.heroButtons}>
          <Button
            mode="contained"
            onPress={handleRegister}
            style={styles.primaryButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Comenzar Gratis
          </Button>
        </View>
      </View>

      {/* Features Section */}
      <View style={styles.section}>
        <Text variant="headlineMedium" style={styles.sectionTitle}>
          ¿Por qué elegir RestaurantApp?
        </Text>

        <View style={styles.featuresGrid}>
          <Card style={styles.featureCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.featureTitle}>
                📱 Menús Digitales
              </Text>
              <Text variant="bodyMedium">
                Crea menús interactivos que tus clientes pueden ver desde su
                teléfono
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.featureCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.featureTitle}>
                🔄 Sin Contacto
              </Text>
              <Text variant="bodyMedium">
                Los clientes ordenan directamente desde la mesa con códigos QR
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.featureCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.featureTitle}>
                📊 Analytics
              </Text>
              <Text variant="bodyMedium">
                Obtén insights sobre tus ventas y productos más populares
              </Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* Pricing Preview */}
      <View style={styles.section}>
        <Text variant="headlineMedium" style={styles.sectionTitle}>
          Planes Simples y Transparentes
        </Text>

        <View style={styles.pricingPreview}>
          <Card style={styles.pricingCard}>
            <Card.Content>
              <Text variant="titleLarge">Básico</Text>
              <Text variant="headlineSmall" style={styles.price}>
                $29/mes
              </Text>
              <Text variant="bodyMedium">
                • Menú digital ilimitado{"\n"}• Códigos QR{"\n"}• Soporte básico
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.pricingCard, styles.popularCard]}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.popularText}>
                Pro ⭐
              </Text>
              <Text variant="headlineSmall" style={styles.price}>
                $59/mes
              </Text>
              <Text variant="bodyMedium">
                • Todo lo del Básico{"\n"}• Analytics avanzados{"\n"}• Múltiples
                ubicaciones{"\n"}• Soporte prioritario
              </Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Text variant="headlineMedium" style={styles.ctaTitle}>
          ¿Listo para digitalizar tu restaurante?
        </Text>
        <Text variant="bodyLarge" style={styles.ctaDescription}>
          Únete a cientos de restaurantes que ya confían en nosotros
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.customButton,
            styles.ctaButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleRegister}
          accessibilityRole="button"
          accessibilityLabel="Comenzar Ahora - Es Gratis"
        >
          <Text style={styles.ctaButtonText}>Comenzar Ahora - Es Gratis</Text>
        </Pressable>
      </View>

      {/* Demo Link */}
      <View style={styles.demoSection}>
        <Text variant="bodyMedium" style={styles.demoText}>
          ¿Quieres ver cómo funciona?
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.textButton,
            pressed && styles.textButtonPressed,
          ]}
          onPress={handleDemo}
          accessibilityRole="button"
          accessibilityLabel="Ver Demo del Restaurante"
        >
          <Text style={styles.textButtonText}>Ver Demo del Restaurante</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  hero: {
    padding: 40,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  heroTitle: {
    fontWeight: "bold",
    color: "#ff6347",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  heroDescription: {
    textAlign: "center",
    opacity: 0.8,
    marginBottom: 32,
    maxWidth: 600,
  },
  heroButtons: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
    justifyContent: "center",
  },

  // ✅ Estilos para botones personalizados
  customButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 140,
    minHeight: 48,
  },
  actionButton: {
    backgroundColor: "#ff6347",
    flex: 1,
    minWidth: 150,
  },
  primaryButton: {
    backgroundColor: "#ff6347",
  },

  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#ff6347",
  },

  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  secondaryButtonText: {
    color: "#ff6347",
    fontSize: 16,
    fontWeight: "600",
  },

  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  section: {
    padding: 40,
    alignItems: "center",
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "center",
    maxWidth: 800,
  },
  featureCard: {
    width: 250,
    minHeight: 150,
    elevation: 2,
  },
  featureTitle: {
    marginBottom: 8,
    fontWeight: "600",
  },
  pricingPreview: {
    flexDirection: "row",
    gap: 20,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  pricingCard: {
    width: 250,
    minHeight: 200,
    elevation: 2,
  },
  popularCard: {
    borderColor: "#ff6347",
    borderWidth: 2,
  },
  popularText: {
    color: "#ff6347",
    fontWeight: "bold",
  },
  price: {
    color: "#ff6347",
    fontWeight: "bold",
    marginVertical: 8,
  },
  ctaSection: {
    padding: 40,
    backgroundColor: "#ff6347",
    alignItems: "center",
  },
  ctaTitle: {
    color: "white",
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  ctaDescription: {
    color: "white",
    opacity: 0.9,
    marginBottom: 24,
    textAlign: "center",
  },
  ctaButton: {
    backgroundColor: "white",
  },
  ctaButtonText: {
    color: "#ff6347",
    fontSize: 16,
    fontWeight: "600",
  },
  demoSection: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  demoText: {
    marginBottom: 8,
    opacity: 0.7,
  },
  textButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  textButtonPressed: {
    opacity: 0.7,
  },
  textButtonText: {
    color: "#ff6347",
    fontSize: 16,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  buttonContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
});
