import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
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

export default function DefaultersScreen() {
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
        Alert.alert("Error", "Unable to export Excel file.");
        return;
      }

      const canShare = await Sharing.isAvailableAsync();

      if (canShare) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          dialogTitle: "Share Defaulters Report",
          UTI: "com.microsoft.excel.xlsx",
        });
      } else {
        Alert.alert("Downloaded", "Excel file downloaded successfully.");
      }
    } catch (error) {
      console.log("EXPORT EXCEL ERROR:", error);
      Alert.alert("Error", "Unable to export Excel file.");
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
          <Text style={styles.loaderText}>Loading defaulters...</Text>
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
              <Text style={styles.summaryLabel}>Total Pending</Text>

              <Text style={styles.summaryAmount}>
                ₹{formatAmount(totalDue)}
              </Text>

              <Text style={styles.summarySubText}>
                {defaulters.length} defaulter flat
                {defaulters.length === 1 ? "" : "s"} found
              </Text>
            </View>

            <View style={styles.summaryIconBox}>
              <Ionicons name="warning-outline" size={32} color="#FFFFFF" />
            </View>
          </View>
        </AppCard>

        <AppButton
          title="Export Excel"
          variant="success"
          onPress={handleExportExcel}
          style={styles.exportButton}
        />

        <Text style={styles.sectionTitle}>Defaulter Flats</Text>

        {defaulters.length === 0 ? (
          <AppCard>
            <EmptyState
              icon="checkmark-circle-outline"
              title="No defaulters"
              subtitle="All residents have cleared their dues."
            />
          </AppCard>
        ) : (
          defaulters.map((item, index) => (
            <AppCard key={`${item.flatNumber}-${index}`} style={styles.card}>
              <View style={styles.topRow}>
                <View style={styles.iconBox}>
                  <Ionicons name="home-outline" size={24} color="#DC2626" />
                </View>

                <View style={styles.titleBlock}>
                  <Text style={styles.flatNumber}>Flat {item.flatNumber}</Text>

                  <Text style={styles.ownerName}>
                    {item.ownerName || "Resident"}
                  </Text>
                </View>

                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {item.pendingMonths || 0} month
                    {Number(item.pendingMonths || 0) > 1 ? "s" : ""}
                  </Text>
                </View>
              </View>

              <View style={styles.amountRow}>
                <View>
                  <Text style={styles.amountLabel}>Total Due</Text>

                  <Text style={styles.amount}>
                    ₹{formatAmount(item.totalDue)}
                  </Text>
                </View>

                <View style={styles.alertCircle}>
                  <Ionicons name="alert-circle-outline" size={22} color="#DC2626" />
                </View>
              </View>
            </AppCard>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
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
    backgroundColor: "rgba(255,255,255,0.18)",
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

  badge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  badgeText: {
    color: "#DC2626",
    fontSize: 11,
    fontWeight: "900",
  },

  amountRow: {
    marginTop: 16,
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
    fontSize: 24,
    fontWeight: "900",
    color: "#DC2626",
    marginTop: 4,
  },

  alertCircle: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
});