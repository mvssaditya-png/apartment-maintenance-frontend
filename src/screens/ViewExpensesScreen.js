import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  TouchableOpacity,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import API from "../api/axios";
import { getExpenses } from "../api/dashboardApi";
import ImagePreviewModal from "../components/common/ImagePreviewModal";

export default function ViewExpensesScreen({ navigation }) {
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
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loaderText}>Loading expenses...</Text>
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
          <Text style={styles.summaryLabel}>Total Expenses</Text>
          <Text style={styles.summaryAmount}>₹{formatAmount(totalExpenses)}</Text>
          <Text style={styles.summarySubText}>
            Society expenses recorded so far
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Expense List</Text>

        {expenses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={46} color="#2563EB" />
            <Text style={styles.emptyTitle}>No expenses found</Text>
            <Text style={styles.emptyText}>
              No society expenses have been added yet.
            </Text>
          </View>
        ) : (
          expenses.map((item) => (
            <View key={item.expenseId} style={styles.card}>
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

                <Text style={styles.amount}>₹{formatAmount(item.amount)}</Text>
              </View>

              {item.description ? (
                <Text style={styles.description}>{item.description}</Text>
              ) : null}

              {item.receiptUrl ? (
                <TouchableOpacity
                    style={styles.receiptPreviewBox}
                    onPress={() =>
                    setPreviewImageUrl(
                        getFullImageUrl(item.receiptUrl)
                    )
                    }
                    activeOpacity={0.8}
                >

                    <Ionicons
                    name="image-outline"
                    size={30}
                    color="#2563EB"
                    />

                    <Text style={styles.previewTitle}>
                    Receipt Uploaded
                    </Text>

                    <Text style={styles.previewSubtitle}>
                    Tap to view image
                    </Text>

                </TouchableOpacity>
                ) : null}

              <View style={styles.footerRow}>
                <Text style={styles.footerLabel}>Expense ID</Text>
                <Text style={styles.footerValue}>
                  {String(item.expenseId).substring(0, 8)}...
                </Text>
              </View>
            </View>
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
  if (value === null || value === undefined || value === "") return "0";
  return Number(value).toLocaleString("en-IN");
}

function formatCategory(value) {
  if (!value) return "-";
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function formatDate(value) {
  if (!value) return "-";
  return String(value).substring(0, 10);
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

  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 3,
  },

  amount: {
    fontSize: 16,
    fontWeight: "900",
    color: "#DC2626",
  },

  description: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 14,
    lineHeight: 20,
  },

  receiptImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    marginTop: 16,
  },

  footerRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  footerLabel: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  footerValue: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "700",
  },
  receiptPreviewBox: {
  marginTop: 16,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "#DBEAFE",
  backgroundColor: "#EFF6FF",
  paddingVertical: 24,
  alignItems: "center",
  justifyContent: "center",
},

previewTitle: {
  fontSize: 15,
  fontWeight: "800",
  color: "#1E3A8A",
  marginTop: 10,
},

previewSubtitle: {
  fontSize: 13,
  color: "#6B7280",
  marginTop: 4,
},
modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.55)",
  justifyContent: "center",
  alignItems: "center",
  padding: 18,
},

modalContent: {
  width: "100%",
  height: "75%",
  backgroundColor: "#FFFFFF",
  borderRadius: 22,
  overflow: "hidden",
},

closeButton: {
  position: "absolute",
  top: 16,
  right: 16,
  zIndex: 10,
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: "rgba(17,24,39,0.85)",
  alignItems: "center",
  justifyContent: "center",
},

modalImage: {
  width: "100%",
  height: "100%",
},
receiptPreviewBox: {
  marginTop: 16,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "#DBEAFE",
  backgroundColor: "#EFF6FF",
  paddingVertical: 24,
  alignItems: "center",
  justifyContent: "center",
},

previewTitle: {
  fontSize: 15,
  fontWeight: "800",
  color: "#1E3A8A",
  marginTop: 10,
},

previewSubtitle: {
  fontSize: 13,
  color: "#6B7280",
  marginTop: 4,
},
});