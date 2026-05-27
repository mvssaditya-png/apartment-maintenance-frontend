import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import AppCard from "../common/AppCard";
import AppButton from "../common/AppButton";
import { COLORS } from "../common/theme";

export default function BalanceCard({
  currentBalance,
  totalDue,
  onPayPress,
}) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconBox}>
          <Ionicons
            name="wallet-outline"
            size={30}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.balanceBlock}>
          <Text style={styles.label}>Society Balance</Text>

          <Text style={styles.balance}>
            ₹{formatAmount(currentBalance)}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View style={styles.dueBlock}>
          <Text style={styles.label}>My Due</Text>

          <Text style={styles.due}>
            ₹{formatAmount(totalDue)}
          </Text>
        </View>

        <AppButton
          title="Pay Now"
          onPress={onPayPress}
          style={styles.payButton}
        />
      </View>
    </AppCard>
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
    borderRadius: 24,
    padding: 18,
    marginBottom: 24,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#EEF5FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  balanceBlock: {
    flex: 1,
  },

  label: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "700",
  },

  balance: {
    fontSize: 29,
    fontWeight: "900",
    color: COLORS.text,
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dueBlock: {
    flex: 1,
    paddingRight: 12,
  },

  due: {
    fontSize: 23,
    fontWeight: "900",
    color: COLORS.danger,
    marginTop: 4,
  },

  payButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
});