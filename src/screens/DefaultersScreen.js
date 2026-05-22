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

import { Alert, TouchableOpacity } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDefaulters, getDefaultersExportUrl } from "../api/dashboardApi";

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
          <ActivityIndicator size="large" color="#2563EB" />
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Pending</Text>
          <Text style={styles.summaryAmount}>₹{formatAmount(totalDue)}</Text>
          <Text style={styles.summarySubText}>
            {defaulters.length} defaulter flats found
          </Text>
        </View>
        <TouchableOpacity
        style={styles.exportButton}
        onPress={handleExportExcel}
        >
        <Text style={styles.exportButtonText}>Export Excel</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Defaulter Flats</Text>

        {defaulters.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-circle-outline" size={46} color="#16A34A" />
            <Text style={styles.emptyTitle}>No defaulters</Text>
            <Text style={styles.emptyText}>
              All residents have cleared their dues.
            </Text>
          </View>
        ) : (
          defaulters.map((item, index) => (
            <View
              key={`${item.flatNumber}-${index}`}
              style={styles.card}
            >
              <View style={styles.topRow}>
                <View style={styles.iconBox}>
                  <Ionicons name="home-outline" size={24} color="#DC2626" />
                </View>

                <View style={styles.titleBlock}>
                  <Text style={styles.flatNumber}>
                    Flat {item.flatNumber}
                  </Text>
                  <Text style={styles.ownerName}>
                    {item.ownerName}
                  </Text>
                </View>

                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {item.pendingMonths} month
                    {item.pendingMonths > 1 ? "s" : ""}
                  </Text>
                </View>
              </View>

              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Total Due</Text>
                <Text style={styles.amount}>
                  ₹{formatAmount(item.totalDue)}
                </Text>
              </View>
            </View>
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
    backgroundColor: "#DC2626",
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
  },

  summaryLabel: {
    color: "#FEE2E2",
    fontSize: 14,
    fontWeight: "700",
  },

  summaryAmount: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    marginTop: 6,
  },

  summarySubText: {
    color: "#FEE2E2",
    fontSize: 13,
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

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  titleBlock: {
    flex: 1,
  },

  flatNumber: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
  },

  ownerName: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 3,
  },

  badge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },

  badgeText: {
    color: "#DC2626",
    fontSize: 11,
    fontWeight: "800",
  },

  amountRow: {
    marginTop: 16,
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
    fontWeight: "700",
  },

  amount: {
    fontSize: 22,
    fontWeight: "900",
    color: "#DC2626",
  },
  exportButton: {
  backgroundColor: "#16A34A",
  paddingVertical: 14,
  borderRadius: 14,
  alignItems: "center",
  marginBottom: 22,
},

exportButtonText: {
  color: "#FFFFFF",
  fontSize: 15,
  fontWeight: "800",
},
});