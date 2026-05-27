import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "./theme";

export default function StatusBadge({ status }) {
  const value = status || "UNKNOWN";
  const statusValue = value.toUpperCase();

  const config = getStatusConfig(statusValue);

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.color }]}>
        {value}
      </Text>
    </View>
  );
}

function getStatusConfig(status) {
  if (
    status === "PAID" ||
    status === "APPROVED" ||
    status === "COMPLETED" ||
    status === "RESOLVED" ||
    status === "SUCCESS"
  ) {
    return {
      color: COLORS.success,
      bg: "#DCFCE7",
    };
  }

  if (
    status === "PENDING" ||
    status === "UPCOMING" ||
    status === "ONGOING"
  ) {
    return {
      color: COLORS.warning,
      bg: "#FFEDD5",
    };
  }

  if (
    status === "REJECTED" ||
    status === "CANCELLED" ||
    status === "FAILED"
  ) {
    return {
      color: COLORS.danger,
      bg: "#FEE2E2",
    };
  }

  return {
    color: COLORS.primary,
    bg: "#DBEAFE",
  };
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: "flex-start",
  },

  text: {
    fontSize: 11,
    fontWeight: "900",
  },
});