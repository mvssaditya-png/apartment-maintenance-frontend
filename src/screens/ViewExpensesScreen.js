import React, { useCallback, useContext, useState } from "react";

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

import API from "../api/axios";
import { getExpenses } from "../api/dashboardApi";

import ImagePreviewModal from "../components/common/ImagePreviewModal";

import AppCard from "../components/common/AppCard";
import EmptyState from "../components/common/EmptyState";

import { COLORS } from "../components/common/theme";
import { t } from "../i18n";
import { LanguageContext } from "../context/LanguageContext";

export default function ViewExpensesScreen() {
  const { language } = useContext(LanguageContext);

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [])
  );

  const loadExpenses = async () => {
    try {
      setLoading(true);

      const res = await getExpenses();

      setExpenses(res.data || []);
    } catch (error) {
      console.log("VIEW EXPENSES ERROR:", error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  };

  const totalExpenses = expenses.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const getFullImageUrl = (receiptUrl) => {
    if (!receiptUrl) return null;

    if (receiptUrl.startsWith("http")) {
      return receiptUrl;
    }

    return API.defaults.baseURL.replace("/api", "") + receiptUrl;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />

          <Text style={styles.loaderText}>
            {t("viewExpenses.loading")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <AppCard style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View style={styles.summaryTextBlock}>
              <Text style={styles.summaryLabel}>
                {t("viewExpenses.totalExpenses")}
              </Text>

              <Text style={styles.summaryAmount}>
                ₹{formatAmount(totalExpenses)}
              </Text>

              <Text style={styles.summarySubText}>
                {t("viewExpenses.summarySubtitle")}
              </Text>
            </View>

            <View style={styles.summaryIconBox}>
              <Ionicons name="wallet-outline" size={30} color="#FFFFFF" />
            </View>
          </View>
        </AppCard>

        <Text style={styles.sectionTitle}>
          {t("viewExpenses.expenseList")}
        </Text>

        {expenses.length === 0 ? (
          <AppCard>
            <EmptyState
              icon="receipt-outline"
              title={t("viewExpenses.noExpenses")}
              subtitle={t("viewExpenses.noExpensesSubtitle")}
            />
          </AppCard>
        ) : (
          expenses.map((item) => (
            <AppCard key={item.expenseId} style={styles.card}>
              <View style={styles.topRow}>
                <View style={styles.iconBox}>
                  <Ionicons name="wallet-outline" size={24} color="#DC2626" />
                </View>

                <View style={styles.titleBlock}>
                  <Text style={styles.title}>{item.title}</Text>

                  <Text style={styles.subtitle}>
                    {formatCategory(item.category)} • {formatDate(item.expenseDate)}
                  </Text>
                </View>

                <Text style={styles.amount}>
                  ₹{formatAmount(item.amount)}
                </Text>
              </View>

              {item.description ? (
                <Text style={styles.description}>{item.description}</Text>
              ) : null}

              {item.receiptUrl ? (
                <TouchableOpacity
                  style={styles.receiptPreviewBox}
                  onPress={() =>
                    setPreviewImageUrl(getFullImageUrl(item.receiptUrl))
                  }
                  activeOpacity={0.85}
                >
                  <View style={styles.receiptIconCircle}>
                    <Ionicons
                      name="image-outline"
                      size={32}
                      color={COLORS.primary}
                    />
                  </View>

                  <Text style={styles.previewTitle}>
                    {t("submittedPayments.receiptUploaded")}
                  </Text>

                  <Text style={styles.previewSubtitle}>
                    {t("viewExpenses.tapToViewImage")}
                  </Text>
                </TouchableOpacity>
              ) : null}

              <View style={styles.footerRow}>
                <View style={styles.footerInfo}>
                  <Ionicons
                    name="document-text-outline"
                    size={14}
                    color={COLORS.textMuted}
                  />

                  <Text style={styles.footerLabel}>
                    {t("viewExpenses.expenseId")}
                  </Text>
                </View>

                <Text style={styles.footerValue}>
                  {String(item.expenseId).substring(0, 8)}...
                </Text>
              </View>
            </AppCard>
          ))
        )}
      </ScrollView>

      <ImagePreviewModal
        visible={!!previewImageUrl}
        imageUrl={previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
      />
    </SafeAreaView>
  );
}

function formatAmount(value) {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  return Number(value).toLocaleString("en-IN");
}

function formatCategory(value) {
  if (!value) return "-";

  switch (value) {
    case "MAINTENANCE":
      return t("addExpense.categories.maintenance");

    case "REPAIR":
      return t("addExpense.categories.repair");

    case "ELECTRICITY":
      return t("addExpense.categories.electricity");

    case "WATER":
      return t("addExpense.categories.water");

    case "SECURITY":
      return t("addExpense.categories.security");

    case "CLEANING":
      return t("addExpense.categories.cleaning");

    case "OTHER":
      return t("addExpense.categories.other");

    default:
      return value;
  }
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return String(value).substring(0, 10);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    color: COLORS.textMuted,
    fontWeight: "600",
  },

  summaryCard: {
    backgroundColor: "#DC2626",
    borderWidth: 0,
    borderRadius: 26,
    marginBottom: 24,
  },

  summaryTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  summaryTextBlock: {
    flex: 1,
    paddingRight: 14,
  },

  summaryLabel: {
    color: "#FEE2E2",
    fontSize: 14,
    fontWeight: "700",
  },

  summaryAmount: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "900",
    marginTop: 6,
  },

  summarySubText: {
    color: "#FEE2E2",
    fontSize: 13,
    marginTop: 6,
    fontWeight: "600",
  },

  summaryIconBox: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionTitle: {
    fontSize: 23,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 14,
  },

  card: {
    marginBottom: 16,
    borderRadius: 22,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  titleBlock: {
    flex: 1,
    paddingRight: 8,
  },

  title: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
  },

  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
    fontWeight: "600",
  },

  amount: {
    fontSize: 18,
    fontWeight: "900",
    color: "#DC2626",
  },

  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 14,
    lineHeight: 22,
    fontWeight: "500",
  },

  receiptPreviewBox: {
    marginTop: 18,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  receiptIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 24,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  previewTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#1E3A8A",
  },

  previewSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
    fontWeight: "600",
  },

  footerRow: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  footerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },

  footerLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: 5,
    fontWeight: "700",
  },

  footerValue: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "900",
  },
});