import React from "react";
import { View } from "react-native";
import { Text, Divider } from "react-native-paper";

interface Props {
  name: string;
  itemCount: number;
}

export function CategoryHeader({ name, itemCount }: Props) {
  return (
    <View style={{ marginBottom: 16 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <Text
          variant="titleLarge"
          style={{ fontWeight: "bold", color: "#ff6347" }}
        >
          {name}
        </Text>
        <Text variant="bodySmall" style={{ opacity: 0.6 }}>
          {itemCount} productos
        </Text>
      </View>
      <Divider style={{ backgroundColor: "#ff6347", height: 2 }} />
    </View>
  );
}
