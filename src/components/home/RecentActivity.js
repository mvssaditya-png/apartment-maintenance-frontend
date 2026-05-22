import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function RecentActivity({ dashboard }) {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Text style={styles.viewAll}>View All</Text>
      </View>

      <View style={styles.card}>
        <ActivityItem
          icon="checkmark-circle-outline"
          title="Payments Collected"
          subtitle="Total paid flats this month"
          amount={`${dashboard?.paidFlats ?? 0} flats`}
          status="Paid"
          statusColor="#16A34A"
          statusBg="#DCFCE7"
        />

        <ActivityItem
          icon="time-outline"
          title="Pending Flats"
          subtitle="Flats with pending dues"
          amount={`${dashboard?.pendingFlats ?? 0} flats`}
          status="Pending"
          statusColor="#EA580C"
          statusBg="#FFEDD5"
        />

        <ActivityItem
          icon="sparkles-outline"
          title="Special Requests"
          subtitle="Collected this month"
          amount={`₹${formatAmount(dashboard?.specialRequestCollected)}`}
          status="Collected"
          statusColor="#7C3AED"
          statusBg="#F3E8FF"
        />

        <ActivityItem
          icon="business-outline"
          title="Total Flats"
          subtitle="Registered flats in society"
          amount={`${dashboard?.totalFlats ?? 0}`}
          status="Info"
          statusColor="#2563EB"
          statusBg="#DBEAFE"
        />
      </View>
    </>
  );
}

function ActivityItem({
  icon,
  title,
  subtitle,
  amount,
  status,
  statusColor,
  statusBg,
}) {
  return (
    <View style={styles.item}>
      <View style={styles.left}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={22} color="#2563EB" />
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.amount}>{amount}</Text>

        <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {status}
          </Text>
        </View>
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

  viewAll: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 14,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#EEF5FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  textBlock: {
    flex: 1,
  },

  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 3,
  },

  right: {
    alignItems: "flex-end",
  },

  amount: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 5,
  },

  statusPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
});