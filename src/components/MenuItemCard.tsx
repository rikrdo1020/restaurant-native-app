import React from "react";
import { View } from "react-native";
import { Card, Text, Button, IconButton, TextInput } from "react-native-paper";
import { MenuItem } from "../lib/supabase";
import { useCart } from "../hooks/useCart";

interface Props {
  item: MenuItem;
  onAddToCart: (quantity: number, notes?: string) => void;
}

export function MenuItemCard({ item, onAddToCart }: Props) {
  const { addItem, items } = useCart();
  const [quantity, setQuantity] = React.useState(1);
  const [notes, setNotes] = React.useState("");
  const [showNotes, setShowNotes] = React.useState(false);

  const cartItem = items.find((i) => i.menu_item_id === item.id);
  const isInCart = !!cartItem;

  const handleAddToCart = () => {
    addItem(item, quantity, notes);
    onAddToCart(quantity, notes);
    setQuantity(1);
    setNotes("");
    setShowNotes(false);
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  return (
    <Card style={{ marginBottom: 12, elevation: 2 }}>
      <Card.Content>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text
              variant="titleMedium"
              style={{ fontWeight: "bold", marginBottom: 4 }}
            >
              {item.name}
            </Text>

            {item.description && (
              <Text
                variant="bodyMedium"
                style={{ opacity: 0.7, marginBottom: 8 }}
              >
                {item.description}
              </Text>
            )}

            <Text
              variant="titleMedium"
              style={{ color: "#ff6347", fontWeight: "bold" }}
            >
              ${item.price.toFixed(2)}
            </Text>

            {isInCart && (
              <Text
                variant="bodySmall"
                style={{
                  color: "#ff6347",
                  marginTop: 4,
                  fontWeight: "bold",
                }}
              >
                En el pedido: {cartItem.quantity}
              </Text>
            )}
          </View>

          {/* Imagen placeholder */}
          <View
            style={{
              width: 80,
              height: 80,
              backgroundColor: "#f5f5f5",
              borderRadius: 8,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 24 }}>🍽️</Text>
          </View>
        </View>

        {/* Controles de cantidad */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <IconButton
              icon="minus"
              size={20}
              onPress={decrementQuantity}
              disabled={quantity <= 1}
            />
            <Text
              variant="titleMedium"
              style={{
                marginHorizontal: 12,
                minWidth: 20,
                textAlign: "center",
              }}
            >
              {quantity}
            </Text>
            <IconButton icon="plus" size={20} onPress={incrementQuantity} />
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <IconButton
              icon="note-text"
              size={20}
              onPress={() => setShowNotes(!showNotes)}
              iconColor={showNotes ? "#ff6347" : undefined}
            />
            <Button
              mode="contained"
              onPress={handleAddToCart}
              style={{ backgroundColor: "#ff6347" }}
            >
              Agregar
            </Button>
          </View>
        </View>

        {/* Campo de notas */}
        {showNotes && (
          <TextInput
            label="Notas especiales (opcional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Ej: Sin cebolla, extra salsa..."
            style={{ marginTop: 12 }}
            multiline
            numberOfLines={2}
          />
        )}
      </Card.Content>
    </Card>
  );
}
