import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { getMyDues } from "../api/dashboardApi";

import AppCard from "../components/common/AppCard";
import AppButton from "../components/common/AppButton";
import EmptyState from "../components/common/EmptyState";
import StatusBadge from "../components/common/StatusBadge";
import { COLORS } from "../components/common/theme";

import { t } from "../i18n";

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

  const pendingCount = dues.filter(
    (item) =>
      item.paymentStatus === "PENDING" ||
      item.paymentStatus === "REJECTED"
  ).length;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />

          <Text style={styles.loaderText}>
            {t("myDues.loadingDues")}
          </Text>
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryLabel}>
                {t("myDues.totalPendingDue")}
              </Text>

              <Text style={styles.summaryAmount}>
                ₹{formatAmount(totalPending)}
              </Text>
            </View>

            <View style={styles.summaryIconBox}>
              <Ionicons
                name="wallet-outline"
                size={30}
                color={COLORS.white}
              />
            </View>
          </View>

          <View style={styles.summaryFooter}>
            <Text style={styles.summarySubText}>
              {t("myDues.includesMaintenance")}
            </Text>

            <View style={styles.countPill}>
              <Text style={styles.countPillText}>
                {pendingCount} {t("myDues.pending")}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t("myDues.title")}
          </Text>

          <Text style={styles.sectionCount}>
            {dues.length} {t("myDues.requests")}
          </Text>
        </View>

        {dues.length === 0 ? (
          <AppCard>
            <EmptyState
              icon="checkmark-circle-outline"
              title={t("myDues.noDues")}
              subtitle={t("myDues.noPending")}
            />
          </AppCard>
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
    status === "PENDING" ||
    status === "REJECTED";

  const iconName =
    item.requestType === "Maintenance"
      ? "home-outline"
      : "alert-circle-outline";

  return (
    <AppCard style={styles.dueCard}>
      <View style={styles.cardTop}>
        <View style={styles.iconBox}>
          <Ionicons
            name={iconName}
            size={24}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.cardTitleBlock}>
          <Text style={styles.cardTitle}>
            {item.requestType || t("myDues.paymentRequest")}
          </Text>

          {item.requestType === "Special Request" &&
          (item.description || item.requestTitle) ? (
            <Text style={styles.specialRequestText}>
              {item.description || item.requestTitle}
            </Text>
          ) : null}

          <Text style={styles.cardSubtitle}>
            {getMonthName(item.paymentMonth)}{" "}
            {item.paymentYear}
          </Text>
        </View>

        <StatusBadge status={status} />
      </View>

      <View style={styles.amountRow}>
        <View>
          <Text style={styles.amountLabel}>
            {t("myDues.amount")}
          </Text>

          <Text style={styles.amount}>
            ₹{formatAmount(item.amount)}
          </Text>
        </View>

        {isPending ? (
          <AppButton
            title={t("myDues.payNow")}
            onPress={onPay}
            style={styles.payButton}
          />
        ) : (
          <Text style={styles.noActionText}>
            {status}
          </Text>
        )}
      </View>

      <View style={styles.footerRow}>
        <View style={styles.footerItem}>
          <Ionicons
            name="document-text-outline"
            size={14}
            color={COLORS.textMuted}
          />

          <Text style={styles.footerText}>
            {t("myDues.paymentId")}
          </Text>
        </View>

        <Text style={styles.footerValue}>
          {String(item.paymentId).substring(0, 8)}...
        </Text>
      </View>
    </AppCard>
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
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "0";
  }

  return Number(value).toLocaleString("en-IN");
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    padding: 18,
    paddingBottom: 50,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loaderText: {
    marginTop: 10,
    fontSize: 15,
    color: COLORS.textMuted,
    fontWeight: "600",
  },

  summaryCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 26,
    padding: 20,
    marginBottom: 24,
  },

  summaryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  summaryLabel: {
    fontSize: 14,
    color: "#DBEAFE",
    fontWeight: "800",
  },

  summaryAmount: {
    fontSize: 36,
    fontWeight: "900",
    color: COLORS.white,
    marginTop: 6,
  },

  summaryIconBox: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryFooter: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  summarySubText: {
    fontSize: 13,
    color: "#E0E7FF",
    fontWeight: "600",
    flex: 1,
    paddingRight: 10,
  },

  countPill: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  countPillText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "900",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
  },

  sectionCount: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "800",
  },

  dueCard: {
    marginBottom: 14,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: "#EEF5FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  cardTitleBlock: {
    flex: 1,
    paddingRight: 8,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
  },

  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 3,
    fontWeight: "600",
  },

  amountRow: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  amountLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "700",
  },

  amount: {
    fontSize: 25,
    fontWeight: "900",
    color: COLORS.text,
    marginTop: 3,
  },

  payButton: {
    paddingHorizontal: 18,
    paddingVertical: 11,
  },

  noActionText: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.textMuted,
  },

  footerRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  footerItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  footerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: 5,
    fontWeight: "600",
  },

  footerValue: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "800",
  },
  specialRequestText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "800",
    marginTop: 3,
  },
});