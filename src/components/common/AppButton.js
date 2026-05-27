import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { COLORS } from "./theme";

export default function AppButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  style,
}) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === "danger" && styles.dangerButton,
        variant === "success" && styles.successButton,
        variant === "outline" && styles.outlineButton,
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? COLORS.primary : COLORS.white} />
      ) : (
        <Text
          style={[
            styles.text,
            variant === "outline" && styles.outlineText,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  dangerButton: {
    backgroundColor: COLORS.danger,
  },

  successButton: {
    backgroundColor: COLORS.success,
  },

  outlineButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },

  disabledButton: {
    opacity: 0.6,
  },

  text: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
  },

  outlineText: {
    color: COLORS.primary,
  },
});