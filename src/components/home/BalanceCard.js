import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function BalanceCard({ currentBalance, totalDue, onPayPress }) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconBox}>
          <Ionicons name="wallet-outline" size={30} color="#2563EB" />
        </View>

        <View style={styles.balanceBlock}>
          <Text style={styles.label}>Society Balance</Text>
          <Text style={styles.balance}>₹{formatAmount(currentBalance)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.label}>My Due</Text>
          <Text style={styles.due}>₹{formatAmount(totalDue)}</Text>
        </View>

        <TouchableOpacity style={styles.payButton} onPress={onPayPress}>
          <Text style={styles.payText}>Pay Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function formatAmount(value) {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  return Number(value).toLocaleString("en-IN");
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#EEF5FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  balanceBlock: {
    flex: 1,
  },

  label: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },

  balance: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  due: {
    fontSize: 22,
    fontWeight: "900",
    color: "#DC2626",
    marginTop: 4,
  },

  payButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
  },

  payText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },
});