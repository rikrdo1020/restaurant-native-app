import React from "react";
import { View } from "react-native";
import { Card, IconButton, Text, TextInput } from "react-native-paper";
import { useCart } from "../hooks/useCart";
import { CartItem as CartItemType } from "../types";

interface Props {
  item: CartItemType;
}

export function CartItem({ item }: Props) {
  const { updateQuantity, updateNotes, removeItem } = useCart();
  const [showNotes, setShowNotes] = React.useState(!!item.notes);
  const [localNotes, setLocalNotes] = React.useState(item.notes || "");

  const handleNotesChange = (text: string) => {
    setLocalNotes(text);
    updateNotes(item.menu_item_id, text);
  };

  const incrementQuantity = () => {
    updateQuantity(item.menu_item_id, item.quantity + 1);
  };

  const decrementQuantity = () => {
    if (item.quantity > 1) {
      updateQuantity(item.menu_item_id, item.quantity - 1);
    }
  };

  const handleRemove = () => {
    removeItem(item.menu_item_id);
  };

  const itemTotal = item.price * item.quantity;

  return (
    <Card style={{ elevation: 1, backgroundColor: "#fafafa" }}>
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

            <Text
              variant="bodyMedium"
              style={{ color: "#ff6347", fontWeight: "bold" }}
            >
              ${item.price.toFixed(2)} c/u
            </Text>

            {item.notes && (
              <Text
                variant="bodySmall"
                style={{
                  marginTop: 4,
                  fontStyle: "italic",
                  opacity: 0.7,
                }}
              >
                Nota: {item.notes}
              </Text>
            )}
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text
              variant="titleMedium"
              style={{ fontWeight: "bold", marginBottom: 8 }}
            >
              ${itemTotal.toFixed(2)}
            </Text>

            <IconButton
              icon="delete"
              size={20}
              onPress={handleRemove}
              iconColor="#ff6347"
            />
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <IconButton
              icon="minus"
              size={20}
              onPress={decrementQuantity}
              disabled={item.quantity <= 1}
              style={{ margin: 0 }}
            />
            <Text
              variant="titleMedium"
              style={{
                marginHorizontal: 12,
                minWidth: 30,
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {item.quantity}
            </Text>
            <IconButton
              icon="plus"
              size={20}
              onPress={incrementQuantity}
              style={{ margin: 0 }}
            />
          </View>

          <IconButton
            icon="note-text"
            size={20}
            onPress={() => setShowNotes(!showNotes)}
            iconColor={showNotes ? "#ff6347" : undefined}
          />
        </View>

        {showNotes && (
          <TextInput
            label="Notas especiales"
            value={localNotes}
            onChangeText={handleNotesChange}
            placeholder="Ej: Sin cebolla, extra salsa..."
            style={{ marginTop: 12 }}
            multiline
            numberOfLines={2}
            dense
          />
        )}
      </Card.Content>
    </Card>
  );
}
