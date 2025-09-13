import WebQrScanner from "@/src/components/WebQrScanner";
import { useConfirmOrder } from "@/src/hooks/useOrders";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Snackbar,
  Text,
  TextInput,
} from "react-native-paper";

export default function NewOrderPage() {
  const router = useRouter();
  const confirmMutation = useConfirmOrder();

  const [mode, setMode] = useState<"menu" | "manual" | "scanner">("menu");
  const [scannedData, setScannedData] = useState<{
    orderId: string;
    code: string;
  } | null>(null);
  const [tableNumber, setTableNumber] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (mode === "scanner" && Platform.OS !== "web" && permission === null) {
      requestPermission();
    }
  }, [mode, permission]);

  const handleQrResult = (data: string) => {
    if (scannedData) return;

    try {
      const json = JSON.parse(data);
      if (json.orderId && json.code) {
        setScannedData({ orderId: json.orderId, code: json.code });
      } else {
        setSnackbarMessage("QR inválido");
        setSnackbarVisible(true);
      }
    } catch {
      setSnackbarMessage("Error leyendo QR");
      setSnackbarVisible(true);
    }
  };

  const onBarCodeScanned = (scanningResult: any) => {
    const { data } = scanningResult;
    handleQrResult(data);
  };

  const handleConfirm = async () => {
    if (!scannedData) return;
    try {
      await confirmMutation.mutateAsync({
        p_order_id: scannedData.orderId,
        p_code: scannedData.code,
        p_staff_user_id: "STAFF-UUID-AQUI",
        p_table_number: tableNumber || null,
      });
      setSnackbarMessage("Orden confirmada");
      setSnackbarVisible(true);
      router.back();
    } catch (err: any) {
      setSnackbarMessage(err.message || "Error al confirmar orden");
      setSnackbarVisible(true);
    }
  };

  if (mode === "menu") {
    return (
      <View style={styles.container}>
        <Text variant="headlineSmall" style={{ marginBottom: 20 }}>
          Nueva Orden
        </Text>
        <Button
          mode="contained"
          onPress={() => setMode("manual")}
          style={{ marginBottom: 12 }}
        >
          Crear manual
        </Button>
        <Button mode="outlined" onPress={() => setMode("scanner")}>
          Escanear QR del cliente
        </Button>
      </View>
    );
  }

  if (mode === "manual") {
    return (
      <View style={styles.container}>
        <Text variant="headlineSmall" style={{ marginBottom: 20 }}>
          Crear orden manual
        </Text>
        <TextInput
          label="Número de mesa"
          value={tableNumber}
          onChangeText={setTableNumber}
          style={{ marginBottom: 16 }}
        />
        <Button
          mode="contained"
          onPress={() => {
            setSnackbarMessage(
              "Aquí se implementará el formulario de orden manual"
            );
            setSnackbarVisible(true);
          }}
        >
          Continuar
        </Button>
        <Button mode="text" onPress={() => setMode("menu")}>
          Atrás
        </Button>
      </View>
    );
  }

  if (mode === "scanner") {
    // En web, usar WebQrScanner directamente
    if (Platform.OS === "web") {
      return (
        <View style={{ flex: 1 }}>
          {scannedData ? (
            <View style={styles.container}>
              <Text variant="headlineSmall">Orden detectada</Text>
              <Text>ID: {scannedData.orderId}</Text>
              <Text>Código: {scannedData.code}</Text>

              <TextInput
                label="Asignar mesa (opcional)"
                value={tableNumber}
                onChangeText={setTableNumber}
                style={{ marginVertical: 16 }}
              />

              <Button
                mode="contained"
                onPress={handleConfirm}
                loading={confirmMutation.isPending}
                style={{ marginBottom: 12 }}
              >
                Confirmar orden
              </Button>
              <Button mode="outlined" onPress={() => setScannedData(null)}>
                Escanear otro
              </Button>
              <Button mode="text" onPress={() => setMode("menu")}>
                Atrás
              </Button>
            </View>
          ) : (
            <WebQrScanner onResult={handleQrResult} />
          )}
        </View>
      );
    }

    // En mobile, usar expo-camera con permisos
    if (!permission) {
      return (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text>Solicitando permisos...</Text>
        </View>
      );
    }
    if (!permission.granted) {
      return (
        <View style={styles.center}>
          <Text>No hay permisos de cámara</Text>
          <Button onPress={requestPermission} style={{ marginTop: 10 }}>
            Permitir
          </Button>
          <Button onPress={() => setMode("menu")} style={{ marginTop: 10 }}>
            Atrás
          </Button>
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        {scannedData ? (
          <View style={styles.container}>
            <Text variant="headlineSmall">Orden detectada</Text>
            <Text>ID: {scannedData.orderId}</Text>
            <Text>Código: {scannedData.code}</Text>

            <TextInput
              label="Asignar mesa (opcional)"
              value={tableNumber}
              onChangeText={setTableNumber}
              style={{ marginVertical: 16 }}
            />

            <Button
              mode="contained"
              onPress={handleConfirm}
              loading={confirmMutation.isPending}
              style={{ marginBottom: 12 }}
            >
              Confirmar orden
            </Button>
            <Button mode="outlined" onPress={() => setScannedData(null)}>
              Escanear otro
            </Button>
            <Button mode="text" onPress={() => setMode("menu")}>
              Atrás
            </Button>
          </View>
        ) : (
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={onBarCodeScanned}
          />
        )}
      </View>
    );
  }

  return (
    <Snackbar
      visible={snackbarVisible}
      onDismiss={() => setSnackbarVisible(false)}
      duration={3000}
    >
      {snackbarMessage}
    </Snackbar>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
