import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { getMyDues } from "../api/dashboardApi";

export default function MyDuesScreen({ navigation }) {
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadDues();
    }, [])
  );

  const loadDues = async () => {
    try {
      setLoading(true);

      const response = await getMyDues();

      setDues(response.data || []);
    } catch (error) {
      console.log("MY DUES ERROR:", error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDues();
    setRefreshing(false);
  };

  const totalPending = dues
    .filter((item) => item.paymentStatus !== "PAID")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loaderText}>Loading dues...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Pending Due</Text>
          <Text style={styles.summaryAmount}>₹{formatAmount(totalPending)}</Text>
          <Text style={styles.summarySubText}>
            Includes maintenance and special requests
          </Text>
        </View>

        <Text style={styles.sectionTitle}>My Dues</Text>

        {dues.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-circle-outline" size={44} color="#16A34A" />
            <Text style={styles.emptyTitle}>No dues found</Text>
            <Text style={styles.emptyText}>
              You do not have any pending dues right now.
            </Text>
          </View>
        ) : (
          dues.map((item) => (
            <DueCard
              key={item.paymentId}
              item={item}
              onPay={() =>
                navigation.navigate("SubmitPayment", {
                  payment: item,
                })
              }
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DueCard({ item, onPay }) {
  const status = item.paymentStatus || "PENDING";
  const isPending =
  status === "PENDING" || status === "REJECTED";

  return (
    <View style={styles.dueCard}>
      <View style={styles.cardTop}>
        <View style={styles.iconBox}>
          <Ionicons
            name={
              item.requestType === "Maintenance"
                ? "home-outline"
                : "alert-circle-outline"
            }
            size={24}
            color="#2563EB"
          />
        </View>

        <View style={styles.cardTitleBlock}>
          <Text style={styles.cardTitle}>
            {item.requestType || "Payment Request"}
          </Text>

          <Text style={styles.cardSubtitle}>
            {getMonthName(item.paymentMonth)} {item.paymentYear}
          </Text>
        </View>

        <StatusBadge status={status} />
      </View>

      <View style={styles.amountRow}>
        <View>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amount}>₹{formatAmount(item.amount)}</Text>
        </View>

        {isPending ? (
          <TouchableOpacity style={styles.payButton} onPress={onPay}>
            <Text style={styles.payButtonText}>Pay Now</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.noActionText}>{status}</Text>
        )}
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Payment ID</Text>
        <Text style={styles.footerValue}>
          {String(item.paymentId).substring(0, 8)}...
        </Text>
      </View>
    </View>
  );
}

function StatusBadge({ status }) {
  let bg = "#FEF3C7";
  let color = "#D97706";

  if (status === "PAID") {
    bg = "#DCFCE7";
    color = "#16A34A";
  }

  if (status === "SUBMITTED") {
    bg = "#DBEAFE";
    color = "#2563EB";
  }

  if (status === "REJECTED") {
    bg = "#FEE2E2";
    color = "#DC2626";
  }

  return (
    <View style={[styles.statusBadge, { backgroundColor: bg }]}>
      <Text style={[styles.statusText, { color }]}>{status}</Text>
    </View>
  );
}

function getMonthName(monthNumber) {
  const months = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return months[Number(monthNumber)] || "-";
}

function formatAmount(value) {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  return Number(value).toLocaleString("en-IN");
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  container: {
    padding: 18,
    paddingBottom: 40,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loaderText: {
    marginTop: 10,
    fontSize: 15,
    color: "#6B7280",
  },

  summaryCard: {
    backgroundColor: "#2563EB",
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
  },

  summaryLabel: {
    fontSize: 14,
    color: "#DBEAFE",
    fontWeight: "700",
  },

  summaryAmount: {
    fontSize: 34,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 6,
  },

  summarySubText: {
    fontSize: 13,
    color: "#E0E7FF",
    marginTop: 6,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 14,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginTop: 12,
  },

  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6,
  },

  dueCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#EEF5FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  cardTitleBlock: {
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
    marginTop: 3,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },

  amountRow: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  amountLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },

  amount: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111827",
    marginTop: 3,
  },

  payButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 13,
  },

  payButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },

  noActionText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#6B7280",
  },

  footerRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  footerValue: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "700",
  },
});