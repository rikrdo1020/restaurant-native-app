import { Link, useRouter } from "expo-router";
import { Formik } from "formik";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Divider,
  HelperText,
  Snackbar,
  Text,
  TextInput,
} from "react-native-paper";
import * as Yup from "yup";
import { useAuth } from "../../src/hooks/useAuth";

const loginSchema = Yup.object().shape({
  email: Yup.string().email("Email inválido").required("Email es requerido"),
  password: Yup.string()
    .min(6, "Mínimo 6 caracteres")
    .required("Contraseña es requerida"),
});

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: "",
  });

  const initialValues: LoginFormValues = {
    email: "",
    password: "",
  };

  const handleLogin = async (values: LoginFormValues) => {
    try {
      const result = await signIn(values.email, values.password);

      if (result.success) {
        router.replace("/");
      } else {
        setSnackbar({
          visible: true,
          message: result.error || "Error al iniciar sesión",
        });
      }
    } catch (error: any) {
      setSnackbar({
        visible: true,
        message: error.message || "Error inesperado",
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Bienvenido
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Inicia sesión en tu cuenta
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Formik
              initialValues={initialValues}
              validationSchema={loginSchema}
              onSubmit={handleLogin}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                isSubmitting,
              }) => (
                <View style={styles.form}>
                  <TextInput
                    label="Email"
                    value={values.email}
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    error={touched.email && !!errors.email}
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                  <HelperText
                    type="error"
                    visible={touched.email && !!errors.email}
                  >
                    {errors.email}
                  </HelperText>

                  <TextInput
                    label="Contraseña"
                    value={values.password}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                    error={touched.password && !!errors.password}
                    style={styles.input}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="current-password"
                    right={
                      <TextInput.Icon
                        icon={showPassword ? "eye-off" : "eye"}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                  />
                  <HelperText
                    type="error"
                    visible={touched.password && !!errors.password}
                  >
                    {errors.password}
                  </HelperText>

                  <Button
                    mode="contained"
                    onPress={() => handleSubmit()}
                    disabled={isSubmitting}
                    style={styles.loginButton}
                    contentStyle={styles.buttonContent}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      "Iniciar Sesión"
                    )}
                  </Button>
                </View>
              )}
            </Formik>
          </Card.Content>
        </Card>

        <Divider style={styles.divider} />

        <View style={styles.registerLink}>
          <Text variant="bodyMedium">¿No tienes cuenta? </Text>
          <Link href={"/auth/register" as any} asChild>
            <Text variant="bodyMedium" style={styles.linkText}>
              Crear Cuenta
            </Text>
          </Link>
        </View>
      </View>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={4000}
        style={styles.snackbar}
      >
        {snackbar.message}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.7,
  },
  card: {
    elevation: 4,
    borderRadius: 12,
  },
  form: {
    gap: 8,
  },
  input: {
    backgroundColor: "transparent",
  },
  loginButton: {
    marginTop: 16,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 24,
  },
  registerLink: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  linkText: {
    color: "#6200ee",
    fontWeight: "bold",
  },
  snackbar: {
    marginBottom: 16,
    backgroundColor: "#f44336",
  },
});
