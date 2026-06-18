import React, { useContext } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { AuthContext } from "../context/AuthContext";

export default function SubscriptionExpiredScreen({ navigation }) {
  const { subscriptionStatus, logout } = useContext(AuthContext);

  const status = subscriptionStatus || {};
  const showRenewButton = status?.allowed === true;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.iconBox}>
          <Ionicons name="lock-closed-outline" size={48} color="#DC2626" />
        </View>

        <Text style={styles.title}>Subscription Expired</Text>

        <Text style={styles.siteName}>
          {status?.siteName || "Apartment"}
        </Text>

        <Text style={styles.message}>
          {status?.message ||
            "Your apartment subscription has expired. Please contact admin."}
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Trial End</Text>
          <Text style={styles.infoValue}>{status?.trialEndDate || "-"}</Text>

          <Text style={styles.infoLabel}>Subscription End</Text>
          <Text style={styles.infoValue}>
            {status?.subscriptionEndDate || "-"}
          </Text>
        </View>

        {showRenewButton && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Subscription")}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Renew Subscription</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
          activeOpacity={0.85}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    alignItems: "center",
  },

  iconBox: {
    width: 96,
    height: 96,
    borderRadius: 32,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
  },

  siteName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#2563EB",
    marginTop: 10,
    textAlign: "center",
  },

  message: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 14,
    lineHeight: 22,
    fontWeight: "600",
  },

  infoCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginTop: 24,
  },

  infoLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#6B7280",
    marginTop: 8,
  },

  infoValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
    marginTop: 4,
  },

  button: {
    marginTop: 28,
    backgroundColor: "#2563EB",
    borderRadius: 18,
    height: 56,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  logoutButton: {
    marginTop: 14,
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },

  logoutText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#374151",
  },
});