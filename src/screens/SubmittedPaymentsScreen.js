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
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import API from "../api/axios";

import {
  getLoggedInUser,
  getSubmittedPayments,
  verifyPayment,
} from "../api/dashboardApi";

import ImagePreviewModal from "../components/common/ImagePreviewModal";

import AppCard from "../components/common/AppCard";
import AppButton from "../components/common/AppButton";
import StatusBadge from "../components/common/StatusBadge";
import EmptyState from "../components/common/EmptyState";

import { COLORS } from "../components/common/theme";

export default function SubmittedPaymentsScreen() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [actionLoadingId, setActionLoadingId] =
    useState(null);

  const [user, setUser] = useState(null);

  const [previewImageUrl, setPreviewImageUrl] =
    useState(null);

  useFocusEffect(
    useCallback(() => {
      loadPayments();
    }, [])
  );

  const loadPayments = async () => {
    try {
      setLoading(true);

      const [userRes, paymentsRes] =
        await Promise.all([
          getLoggedInUser(),
          getSubmittedPayments(),
        ]);

      setUser(userRes.data);

      setPayments(paymentsRes.data || []);
    } catch (error) {
      console.log(
        "SUBMITTED PAYMENTS ERROR:",
        error?.response?.data || error
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);

    await loadPayments();

    setRefreshing(false);
  };

  const handleVerify = (
    paymentId,
    approved
  ) => {
    Alert.alert(
      approved
        ? "Approve Payment"
        : "Reject Payment",

      approved
        ? "Are you sure you want to approve this payment?"
        : "Are you sure you want to reject this payment?",

      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: approved
            ? "Approve"
            : "Reject",

          style: approved
            ? "default"
            : "destructive",

          onPress: async () => {
            try {
              setActionLoadingId(
                paymentId
              );

              await verifyPayment(
                paymentId,
                approved
              );

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
                error?.response?.data ||
                  error
              );

              Alert.alert(
                "Error",

                approved
                  ? "Unable to approve payment."
                  : "Unable to reject payment."
              );
            } finally {
              setActionLoadingId(
                null
              );
            }
          },
        },
      ]
    );
  };

  const getFullImageUrl = (
    receiptUrl
  ) => {
    if (!receiptUrl) {
      return null;
    }

    if (
      receiptUrl.startsWith("http")
    ) {
      return receiptUrl;
    }

    return (
      API.defaults.baseURL.replace(
        "/api",
        ""
      ) + receiptUrl
    );
  };

  const isCashier =
    user?.role?.toUpperCase() ===
    "CASHIER";

  if (loading) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={styles.loaderContainer}
        >
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />

          <Text style={styles.loaderText}>
            Loading submitted
            payments...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["bottom"]}
    >
      <ScrollView
        contentContainerStyle={
          styles.container
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={
              COLORS.primary
            }
          />
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <Text style={styles.heading}>
          Submitted Payments
        </Text>

        {payments.length === 0 ? (
          <AppCard>
            <EmptyState
              icon="checkmark-circle-outline"
              title="No submitted payments"
              subtitle="No resident payments are waiting for approval."
            />
          </AppCard>
        ) : (
          payments.map((item) => (
            <AppCard
              key={item.paymentId}
              style={styles.card}
            >
              <View
                style={styles.topRow}
              >
                <View
                  style={styles.iconBox}
                >
                  <Ionicons
                    name="receipt-outline"
                    size={24}
                    color={
                      COLORS.primary
                    }
                  />
                </View>

                <View
                  style={
                    styles.titleBlock
                  }
                >
                  <Text
                    style={
                      styles.title
                    }
                  >
                    {
                      item.requestType
                    }
                  </Text>

                  <Text
                    style={
                      styles.subtitle
                    }
                  >
                    Flat{" "}
                    {item.flatNumber ||
                      "-"}
                  </Text>
                </View>

                <StatusBadge
                  status={
                    item.paymentStatus
                  }
                />
              </View>

              <View
                style={
                  styles.amountSection
                }
              >
                <View>
                  <Text
                    style={
                      styles.amountLabel
                    }
                  >
                    Amount
                  </Text>

                  <Text
                    style={
                      styles.amount
                    }
                  >
                    ₹
                    {formatAmount(
                      item.amount
                    )}
                  </Text>
                </View>

                <View
                  style={
                    styles.modeBox
                  }
                >
                  <Text
                    style={
                      styles.modeLabel
                    }
                  >
                    {formatMode(
                      item.paymentMode
                    )}
                  </Text>
                </View>
              </View>

              <View
                style={styles.infoRow}
              >
                <View
                  style={
                    styles.infoItem
                  }
                >
                  <Ionicons
                    name="calendar-outline"
                    size={14}
                    color={
                      COLORS.textMuted
                    }
                  />

                  <Text
                    style={
                      styles.infoText
                    }
                  >
                    Submitted
                  </Text>
                </View>

                <Text
                  style={
                    styles.infoValue
                  }
                >
                  {formatDate(
                    item.createdAt ||
                      item.submittedAt
                  )}
                </Text>
              </View>

              {item.receiptUrl && (
                <TouchableOpacity
                  style={
                    styles.receiptPreviewBox
                  }
                  onPress={() =>
                    setPreviewImageUrl(
                      getFullImageUrl(
                        item.receiptUrl
                      )
                    )
                  }
                  activeOpacity={0.85}
                >
                  <View
                    style={
                      styles.receiptIconCircle
                    }
                  >
                    <Ionicons
                      name="image-outline"
                      size={34}
                      color={
                        COLORS.primary
                      }
                    />
                  </View>

                  <Text
                    style={
                      styles.previewTitle
                    }
                  >
                    Receipt Uploaded
                  </Text>

                  <Text
                    style={
                      styles.previewSubtitle
                    }
                  >
                    Tap to preview image
                  </Text>
                </TouchableOpacity>
              )}

              {isCashier &&
                item.paymentStatus ===
                  "SUBMITTED" && (
                  <View
                    style={
                      styles.actionRow
                    }
                  >
                    <AppButton
                      title="Reject"
                      variant="outline"
                      onPress={() =>
                        handleVerify(
                          item.paymentId,
                          false
                        )
                      }
                      disabled={
                        actionLoadingId ===
                        item.paymentId
                      }
                      style={
                        styles.rejectButton
                      }
                    />

                    <AppButton
                      title="Approve"
                      onPress={() =>
                        handleVerify(
                          item.paymentId,
                          true
                        )
                      }
                      loading={
                        actionLoadingId ===
                        item.paymentId
                      }
                      style={
                        styles.approveButton
                      }
                    />
                  </View>
                )}
            </AppCard>
          ))
        )}
      </ScrollView>

      <ImagePreviewModal
        visible={
          !!previewImageUrl
        }
        imageUrl={previewImageUrl}
        onClose={() =>
          setPreviewImageUrl(null)
        }
      />
    </SafeAreaView>
  );
}

