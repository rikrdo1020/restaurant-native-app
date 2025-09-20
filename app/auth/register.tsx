import { Link, useRouter } from "expo-router";
import { Formik } from "formik";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
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

// Esquema de validación
const registerSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, "Muy corto")
    .max(50, "Muy largo")
    .required("Nombre es requerido"),
  lastName: Yup.string()
    .min(2, "Muy corto")
    .max(50, "Muy largo")
    .required("Apellido es requerido"),
  email: Yup.string().email("Email inválido").required("Email es requerido"),
  phone: Yup.string()
    .matches(/^[+]?[\d\s\-\(\)]+$/, "Teléfono inválido")
    .min(8, "Teléfono muy corto"),
  password: Yup.string()
    .min(8, "Mínimo 8 caracteres")
    .matches(/[a-z]/, "Debe contener al menos una minúscula")
    .matches(/[A-Z]/, "Debe contener al menos una mayúscula")
    .matches(/\d/, "Debe contener al menos un número")
    .required("Contraseña es requerida"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Las contraseñas no coinciden")
    .required("Confirmar contraseña es requerido"),
});

interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: "",
    type: "error" as "error" | "success",
  });

  const initialValues: RegisterFormValues = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  };

  const handleRegister = async (values: RegisterFormValues) => {
    try {
      const result = await signUp(values.email, values.password, {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone || undefined,
      });

      if (result.success) {
        const message = result.message || "Registro exitoso!";

        setSnackbar({
          visible: true,
          message,
          type: "success",
        });

        // Si hay un mensaje específico (verificación de email), redirigir a pantalla especial
        if (result.message) {
          setTimeout(() => {
            router.replace("/auth/verify-email" as any);
          }, 2000);
        } else {
          // Si no necesita verificación, ir directo al home o login
          setTimeout(() => {
            router.replace("/");
          }, 2000);
        }
      } else {
        setSnackbar({
          visible: true,
          message: result.error || "Error al registrarse",
          type: "error",
        });
      }
    } catch (error: any) {
      setSnackbar({
        visible: true,
        message: error.message || "Error inesperado",
        type: "error",
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Crear Cuenta
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Completa tus datos para registrarte
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Formik
              initialValues={initialValues}
              validationSchema={registerSchema}
              onSubmit={handleRegister}
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
                    label="Nombre *"
                    value={values.firstName}
                    onChangeText={handleChange("firstName")}
                    onBlur={handleBlur("firstName")}
                    error={touched.firstName && !!errors.firstName}
                    style={styles.input}
                    autoCapitalize="words"
                    autoComplete="given-name"
                  />
                  <HelperText
                    type="error"
                    visible={touched.firstName && !!errors.firstName}
                  >
                    {errors.firstName}
                  </HelperText>

                  <TextInput
                    label="Apellido *"
                    value={values.lastName}
                    onChangeText={handleChange("lastName")}
                    onBlur={handleBlur("lastName")}
                    error={touched.lastName && !!errors.lastName}
                    style={styles.input}
                    autoCapitalize="words"
                    autoComplete="family-name"
                  />
                  <HelperText
                    type="error"
                    visible={touched.lastName && !!errors.lastName}
                  >
                    {errors.lastName}
                  </HelperText>

                  <TextInput
                    label="Email *"
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
                    label="Teléfono"
                    value={values.phone}
                    onChangeText={handleChange("phone")}
                    onBlur={handleBlur("phone")}
                    error={touched.phone && !!errors.phone}
                    style={styles.input}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    placeholder="+507 1234-5678"
                  />
                  <HelperText
                    type="error"
                    visible={touched.phone && !!errors.phone}
                  >
                    {errors.phone}
                  </HelperText>

                  <TextInput
                    label="Contraseña *"
                    value={values.password}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                    error={touched.password && !!errors.password}
                    style={styles.input}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="new-password"
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

                  <TextInput
                    label="Confirmar Contraseña *"
                    value={values.confirmPassword}
                    onChangeText={handleChange("confirmPassword")}
                    onBlur={handleBlur("confirmPassword")}
                    error={touched.confirmPassword && !!errors.confirmPassword}
                    style={styles.input}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    right={
                      <TextInput.Icon
                        icon={showConfirmPassword ? "eye-off" : "eye"}
                        onPress={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      />
                    }
                  />
                  <HelperText
                    type="error"
                    visible={
                      touched.confirmPassword && !!errors.confirmPassword
                    }
                  >
                    {errors.confirmPassword}
                  </HelperText>

                  <View style={styles.passwordInfo}>
                    <Text variant="bodySmall" style={styles.passwordInfoText}>
                      La contraseña debe contener:
                    </Text>
                    <Text variant="bodySmall" style={styles.passwordInfoText}>
                      • Mínimo 8 caracteres
                    </Text>
                    <Text variant="bodySmall" style={styles.passwordInfoText}>
                      • Al menos una mayúscula y una minúscula
                    </Text>
                    <Text variant="bodySmall" style={styles.passwordInfoText}>
                      • Al menos un número
                    </Text>
                  </View>

                  <Button
                    mode="contained"
                    onPress={() => handleSubmit()}
                    disabled={isSubmitting}
                    style={styles.registerButton}
                    contentStyle={styles.buttonContent}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      "Crear Cuenta"
                    )}
                  </Button>
                </View>
              )}
            </Formik>
          </Card.Content>
        </Card>

        <Divider style={styles.divider} />

        <View style={styles.loginLink}>
          <Text variant="bodyMedium">¿Ya tienes cuenta? </Text>
          <Link href={"/auth/login" as any} asChild>
            <Text variant="bodyMedium" style={styles.linkText}>
              Iniciar Sesión
            </Text>
          </Link>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={4000}
        style={[
          styles.snackbar,
          snackbar.type === "success"
            ? styles.successSnackbar
            : styles.errorSnackbar,
        ]}
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
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
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
  passwordInfo: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  passwordInfoText: {
    opacity: 0.7,
    lineHeight: 18,
  },
  registerButton: {
    marginTop: 16,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 24,
  },
  loginLink: {
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
  },
  successSnackbar: {
    backgroundColor: "#4caf50",
  },
  errorSnackbar: {
    backgroundColor: "#f44336",
  },
});
