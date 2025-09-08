// components/ModalSelector.tsx
import React, { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  HelperText,
  List,
  Modal,
  Portal,
  Text,
} from "react-native-paper";

type Option = {
  id: string;
  label: string;
};

type ModalSelectorProps = {
  label: string;
  placeholder?: string;
  options?: Option[];
  loading?: boolean;
  value?: string;
  onValueChange: (value: string) => void;
  error?: string;
};

export const ModalSelector: React.FC<ModalSelectorProps> = ({
  label,
  placeholder = "Seleccionar...",
  options,
  loading,
  value,
  onValueChange,
  error,
}) => {
  const [visible, setVisible] = useState(false);

  const open = () => setVisible(true);
  const close = () => setVisible(false);

  const selectedLabel =
    options?.find((opt) => opt.id === value)?.label || placeholder;

  const renderItem = ({ item }: { item: Option }) => (
    <List.Item
      title={item.label}
      onPress={() => {
        onValueChange(item.id);
        close();
      }}
      left={(props) => (
        <List.Icon
          {...props}
          icon={value === item.id ? "check" : "circle-outline"}
        />
      )}
    />
  );

  return (
    <View style={styles.container}>
      <Text variant="labelMedium">{label}</Text>
      <Button
        mode="outlined"
        onPress={open}
        icon="chevron-down"
        style={styles.button}
      >
        {selectedLabel}
      </Button>

      {error ? <HelperText type="error">{error}</HelperText> : null}

      <Portal>
        <Modal
          visible={visible}
          onDismiss={close}
          contentContainerStyle={styles.modal}
        >
          <View style={{ minHeight: 200, maxHeight: 400 }}>
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>
              {label}
            </Text>

            {loading ? (
              <ActivityIndicator animating />
            ) : options && options.length > 0 ? (
              <FlatList
                data={options}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ItemSeparatorComponent={() => (
                  <View style={{ height: 1, backgroundColor: "#eee" }} />
                )}
              />
            ) : (
              <Text>No hay opciones disponibles</Text>
            )}

            <Button onPress={close} style={{ marginTop: 12 }}>
              Cerrar
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  button: {
    marginTop: 4,
    justifyContent: "flex-start",
  },
  modal: {
    margin: 20,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
  },
});
