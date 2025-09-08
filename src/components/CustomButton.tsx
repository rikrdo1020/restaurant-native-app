import React from "react";
import { Platform, Pressable, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  mode?: "contained" | "outlined";
  style?: any;
  disabled?: boolean;
}

export default function CustomButton({
  title,
  onPress,
  mode = "contained",
  style,
  disabled = false,
}: CustomButtonProps) {
  const theme = useTheme();

  const buttonStyle = [
    styles.button,
    mode === "contained"
      ? {
          backgroundColor: disabled ? theme.colors.surfaceDisabled : "#ff6347",
        }
      : {
          borderColor: "#ff6347",
          borderWidth: 1,
          backgroundColor: "transparent",
        },
    style,
  ];

  const textStyle = [
    styles.text,
    {
      color:
        mode === "contained"
          ? disabled
            ? theme.colors.onSurfaceDisabled
            : "white"
          : "#ff6347",
    },
  ];

  return (
    <Pressable
      style={({ pressed }) => [
        buttonStyle,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      // ✅ Sin aria-hidden problemático
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Text style={textStyle} variant="labelLarge">
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    ...Platform.select({
      web: {
        cursor: "pointer",
        userSelect: "none",
      },
    }),
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.6,
  },
});
