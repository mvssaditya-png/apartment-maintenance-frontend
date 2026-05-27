import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import FlatSelector from "../components/common/FlatSelector";
import {
  getLoggedInUser,
  getFlatOptions,
  getFlatStatement,
  getFlatStatementExportUrl,
  getAllFlatStatementsExportUrl,
  getFullFileUrl,
} from "../api/dashboardApi";
import { Alert } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";
export default function PaymentHistoryScreen() {
  const [user, setUser] = useState(null);
  const [flats, setFlats] = useState([]);
  const [selectedFlat, setSelectedFlat] = useState(null);
  const [statement, setStatement] = useState([]);

  const [loading, setLoading] = useState(true);
  const [statementLoading, setStatementLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadInitialData();
    }, [])
  );

  const downloadAndShareExcel = async (url, fileName) => {
    try {
        const token = await AsyncStorage.getItem("token");

        const fileUri = FileSystem.documentDirectory + fileName;

        const result = await FileSystem.downloadAsync(
        url,
        fileUri,
        {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        }
        );

        if (result.status !== 200) {
        Alert.alert("Error", "Unable to export Excel.");
        return;
        }

        if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri, {
            mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            dialogTitle: "Share Statement",
            UTI: "com.microsoft.excel.xlsx",
        });
        } else {
        Alert.alert("Downloaded", "Excel exported successfully.");
        }

    } catch (error) {
        console.log("EXPORT STATEMENT ERROR:", error);
        Alert.alert("Error", "Unable to export Excel.");
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);

      const userRes = await getLoggedInUser();
      const loggedUser = userRes.data;
      setUser(loggedUser);

      const role = loggedUser?.role?.toUpperCase();

      if (role === "ADMIN" || role === "CASHIER") {
        const flatsRes = await getFlatOptions();
        setFlats(flatsRes.data || []);

        if (flatsRes.data?.length > 0) {
          const firstFlat = flatsRes.data[0];
          setSelectedFlat(firstFlat);
          await loadStatement(firstFlat.flatId);
        }
      } else {
        await loadStatement(loggedUser.flatId || loggedUser.flat_id);
      }
    } catch (error) {
      console.log("PAYMENT HISTORY ERROR:", error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatement = async (flatId) => {
    try {
      setStatementLoading(true);

      const res = await getFlatStatement(flatId);
      setStatement(res.data || []);
    } catch (error) {
      console.log("FLAT STATEMENT ERROR:", error?.response?.data || error);
      setStatement([]);
    } finally {
      setStatementLoading(false);
    }
  };

  const onSelectFlat = async (flat) => {
    setSelectedFlat(flat);
    await loadStatement(flat.flatId);
  };

  const onRefresh = async () => {
    setRefreshing(true);

    if (selectedFlat) {
      await loadStatement(selectedFlat.flatId);
    } else if (user?.flatId || user?.flat_id) {
      await loadStatement(user.flatId || user.flat_id);
    } else {
      await loadInitialData();
    }

    setRefreshing(false);
  };

  const handleExportSelectedFlat = async () => {
    const flatId =
        selectedFlat?.flatId ||
        user?.flatId ||
        user?.flat_id;

    if (!flatId) {
        Alert.alert("Error", "Flat not selected.");
        return;
    }

    await downloadAndShareExcel(
        getFlatStatementExportUrl(flatId),
        "flat-statement.xlsx"
    );
    };

    const handleExportAllFlats = async () => {
    await downloadAndShareExcel(
        getAllFlatStatementsExportUrl(),
        "all-flats-payment-history.xlsx"
    );
    };

  const isAdminOrCashier =
    user?.role?.toUpperCase() === "ADMIN" ||
    user?.role?.toUpperCase() === "CASHIER";

  const totalDebit = statement.reduce(
    (sum, item) => sum + Number(item.debit || 0),
    0
  );

  const totalCredit = statement.reduce(
    (sum, item) => sum + Number(item.credit || 0),
    0
  );

  const currentBalance =
  statement.length > 0
    ? Number(statement[statement.length - 1]?.balanceAfter || 0)
    : 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loaderText}>Loading payment history...</Text>
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
        <Text style={styles.heading}>Payment History</Text>
        <Text style={styles.subtitle}>
          View flat-wise dues, payments and running balance.
        </Text>

        {isAdminOrCashier && (
        <FlatSelector
            flats={flats}
            selectedFlat={selectedFlat}
            onSelectFlat={onSelectFlat}
        />
        )}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            {isAdminOrCashier
              ? `Flat ${selectedFlat?.flatNumber || "-"}`
              : `Flat ${user?.flatNumber || user?.flat_number || "-"}`}
          </Text>

          <Text style={styles.summaryAmount}>
            ₹{formatAmount(Math.abs(currentBalance))}
          </Text>

          <Text style={styles.summarySubText}>
            {Number(currentBalance || 0) < 0
              ? "Pending balance"
              : "Available balance"}
          </Text>
        </View>
        <View style={styles.exportRow}>
        <TouchableOpacity
            style={styles.exportButton}
            onPress={handleExportSelectedFlat}
        >
            <Text style={styles.exportButtonText}>
            Export Selected Flat
            </Text>
        </TouchableOpacity>

        {isAdminOrCashier && (
            <TouchableOpacity
            style={[styles.exportButton, styles.exportAllButton]}
            onPress={handleExportAllFlats}
            >
            <Text style={styles.exportButtonText}>
                Export All Flats
            </Text>
            </TouchableOpacity>
        )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Charges</Text>
            <Text style={styles.statDebit}>₹{formatAmount(totalDebit)}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Paid</Text>
            <Text style={styles.statCredit}>₹{formatAmount(totalCredit)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Statement</Text>

        {statementLoading ? (
          <View style={styles.statementLoader}>
            <ActivityIndicator color="#2563EB" />
            <Text style={styles.loaderText}>Loading statement...</Text>
          </View>
        ) : statement.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="document-text-outline" size={46} color="#2563EB" />
            <Text style={styles.emptyTitle}>No history found</Text>
            <Text style={styles.emptyText}>
              No payment statement entries are available.
            </Text>
          </View>
        ) : (
          statement.map((item, index) => (
            <StatementCard key={`${item.date}-${index}`} item={item} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatementCard({ item }) {
  const isCredit = Number(item.credit || 0) > 0;
  const amount = isCredit ? item.credit : item.debit;
  const balanceAfter = Number(item.balanceAfter || 0);

  const handleViewReceipt = () => {
    const receiptUrl = getFullFileUrl(item.receiptPdfUrl);

    if (receiptUrl) {
      Linking.openURL(receiptUrl);
    }
  };

  return (
    <View style={styles.statementCard}>
      <View style={styles.statementTop}>
        <View
          style={[
            styles.statementIconBox,
            {
              backgroundColor: isCredit ? "#ECFDF5" : "#FEF2F2",
            },
          ]}
        >
          <Ionicons
            name={
              isCredit
                ? "arrow-down-circle-outline"
                : "arrow-up-circle-outline"
            }
            size={24}
            color={isCredit ? "#16A34A" : "#DC2626"}
          />
        </View>

        <View style={styles.statementTextBlock}>
          <Text style={styles.statementTitle}>{item.description}</Text>
          <Text style={styles.statementDate}>{formatDate(item.date)}</Text>
        </View>

        <Text
          style={[
            styles.statementAmount,
            { color: isCredit ? "#16A34A" : "#DC2626" },
          ]}
        >
          {isCredit ? "+" : "-"}₹{formatAmount(amount)}
        </Text>
      </View>

      <View style={styles.balanceRow}>
        <Text style={styles.balanceLabel}>
          {balanceAfter < 0 ? "Pending After" : "Balance After"}
        </Text>

        <Text
          style={[
            styles.balanceValue,
            {
              color: balanceAfter < 0 ? "#DC2626" : "#16A34A",
            },
          ]}
        >
          ₹{formatAmount(Math.abs(balanceAfter))}
        </Text>
      </View>

      {isCredit && item.receiptPdfUrl ? (
        <TouchableOpacity
          style={styles.receiptButton}
          onPress={handleViewReceipt}
          activeOpacity={0.8}
        >
          <Ionicons name="document-text-outline" size={18} color="#2563EB" />
          <Text style={styles.receiptButtonText}>View Receipt PDF</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function formatAmount(value) {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  return Number(value).toLocaleString("en-IN");
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
    backgroundColor: "#F5F7FB",
  },

  container: {
    padding: 18,
    paddingBottom: 100,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loaderText: {
    marginTop: 10,
    fontSize: 14,
    color: "#6B7280",
  },

  heading: {
    fontSize: 30,
    fontWeight: "900",
    color: "#111827",
  },

  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 22,
    lineHeight: 22,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
  },

  flatScroll: {
    marginBottom: 18,
  },

  flatChip: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },

  flatChipActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  flatChipText: {
    color: "#374151",
    fontWeight: "800",
  },

  flatChipTextActive: {
    color: "#FFFFFF",
  },

  summaryCard: {
    backgroundColor: "#2563EB",
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
  },

  summaryLabel: {
    color: "#DBEAFE",
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
    color: "#E0E7FF",
    fontSize: 13,
    marginTop: 6,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  statLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "700",
  },

  statDebit: {
    fontSize: 20,
    fontWeight: "900",
    color: "#DC2626",
    marginTop: 6,
  },

  statCredit: {
    fontSize: 20,
    fontWeight: "900",
    color: "#16A34A",
    marginTop: 6,
  },

  statementLoader: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
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

  statementCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  statementTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  statementIconBox: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  statementTextBlock: {
    flex: 1,
  },

  statementTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },

  statementDate: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },

  statementAmount: {
    fontSize: 16,
    fontWeight: "900",
  },

  balanceRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  balanceLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "700",
  },

  balanceValue: {
    fontSize: 14,
    fontWeight: "900",
  },

  exportRow: {
    marginBottom: 20,
  },

  exportButton: {
    backgroundColor: "#16A34A",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10,
  },

  exportAllButton: {
    backgroundColor: "#2563EB",
  },

  exportButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  receiptButton: {
    marginTop: 12,
    backgroundColor: "#EEF4FF",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  receiptButtonText: {
    color: "#2563EB",
    fontWeight: "900",
    marginLeft: 6,
  },
});