import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getLoggedInUser } from "../api/dashboardApi";
import API from "../api/axios";
import ImagePreviewModal from "../components/common/ImagePreviewModal";
import {
  getSubmittedPayments,
  verifyPayment,
} from "../api/dashboardApi";

export default function SubmittedPaymentsScreen() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [user, setUser] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  useFocusEffect(
    useCallback(() => {
      loadPayments();
    }, [])
  );

  const loadPayments = async () => {
    try {
        setLoading(true);

        const [userRes, paymentsRes] = await Promise.all([
        getLoggedInUser(),
        getSubmittedPayments(),
        ]);

        setUser(userRes.data);
        setPayments(paymentsRes.data || []);
    } catch (error) {
        console.log("SUBMITTED PAYMENTS ERROR:", error?.response?.data || error);
    } finally {
        setLoading(false);
    }
  };
  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  };

  const handleVerify = (paymentId, approved) => {
    Alert.alert(
      approved ? "Approve Payment" : "Reject Payment",
      approved
        ? "Are you sure you want to approve this payment?"
        : "Are you sure you want to reject this payment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: approved ? "Approve" : "Reject",
          style: approved ? "default" : "destructive",
          onPress: async () => {
            try {
              setActionLoadingId(paymentId);

              await verifyPayment(paymentId, approved);

            Alert.alert(
                "Success",
                approved
                  ? "Payment approved successfully."
                  : "Payment rejected successfully."
              );

              await loadPayments();

            } catch (error) {
              console.log(
                "VERIFY PAYMENT ERROR:",
                error?.response?.data || error
              );

              Alert.alert(
                "Error",
                approved
                  ? "Unable to approve payment."
                  : "Unable to reject payment."
              );
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ]
    );
  };

  const getFullImageUrl = (receiptUrl) => {
    if (!receiptUrl) return null;

    if (receiptUrl.startsWith("http")) {
      return receiptUrl;
    }

    return API.defaults.baseURL.replace("/api", "") + receiptUrl;
  };
  const isCashier = user?.role?.toUpperCase() === "CASHIER";
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loaderText}>
            Loading submitted payments...
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Submitted Payments</Text>

        {payments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="checkmark-circle-outline"
              size={46}
              color="#16A34A"
            />

            <Text style={styles.emptyTitle}>
              No submitted payments
            </Text>

            <Text style={styles.emptyText}>
              No resident payments are waiting for approval.
            </Text>
          </View>
        ) : (
          payments.map((item) => (
            <View key={item.paymentId} style={styles.card}>
              <View style={styles.topRow}>
                <View style={styles.iconBox}>
                  <Ionicons
                    name="receipt-outline"
                    size={24}
                    color="#2563EB"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>
                    {item.requestType}
                  </Text>

                  <Text style={styles.subtitle}>
                    Flat {item.flatNumber || "-"}
                  </Text>
                </View>

                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {item.paymentStatus}
                  </Text>
                </View>
              </View>

              <View style={styles.amountSection}>
                <View>
                  <Text style={styles.amountLabel}>
                    Amount
                  </Text>

                  <Text style={styles.amount}>
                    ₹{formatAmount(item.amount)}
                  </Text>
                </View>

                <View>
                  <Text style={styles.modeLabel}>
                    {formatMode(item.paymentMode)}
                  </Text>
                </View>
              </View>

              {item.receiptUrl && (
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
              )}

               {isCashier && item.paymentStatus === "SUBMITTED" && (
                <View style={styles.actionRow}>
                    <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => handleVerify(item.paymentId, false)}
                    disabled={actionLoadingId === item.paymentId}
                    >
                    <Text style={styles.rejectText}>Reject</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                    style={styles.approveButton}
                    onPress={() => handleVerify(item.paymentId, true)}
                    disabled={actionLoadingId === item.paymentId}
                    >
                    {actionLoadingId === item.paymentId ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.approveText}>Approve</Text>
                    )}
                    </TouchableOpacity>
                </View>
                )}
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
  if (!value) return "0";

  return Number(value).toLocaleString("en-IN");
}

function formatMode(mode) {
  if (!mode) return "-";

  if (mode === "BANK_TRANSFER") {
    return "Bank Transfer";
  }

  return mode;
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
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },

  heading: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 20,
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
    marginTop: 14,
  },

  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 6,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },

  statusBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  statusText: {
    color: "#2563EB",
    fontSize: 11,
    fontWeight: "800",
  },

  amountSection: {
    marginTop: 18,
    paddingTop: 16,
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
    fontSize: 26,
    fontWeight: "900",
    color: "#111827",
    marginTop: 4,
  },

  modeLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "700",
  },

  receiptImage: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    marginTop: 18,
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },

  rejectButton: {
    width: "48%",
    backgroundColor: "#FEE2E2",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  rejectText: {
    color: "#DC2626",
    fontWeight: "800",
    fontSize: 14,
  },

  approveButton: {
    width: "48%",
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  approveText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
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