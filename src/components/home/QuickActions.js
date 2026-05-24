import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function QuickActions({ role, navigation }) {
  const userRole = (role || "RESIDENT").toUpperCase();

  const actions = getActionsByRole(userRole);

  const handlePress = (key) => {
  if (key === "openingBalance") {
    navigation.navigate("OpeningBalance");
  }

  if (key === "paymentRequest") {
    navigation.navigate("PaymentRequest");
  }

  if (key === "myDue") {
    navigation.navigate("MyDues");
  }

  if (key === "payMaintenance") {
    navigation.navigate("MyDues");
  }

  if (key === "submittedPayments") {
    navigation.navigate("SubmittedPayments");
  }

  if (key === "raiseExpense") {
    navigation.navigate("AddExpense");
  }

  if (key === "viewExpenses") {
    navigation.navigate("ViewExpenses");
  }

  if (key === "defaulters") {
    navigation.navigate("Defaulters");
  }

  if (key === "manageUsers") {
    navigation.navigate("AdminUsers");
  }

  if (key === "notices") {
  navigation.navigate("Notices");
  }

  if (key === "sos") {
  navigation.navigate("SOS");
  }

  if (key === "meetings") {
    navigation.navigate("Meetings");
  }

  if (key === "complaints") {
    navigation.navigate("Complaints");
  }
};
  return (
    <View>
      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.grid}>
        {actions.map((item, index) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.actionCard,
              (index + 1) % 3 === 0 && { marginRight: 0 },
            ]}
            onPress={() => handlePress(item.key)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.bg }]}>
              <Ionicons name={item.icon} size={26} color={item.color} />
            </View>

            <Text style={styles.actionLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function getActionsByRole(role) {
  const residentActions = [
    {
      key: "myDue",
      label: "My\nDue",
      icon: "wallet-outline",
      color: "#F97316",
      bg: "#FFF3E8",
    },
    {
      key: "submittedPayments",
      label: "Submitted\nPayments",
      icon: "receipt-outline",
      color: "#2563EB",
      bg: "#EEF5FF",
    },
    {
      key: "viewExpenses",
      label: "View\nExpense",
      icon: "eye-outline",
      color: "#7C3AED",
      bg: "#F3E8FF",
    },
    {
    key: "notices",
    label: "Notices",
    icon: "megaphone-outline",
    color: "#2563EB",
    bg: "#EEF4FF",
    },
    {
    key: "sos",
    label: "SOS",
    icon: "alert-circle-outline",
    color: "#DC2626",
    bg: "#FEF2F2",
    },
    {
      key: "meetings",
      label: "Meetings",
      icon: "people-outline",
      color: "#2563EB",
      bg: "#EEF4FF",
    },
    {
      key: "complaints",
      label: "Complaints",
      icon: "chatbox-ellipses-outline",
      color: "#2563EB",
      bg: "#EEF4FF",
    },
  ];

  const cashierActions = [
    {
      key: "raiseExpense",
      label: "Raise\nExpense",
      icon: "add-circle-outline",
      color: "#DC2626",
      bg: "#FEF2F2",
    },
    {
      key: "myDue",
      label: "My\nDue",
      icon: "wallet-outline",
      color: "#F97316",
      bg: "#FFF3E8",
    },
    {
      key: "defaulters",
      label: "Get\nDefaulters",
      icon: "people-outline",
      color: "#0891B2",
      bg: "#ECFEFF",
    },
    {
      key: "submittedPayments",
      label: "Submitted\nPayments",
      icon: "receipt-outline",
      color: "#2563EB",
      bg: "#EEF5FF",
    },
    {
      key: "viewExpenses",
      label: "View\nExpense",
      icon: "eye-outline",
      color: "#7C3AED",
      bg: "#F3E8FF",
    },
    {
    key: "notices",
    label: "Notices",
    icon: "megaphone-outline",
    color: "#2563EB",
    bg: "#EEF4FF",
    },
    {
    key: "sos",
    label: "SOS",
    icon: "alert-circle-outline",
    color: "#DC2626",
    bg: "#FEF2F2",
    },
    {
      key: "meetings",
      label: "Meetings",
      icon: "people-outline",
      color: "#2563EB",
      bg: "#EEF4FF",
    },
    {
      key: "complaints",
      label: "Complaints",
      icon: "chatbox-ellipses-outline",
      color: "#2563EB",
      bg: "#EEF4FF",
    },
  ];

  const adminActions = [
    {
      key: "myDue",
      label: "My\nDue",
      icon: "wallet-outline",
      color: "#F97316",
      bg: "#FFF3E8",
    },
    {
      key: "openingBalance",
      label: "Opening\nBalance",
      icon: "cash-outline",
      color: "#16A34A",
      bg: "#EAFBF0",
    },
    {
      key: "paymentRequest",
      label: "Payment\nRequest",
      icon: "document-text-outline",
      color: "#F97316",
      bg: "#FFF3E8",
    },
    {
      key: "raiseExpense",
      label: "Raise\nExpense",
      icon: "add-circle-outline",
      color: "#DC2626",
      bg: "#FEF2F2",
    },
    {
      key: "defaulters",
      label: "Get\nDefaulters",
      icon: "people-outline",
      color: "#0891B2",
      bg: "#ECFEFF",
    },
    {
      key: "submittedPayments",
      label: "Submitted\nPayments",
      icon: "receipt-outline",
      color: "#2563EB",
      bg: "#EEF5FF",
    },
    {
      key: "viewExpenses",
      label: "View\nExpense",
      icon: "eye-outline",
      color: "#7C3AED",
      bg: "#F3E8FF",
    },
    {
      key: "manageUsers",
      label: "Manage\nUsers",
      icon: "people-circle-outline",
      color: "#2563EB",
      bg: "#EEF5FF",
    },
    {
    key: "notices",
    label: "Notices",
    icon: "megaphone-outline",
    color: "#2563EB",
    bg: "#EEF4FF",
    },
    {
    key: "sos",
    label: "SOS",
    icon: "alert-circle-outline",
    color: "#DC2626",
    bg: "#FEF2F2",
    },
    {
      key: "meetings",
      label: "Meetings",
      icon: "people-outline",
      color: "#2563EB",
      bg: "#EEF4FF",
    },
    {
      key: "complaints",
      label: "Complaints",
      icon: "chatbox-ellipses-outline",
      color: "#2563EB",
      bg: "#EEF4FF",
    },
  ];

  if (role === "ADMIN") {
    return adminActions;
  }

  if (role === "CASHIER") {
    return cashierActions;
  }

  return residentActions;
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 14,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 24,
  },

  actionCard: {
  width: "30.6%",
  minHeight: 115,
  backgroundColor: "#FFFFFF",
  borderRadius: 16,
  paddingVertical: 14,
  paddingHorizontal: 6,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 12,
  marginRight: "4%",
  borderWidth: 1,
  borderColor: "#E5E7EB",
},

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  actionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    lineHeight: 15,
  },
});