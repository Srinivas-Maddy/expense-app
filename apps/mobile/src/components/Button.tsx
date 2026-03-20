import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "danger" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function Button({ title, onPress, variant = "primary", loading, disabled, style }: ButtonProps) {
  const bg = variant === "primary" ? "#4f46e5" : variant === "danger" ? "#ef4444" : "transparent";
  const textColor = variant === "ghost" ? "#4f46e5" : "#fff";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.btn, { backgroundColor: bg, opacity: disabled || loading ? 0.5 : 1 }, style]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, alignItems: "center" },
  text: { fontSize: 15, fontWeight: "600" },
});
