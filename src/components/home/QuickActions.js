import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS, SHADOW } from "../common/theme";

export default function QuickActions({ role, navigation }) {
  const userRole = (role || "RESIDENT").toUpperCase();
  const actions = getActionsByRole(userRole);

  const handlePress = (key) => {
    const routes = {
      openingBalance: "OpeningBalance",
      paymentRequest: "PaymentRequest",
      myDue: "MyDues",
      payMaintenance: "MyDues",
      submittedPayments: "SubmittedPayments",
      raiseExpense: "AddExpense",
      viewExpenses: "ViewExpenses",
      defaulters: "Defaulters",
      manageUsers: "AdminUsers",
      notices: "Notices",
      sos: "SOS",
      meetings: "Meetings",
      complaints: "Complaints",
    };

    if (routes[key]) {
      navigation.navigate(routes[key]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.grid}>
        {actions.map((item, index) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.actionCard,
              (index + 1) % 3 === 0 && styles.noRightMargin,
            ]}
            onPress={() => handlePress(item.key)}
            activeOpacity={0.85}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.bg }]}>
              <Ionicons name={item.icon} size={24} color={item.color} />
            </View>

            <Text style={styles.actionLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function getActionsByRole(role) {
  const commonActions = [
    {
      key: "myDue",
      label: "My\nDue",
      icon: "wallet-outline",
      color: COLORS.warning,
      bg: "#FFF3E8",
    },
    {
      key: "submittedPayments",
      label: "Submitted\nPayments",
      icon: "receipt-outline",
      color: COLORS.primary,
      bg: "#EEF5FF",
    },
    {
      key: "viewExpenses",
      label: "View\nExpense",
      icon: "eye-outline",
      color: COLORS.purple,
      bg: "#F3E8FF",
    },
    {
      key: "notices",
      label: "Notices",
      icon: "megaphone-outline",
      color: COLORS.primary,
      bg: "#EEF5FF",
    },
    {
      key: "sos",
      label: "SOS",
      icon: "alert-circle-outline",
      color: COLORS.danger,
      bg: "#FEF2F2",
    },
    {
      key: "meetings",
      label: "Meetings",
      icon: "people-outline",
      color: COLORS.primary,
      bg: "#EEF5FF",
    },
    {
      key: "complaints",
      label: "Complaints",
      icon: "chatbox-ellipses-outline",
      color: COLORS.primary,
      bg: "#EEF5FF",
    },
  ];

  const cashierExtraActions = [
    {
      key: "raiseExpense",
      label: "Raise\nExpense",
      icon: "add-circle-outline",
      color: COLORS.danger,
      bg: "#FEF2F2",
    },
    {
      key: "defaulters",
      label: "Get\nDefaulters",
      icon: "people-outline",
      color: COLORS.cyan,
      bg: "#ECFEFF",
    },
  ];

  const adminExtraActions = [
    {
      key: "openingBalance",
      label: "Opening\nBalance",
      icon: "cash-outline",
      color: COLORS.success,
      bg: "#EAFBF0",
    },
    {
      key: "paymentRequest",
      label: "Payment\nRequest",
      icon: "document-text-outline",
      color: COLORS.warning,
      bg: "#FFF3E8",
    },
    {
      key: "raiseExpense",
      label: "Raise\nExpense",
      icon: "add-circle-outline",
      color: COLORS.danger,
      bg: "#FEF2F2",
    },
    {
      key: "defaulters",
      label: "Get\nDefaulters",
      icon: "people-outline",
      color: COLORS.cyan,
      bg: "#ECFEFF",
    },
    {
      key: "manageUsers",
      label: "Manage\nUsers",
      icon: "people-circle-outline",
      color: COLORS.primary,
      bg: "#EEF5FF",
    },
  ];

  if (role === "ADMIN") {
    return [...adminExtraActions, ...commonActions];
  }

  if (role === "CASHIER") {
    return [...cashierExtraActions, ...commonActions];
  }

  return commonActions;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 14,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  actionCard: {
    width: "30.6%",
    minHeight: 116,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
    marginRight: "4%",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW,
  },

  noRightMargin: {
    marginRight: 0,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  actionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
    lineHeight: 15,
  },
});