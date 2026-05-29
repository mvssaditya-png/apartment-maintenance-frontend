import React, { useCallback, useContext, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getDefaulters,
  getDefaultersExportUrl,
} from "../api/dashboardApi";

import AppCard from "../components/common/AppCard";
import AppButton from "../components/common/AppButton";
import EmptyState from "../components/common/EmptyState";

import { COLORS } from "../components/common/theme";

import { t } from "../i18n";
import { LanguageContext } from "../context/LanguageContext";

export default function DefaultersScreen() {
  const { language } = useContext(LanguageContext);

  const [defaulters, setDefaulters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadDefaulters();
    }, [])
  );

  const loadDefaulters = async () => {
    try {
      setLoading(true);

      const res = await getDefaulters();

      setDefaulters(res.data || []);
    } catch (error) {
      console.log("DEFAULTERS ERROR:", error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDefaulters();
    setRefreshing(false);
  };

  const handleExportExcel = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const fileUri =
        FileSystem.documentDirectory + "defaulters-report.xlsx";

      const downloadResult = await FileSystem.downloadAsync(
        getDefaultersExportUrl(),
        fileUri,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (downloadResult.status !== 200) {
        Alert.alert(
          t("common.error"),
          t("defaulters.exportFailed")
        );
        return;
      }

      const canShare = await Sharing.isAvailableAsync();

      if (canShare) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          dialogTitle: t("defaulters.shareReport"),
          UTI: "com.microsoft.excel.xlsx",
        });
      } else {
        Alert.alert(
          t("defaulters.downloaded"),
          t("defaulters.downloadedSuccess")
        );
      }
    } catch (error) {
      console.log("EXPORT EXCEL ERROR:", error);

      Alert.alert(
        t("common.error"),
        t("defaulters.exportFailed")
      );
    }
  };

  const totalDue = defaulters.reduce(
    (sum, item) => sum + Number(item.totalDue || 0),
    0
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />

          <Text style={styles.loaderText}>
            {t("defaulters.loading")}
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
                {t("defaulters.totalPending")}
              </Text>

              <Text style={styles.summaryAmount}>
                ₹{formatAmount(totalDue)}
              </Text>

              <Text style={styles.summarySubText}>
                {defaulters.length}{" "}
                {t("defaulters.defaulterFlatsFound")}
              </Text>
            </View>

            <View style={styles.summaryIconBox}>
              <Ionicons
                name="warning-outline"
                size={32}
                color="#FFFFFF"
              />
            </View>
          </View>
        </AppCard>

        <AppButton
          title={t("defaulters.exportExcel")}
          variant="success"
          onPress={handleExportExcel}
          style={styles.exportButton}
        />

        <Text style={styles.sectionTitle}>
          {t("defaulters.defaulterFlats")}
        </Text>

        {defaulters.length === 0 ? (
          <AppCard>
            <EmptyState
              icon="checkmark-circle-outline"
              title={t("defaulters.noDefaulters")}
              subtitle={t("defaulters.allResidentsPaid")}
            />
          </AppCard>
        ) : (
          defaulters.map((item, index) => (
            <AppCard
              key={`${item.flatNumber}-${index}`}
              style={styles.card}
            >
              <View style={styles.topRow}>
                <View style={styles.iconBox}>
                  <Ionicons
                    name="home-outline"
                    size={24}
                    color="#DC2626"
                  />
                </View>

                <View style={styles.titleBlock}>
                  <Text style={styles.flatNumber}>
                    {t("home.flat")} {item.flatNumber}
                  </Text>

                  <Text style={styles.ownerName}>
                    {item.ownerName || t("defaulters.resident")}
                  </Text>
                </View>
              </View>

              <View style={styles.breakupContainer}>
                <DueBreakup
                  title={t("defaulters.maintenance")}
                  pending={formatMonthCount(
                    item.maintenancePendingMonths
                  )}
                  amount={item.maintenanceDue}
                  icon="construct-outline"
                  iconColor="#2563EB"
                  iconBg="#EEF5FF"
                />

                <DueBreakup
                  title={t("defaulters.specialRequests")}
                  pending={formatRequestCount(
                    item.specialRequestCount
                  )}
                  amount={item.specialRequestDue}
                  icon="sparkles-outline"
                  iconColor="#7C3AED"
                  iconBg="#F3E8FF"
                />

                {Number(item.otherPendingCount || 0) > 0 ? (
                  <DueBreakup
                    title={t("defaulters.other")}
                    pending={formatItemCount(item.otherPendingCount)}
                    amount={item.otherDue}
                    icon="document-text-outline"
                    iconColor="#F97316"
                    iconBg="#FFEDD5"
                  />
                ) : null}
              </View>

              <View style={styles.totalRow}>
                <View>
                  <Text style={styles.totalLabel}>
                    {t("defaulters.totalDue")}
                  </Text>

                  <Text style={styles.totalAmount}>
                    ₹{formatAmount(item.totalDue)}
                  </Text>
                </View>

                <View style={styles.alertCircle}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={24}
                    color="#DC2626"
                  />
                </View>
              </View>
            </AppCard>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DueBreakup({
  title,
  pending,
  amount,
  icon,
  iconColor,
  iconBg,
}) {
  return (
    <View style={styles.breakupRow}>
      <View style={styles.breakupLeft}>
        <View
          style={[
            styles.breakupIconBox,
            { backgroundColor: iconBg },
          ]}
        >
          <Ionicons
            name={icon}
            size={19}
            color={iconColor}
          />
        </View>

        <View>
          <Text style={styles.breakupTitle}>
            {title}
          </Text>

          <Text style={styles.breakupPending}>
            {t("defaulters.pending")}: {pending}
          </Text>
        </View>
      </View>

      <Text style={styles.breakupAmount}>
        ₹{formatAmount(amount)}
      </Text>
    </View>
  );
}

function formatMonthCount(value) {
  const count = Number(value || 0);

  return `${count} ${t("defaulters.months")}`;
}

function formatRequestCount(value) {
  const count = Number(value || 0);

  return `${count} ${t("defaulters.requests")}`;
}

function formatItemCount(value) {
  const count = Number(value || 0);

  return `${count} ${t("defaulters.items")}`;
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
    marginBottom: 18,
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
    backgroundColor:
      "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  exportButton: {
    marginBottom: 22,
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
    paddingRight: 10,
  },

  flatNumber: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.text,
  },

  ownerName: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
    fontWeight: "600",
  },

  breakupContainer: {
    marginTop: 18,
    borderRadius: 18,
    backgroundColor: "#F9FAFB",
    padding: 12,
  },

  breakupRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },

  breakupLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
  },

  breakupIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  breakupTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },

  breakupPending: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 3,
    fontWeight: "600",
  },

  breakupAmount: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.textSecondary,
  },

  totalRow: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  totalLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "700",
  },

  totalAmount: {
    fontSize: 26,
    fontWeight: "900",
    color: "#DC2626",
    marginTop: 4,
  },

  alertCircle: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
});