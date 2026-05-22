import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function OverviewStats({ summary, dashboard }) {
  const totalCollection =
    summary?.totalCollection ??
    summary?.collection ??
    summary?.totalPaid ??
    dashboard?.totalCollected ??
    0;

  const totalExpenses =
    summary?.totalExpenses ??
    summary?.expenses ??
    summary?.totalExpense ??
    dashboard?.totalExpenses ??
    0;

  const openingBalance =
    summary?.openingBalance ??
    dashboard?.openingBalance ??
    0;

  const closingBalance =
    summary?.closingBalance ??
    dashboard?.currentBalance ??
    0;

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.monthText}>This Month</Text>
      </View>

      <View style={styles.grid}>
        <StatCard
          title="Paid This Month"
          amount={`₹${formatAmount(totalCollection)}`}
          icon="trending-up-outline"
          iconColor="#16A34A"
          bg="#ECFDF5"
        />

        <StatCard
          title="Expenses"
          amount={`₹${formatAmount(totalExpenses)}`}
          icon="trending-down-outline"
          iconColor="#DC2626"
          bg="#FEF2F2"
        />

        <StatCard
          title="Opening Balance"
          amount={`₹${formatAmount(openingBalance)}`}
          icon="card-outline"
          iconColor="#2563EB"
          bg="#EEF5FF"
        />

        <StatCard
          title="Closing Balance"
          amount={`₹${formatAmount(closingBalance)}`}
          icon="pie-chart-outline"
          iconColor="#7C3AED"
          bg="#F3E8FF"
        />
      </View>
    </>
  );
}

function StatCard({ title, amount, icon, iconColor, bg }) {
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Text style={styles.title}>{title}</Text>

        <View style={[styles.iconBox, { backgroundColor: bg }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
      </View>

      <Text style={styles.amount}>{amount}</Text>
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 14,
  },

  monthText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 14,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
    flex: 1,
  },

  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  amount: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    marginTop: 14,
  },
});