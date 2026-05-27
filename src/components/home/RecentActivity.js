import React from "react";

import { View, Text, StyleSheet } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import AppCard from "../common/AppCard";
import { COLORS } from "../common/theme";

export default function RecentActivity({ dashboard }) {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
      </View>

      <AppCard style={styles.card}>
        <ActivityItem
          icon="checkmark-circle-outline"
          title="Payments Collected"
          subtitle="Total paid flats this month"
          amount={`${dashboard?.paidFlats ?? 0} flats`}
          status="Paid"
          statusColor={COLORS.success}
          statusBg="#DCFCE7"
        />

        <ActivityItem
          icon="time-outline"
          title="Pending Flats"
          subtitle="Flats with pending dues"
          amount={`${dashboard?.pendingFlats ?? 0} flats`}
          status="Pending"
          statusColor={COLORS.warning}
          statusBg="#FFEDD5"
        />

        <ActivityItem
          icon="sparkles-outline"
          title="Special Requests"
          subtitle="Collected this month"
          amount={`₹${formatAmount(dashboard?.specialRequestCollected)}`}
          status="Collected"
          statusColor={COLORS.purple}
          statusBg="#F3E8FF"
        />

        <ActivityItem
          icon="business-outline"
          title="Total Flats"
          subtitle="Registered flats in society"
          amount={`${dashboard?.totalFlats ?? 0}`}
          status="Info"
          statusColor={COLORS.primary}
          statusBg="#DBEAFE"
          hideBorder
        />
      </AppCard>
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
  hideBorder = false,
}) {
  return (
    <View style={[styles.item, hideBorder && styles.noBorder]}>
      <View style={styles.left}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={22} color={COLORS.primary} />
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
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 14,
  },

  card: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 30,
  },

  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },

  noBorder: {
    borderBottomWidth: 0,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 8,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 15,
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
    fontWeight: "800",
    color: COLORS.text,
  },

  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 3,
    fontWeight: "600",
  },

  right: {
    alignItems: "flex-end",
  },

  amount: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.textSecondary,
    marginBottom: 5,
  },

  statusPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },
});