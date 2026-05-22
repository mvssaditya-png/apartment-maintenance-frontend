import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { getLoggedInUser } from "../api/dashboardApi";
export default function PaymentsScreen({ navigation }) {
  const [user, setUser] = useState(null);
    useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const res = await getLoggedInUser();
      setUser(res.data);
    } catch (error) {
      console.log("LOAD USER ERROR:", error?.response?.data || error);
    }
  };
  const isAdmin =
  user?.role?.toUpperCase() === "ADMIN";
  const isAdminOrCashier =
  user?.role?.toUpperCase() === "ADMIN" ||
  user?.role?.toUpperCase() === "CASHIER";
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Payments</Text>
        <Text style={styles.subtitle}>
          Manage dues, submitted payments and approvals.
        </Text>

        <PaymentCard
          icon="wallet-outline"
          title="My Dues"
          subtitle="View pending dues and submit payment"
          color="#2563EB"
          bg="#EEF4FF"
          onPress={() => navigation.navigate("MyDues")}
        />

        <PaymentCard
          icon="receipt-outline"
          title="Submitted Payments"
          subtitle="View submitted payments and approvals"
          color="#16A34A"
          bg="#EAF8EE"
          onPress={() => navigation.navigate("SubmittedPayments")}
        />

        {isAdmin && (
          <PaymentCard
            icon="document-text-outline"
            title="Create Payment Request"
            subtitle="Generate maintenance or special request"
            color="#F97316"
            bg="#FFF3EA"
            onPress={() => navigation.navigate("PaymentRequest")}
          />
        )}

        {isAdminOrCashier && (
          <PaymentCard
            icon="create-outline"
            title="Record Payment"
            subtitle="Record payment for any flat"
            color="#0891B2"
            bg="#ECFEFF"
            onPress={() => navigation.navigate("RecordPayment")}
          />
        )}

        <PaymentCard
          icon="time-outline"
          title="Payment History"
          subtitle="Flat-wise charges, payments and balance"
          color="#7C3AED"
          bg="#F3E8FF"
          onPress={() => navigation.navigate("PaymentHistory")}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function PaymentCard({
  icon,
  title,
  subtitle,
  color,
  bg,
  onPress,
  disabled,
}) {
  return (
    <TouchableOpacity
      style={[styles.card, disabled && styles.disabledCard]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={[styles.iconBox, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={26} color={color} />
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={22}
        color={disabled ? "#D1D5DB" : "#9CA3AF"}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  container: {
    padding: 18,
    paddingBottom: 100,
  },

  heading: {
    fontSize: 30,
    fontWeight: "900",
    color: "#111827",
  },

  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 24,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
  },

  disabledCard: {
    opacity: 0.6,
  },

  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  textBlock: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },

  cardSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
});