function formatAmount(value) {
  if (!value) return "0";

  return Number(value).toLocaleString(
    "en-IN"
  );
}

function formatMode(mode) {
  if (!mode) return "-";

  if (
    mode === "BANK_TRANSFER"
  ) {
    return "Bank Transfer";
  }

  return mode;
}

function formatDate(date) {
  if (!date) return "-";

  try {
    return new Date(
      date
    ).toLocaleDateString("en-IN");
  } catch {
    return "-";
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      COLORS.background,
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
    color: COLORS.textMuted,
    fontWeight: "600",
  },

  heading: {
    fontSize: 30,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 22,
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
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#EEF5FF",
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

  amountSection: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor:
      COLORS.borderLight,
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  amountLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "700",
  },

  amount: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.text,
    marginTop: 4,
  },

  modeBox: {
    backgroundColor: "#EEF5FF",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  modeLabel: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "800",
  },

  infoRow: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor:
      COLORS.borderLight,
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  infoText: {
    marginLeft: 5,
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "600",
  },

  infoValue: {
    fontSize: 12,
    color:
      COLORS.textSecondary,
    fontWeight: "800",
  },

  receiptPreviewBox: {
    marginTop: 18,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
    paddingVertical: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  receiptIconCircle: {
    width: 72,
    height: 72,
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
    marginTop: 5,
    fontWeight: "600",
  },

  actionRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    marginTop: 18,
  },

  rejectButton: {
    width: "48%",
  },

  approveButton: {
    width: "48%",
  },
});