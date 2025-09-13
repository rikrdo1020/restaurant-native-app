// app/checkout.tsx
import { useRestaurant } from "@/src/hooks/useApi";
import { useCart } from "@/src/hooks/useCart";
import { useCreateOrder } from "@/src/hooks/useOrders";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Divider, Text } from "react-native-paper";
import QRCode from "react-native-qrcode-svg";



export default function CheckoutScreen() {
    const router = useRouter();
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const { items, getTotal, getItemCount, clearCart } = useCart();
    const total = getTotal();
    const itemCount = getItemCount();

    const { data: restaurantData } = useRestaurant(slug as string);

    const createOrder = useCreateOrder();

    const [orderResult, setOrderResult] = useState<null | any>(null);
    const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

    const restaurantId = restaurantData?.id

    useEffect(() => {
        // Si la RPC no devuelve expires_at usamos fallback 15 min
        if (orderResult?.expires_at && !secondsLeft) {
            const diff = Math.floor((new Date(orderResult.expires_at).getTime() - Date.now()) / 1000);
            setSecondsLeft(diff > 0 ? diff : 0);
        }
    }, [orderResult, secondsLeft]);

    useEffect(() => {
        if (secondsLeft == null) return;
        if (secondsLeft <= 0) return;

        const t = setInterval(() => setSecondsLeft((s) => (s !== null ? s - 1 : null)), 1000);
        return () => clearInterval(t);
    }, [secondsLeft]);

    const onConfirm = async () => {
        if (!restaurantId) {
            console.error("No se pudo determinar restaurantId desde el carrito.");
            return;
        }

        try {
            const payload = {
                p_restaurant_id: restaurantId,
                p_items: items.map((it: any) => ({
                    menu_item_id: it.menu_item_id || it.id || it.menuItemId,
                    quantity: it.quantity,
                    notes: it.notes ?? null,
                })),
            };

            const res = await createOrder.mutateAsync(payload);
            // normalizar si viene como string
            const normalized = typeof res === "string" ? JSON.parse(res) : res;

            setOrderResult(normalized);

            // fallback 15 minutos si no viene expires_at
            if (!normalized?.expires_at) {
                setSecondsLeft(15 * 60);
            }
            // Opcional: limpiar el carrito localmente (si quieres que el usuario tenga su carrito vacío)
            // clearCart();
        } catch (err: any) {
            console.error("Error creando orden:", err);
        }
    };

    const qrValue = useMemo(() => {
        if (!orderResult) return "";
        const orderId = orderResult.order_id ?? orderResult.orderId ?? orderResult.id;
        const code = orderResult.code ?? orderResult.token ?? orderResult.code;
        return JSON.stringify({ orderId, code });
    }, [orderResult]);

    if (items.length === 0) {
        return (
            <View style={styles.empty}>
                <Text variant="headlineSmall" style={{ textAlign: "center", marginBottom: 16 }}>
                    Tu pedido está vacío
                </Text>
                <Text variant="bodyMedium" style={{ textAlign: "center", marginBottom: 24, opacity: 0.7 }}>
                    Agrega algunos productos del menú para continuar
                </Text>
                <Button mode="contained" onPress={() => router.back()} style={{ backgroundColor: "#ff6347" }}>
                    Volver al Menú
                </Button>
            </View>
        );
    }

    // Estado: creando orden
    if (createOrder.isPending && !orderResult) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
                <Text>Cargando...</Text>
            </View>
        );
    }

    // Pantalla: mostrar QR luego de crear orden
    if (orderResult) {
        return (
            <ScrollView contentContainerStyle={styles.container}>
                <Text variant="headlineSmall" style={{ marginBottom: 8 }}>
                    Muestra este QR al mesero
                </Text>

                <View style={{ alignItems: "center", marginVertical: 12 }}>
                    {qrValue ? <QRCode value={qrValue} size={260} /> : <Text>No se pudo generar el QR</Text>}
                </View>

                {secondsLeft !== null && (
                    <Text style={{ marginBottom: 8 }}>Expira en: {Math.floor(secondsLeft / 60)}:{("0" + (secondsLeft % 60)).slice(-2)}</Text>
                )}

                {orderResult.skipped_items && Array.isArray(orderResult.skipped_items) && orderResult.skipped_items.length > 0 && (
                    <>
                        <Divider style={{ marginVertical: 12 }} />
                        <Text variant="titleMedium">Algunos items no se agregaron:</Text>
                        {orderResult.skipped_items.map((s: any, i: number) => (
                            <View key={i} style={{ marginTop: 8 }}>
                                <Text>- {s.reason || "no disponible"}</Text>
                                <Text style={{ opacity: 0.7 }}>{JSON.stringify(s.item)}</Text>
                            </View>
                        ))}
                    </>
                )}

                <View style={{ marginTop: 20 }}>
                    <Button mode="contained" onPress={() => { /* puedes llevar al usuario al inicio o menú */ router.push("/"); }} style={{ backgroundColor: "#ff6347" }}>
                        Volver al Menú
                    </Button>

                    <Button mode="outlined" onPress={() => { setOrderResult(null); setSecondsLeft(null); }} style={{ marginTop: 12 }}>
                        Cerrar QR
                    </Button>
                </View>
            </ScrollView>
        );
    }

    // Pantalla: revisar pedido y confirmar (antes de crear la orden)
    return (
        <View style={{ flex: 1 }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
                <View style={{ marginBottom: 24 }}>
                    <Text variant="headlineSmall" style={{ marginBottom: 8 }}>
                        Confirmar pedido
                    </Text>
                    <Text variant="bodyMedium" style={{ opacity: 0.7 }}>
                        {itemCount} {itemCount === 1 ? "producto" : "productos"} • Total: ${total.toFixed(2)}
                    </Text>
                </View>

                {/* Resumen de items (puedes importar tu OrderSummary o CartItem componentes) */}
                <View style={{ marginBottom: 24 }}>
                    {items.map((it: any, idx: number) => (
                        <View key={`${it.menu_item_id ?? it.id}-${idx}`} style={{ marginBottom: 8 }}>
                            <Text>{it.name ?? it.title ?? it.menu_item_name}</Text>
                            <Text style={{ opacity: 0.7 }}>{it.quantity} x ${it.price ?? it.price_snapshot ?? "?"}</Text>
                            <Divider style={{ marginVertical: 8 }} />
                        </View>
                    ))}
                </View>

                {/* Notas opcionales */}
                <View style={{ marginBottom: 16 }}>
                    <Text variant="labelLarge">Nombre (opcional)</Text>
                    <Text variant="bodyMedium" style={{ opacity: 0.7, marginBottom: 8 }}>
                        Si quieres que el mesero sepa quién pidió
                    </Text>
                    {/* Usa el TextInput de react-native-paper si lo prefieres; aquí dejo botones minimal */}
                    <Button mode="outlined" onPress={() => { /* opcional para abrir modal para ingresar nombre */ }}>
                        Agregar nombre / Notas
                    </Button>
                </View>

                <View style={{ marginTop: 8 }}>
                    <Button mode="contained" onPress={onConfirm} style={{ backgroundColor: "#ff6347" }}>
                        Generar QR y enviar pedido
                    </Button>

                    <Button mode="outlined" onPress={() => router.back()} style={{ marginTop: 12 }}>
                        Volver
                    </Button>

                    <Button mode="text" onPress={clearCart} style={{ marginTop: 8 }} textColor="#ff6347">
                        Limpiar pedido
                    </Button>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        alignItems: "center",
    },
    empty: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
});