// app/restaurant/[restaurantId]/menu/add-item.tsx
import { ModalSelector } from "@/src/components/ModalSelector";
import { useCreateMenuItem, useMenuCategories } from "@/src/hooks/useMenu";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Formik } from "formik";
import React from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, HelperText, Text, TextInput } from "react-native-paper";
import * as Yup from "yup";

const AddMenuItemScreen = () => {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const router = useRouter();
  const { mutate, isPending } = useCreateMenuItem();
  const { data: categories, isLoading } = useMenuCategories();
  const categoryOptions =
    categories?.map((cat) => ({
      id: cat.id,
      label: cat.name,
    })) || [];
  // Validación con Yup
  const validationSchema = Yup.object().shape({
    name: Yup.string().required("El nombre es obligatorio"),
    description: Yup.string(),
    price: Yup.number()
      .required("El precio es obligatorio")
      .positive("Debe ser un número positivo"),
    category_id: Yup.string().required("Selecciona una categoría"),
    position: Yup.number().nullable(),
    image_url: Yup.string().url("URL inválida").nullable(),
    allergens: Yup.array().of(Yup.string()),
  });

  const initialValues = {
    name: "",
    description: "",
    price: "",
    category_id: "",
    restaurant_id: restaurantId,
    position: 0,
    image_url: "",
    allergens: [],
  };

  const handleSubmit = (values: typeof initialValues) => {
    const payload = {
      name: values.name,
      description: values.description || "",
      price: Number(values.price),
      category_id: values.category_id,
      restaurant_id: values.restaurant_id,
      position: values.position ? Number(values.position) : undefined,
      image_url: values.image_url?.trim() ? values.image_url.trim() : undefined,
      allergens:
        values.allergens && values.allergens.length
          ? values.allergens
          : undefined,
      available: true, // si lo necesitas explícito
    };

    mutate(payload, {
      onSuccess: () => {
        Alert.alert("Éxito", "Producto agregado correctamente");
        router.back();
      },
      onError: (error) => {
        Alert.alert("Error", error.message);
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text>Agregar Producto</Text>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              setFieldValue,
              values,
              errors,
              touched,
            }) => (
              <View>
                <TextInput
                  label="Nombre *"
                  value={values.name}
                  onChangeText={handleChange("name")}
                  onBlur={handleBlur("name")}
                  error={touched.name && !!errors.name}
                />
                {touched.name && errors.name && (
                  <HelperText type="error">{errors.name}</HelperText>
                )}

                <TextInput
                  label="Descripción"
                  value={values.description}
                  onChangeText={handleChange("description")}
                  onBlur={handleBlur("description")}
                  multiline
                  numberOfLines={3}
                />

                <TextInput
                  label="Precio *"
                  value={values.price}
                  onChangeText={handleChange("price")}
                  onBlur={handleBlur("price")}
                  keyboardType="numeric"
                  error={touched.price && !!errors.price}
                />
                {touched.price && errors.price && (
                  <HelperText type="error">{errors.price}</HelperText>
                )}

                <ModalSelector
                  label="Categoría"
                  placeholder="Seleccionar categoría"
                  options={categoryOptions}
                  loading={isLoading}
                  value={values.category_id}
                  onValueChange={(val) => setFieldValue("category_id", val)}
                  error={touched.category_id ? errors.category_id : undefined}
                />

                <TextInput
                  label="Posición"
                  value={values.position.toString()}
                  onChangeText={handleChange("position")}
                  onBlur={handleBlur("position")}
                  keyboardType="numeric"
                />

                <TextInput
                  label="URL de imagen"
                  value={values.image_url}
                  onChangeText={handleChange("image_url")}
                  onBlur={handleBlur("image_url")}
                />

                <Button
                  mode="contained"
                  onPress={handleSubmit as any}
                  loading={isPending}
                  disabled={isPending}
                  style={styles.button}
                >
                  Guardar Producto
                </Button>
              </View>
            )}
          </Formik>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

export default AddMenuItemScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  card: {
    padding: 16,
  },
  button: {
    marginTop: 16,
  },
});
