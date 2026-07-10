import React, { useCallback, useContext, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import RazorpayCheckout from "react-native-razorpay";

import {
  getSubscriptionStatus,
  getSubscriptionPlans,
  createSubscriptionOrder,
  verifySubscriptionPayment,
} from "../api/subscriptionApi";

import { AuthContext } from "../context/AuthContext";
import { t } from "../i18n";

export default function SubscriptionScreen({ navigation }) {
  const { refreshSubscriptionStatus } = useContext(AuthContext);

  const [status, setStatus] = useState(null);
  const [plans, setPlans] = useState([]);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [statusResponse, plansResponse] = await Promise.all([
        getSubscriptionStatus(),
        getSubscriptionPlans(),
      ]);

      setStatus(statusResponse.data);
      setPlans(plansResponse.data || []);
    } catch (error) {
      console.log(
        "SUBSCRIPTION LOAD ERROR:",
        error?.response?.data || error
      );

      Alert.alert(
        "Error",
        getErrorMessage(
          error,
          "Unable to load subscription information."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      setCreatedOrder(null);
      setSelectedPlan(null);
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const subscribe = async (plan) => {
    if (processingPlanId) {
      return;
    }

    try {
      setProcessingPlanId(plan.planId);
      setSelectedPlan(plan);
      setCreatedOrder(null);

      /*
       * Step 1:
       * Create Razorpay order through backend.
       */
      const orderResponse = await createSubscriptionOrder({
        planId: plan.planId,
      });

      const order = orderResponse.data;

      if (!order?.razorpayOrderId) {
        throw new Error("Razorpay order ID was not returned.");
      }

      if (!order?.keyId) {
        throw new Error("Razorpay Key ID was not returned.");
      }

      if (!order?.amountInPaise) {
        throw new Error("Razorpay order amount was not returned.");
      }

      setCreatedOrder(order);

      /*
       * Step 2:
       * Open native Razorpay Checkout.
       *
       * Amount must be supplied in the smallest currency unit.
       * For INR, the backend already returns amountInPaise.
       */
      const checkoutOptions = {
        key: order.keyId,
        order_id: order.razorpayOrderId,
        amount: String(order.amountInPaise),
        currency: order.currency || "INR",

        name: "SmartSociety",
        description: `${plan.durationMonths} Month Apartment Subscription`,

        theme: {
          color: "#2563EB",
        },

        notes: {
          subscriptionId: String(order.subscriptionId || ""),
          planId: String(order.planId || plan.planId),
        },
      };

      const paymentResult =
        await RazorpayCheckout.open(checkoutOptions);

      if (
        !paymentResult?.razorpay_order_id ||
        !paymentResult?.razorpay_payment_id ||
        !paymentResult?.razorpay_signature
      ) {
        throw new Error(
          "Incomplete payment response received from Razorpay."
        );
      }

      /*
       * Step 3:
       * Send the Razorpay result to backend for signature verification.
       */
      const verifyResponse =
        await verifySubscriptionPayment({
          razorpayOrderId:
            paymentResult.razorpay_order_id,

          razorpayPaymentId:
            paymentResult.razorpay_payment_id,

          razorpaySignature:
            paymentResult.razorpay_signature,
        });

      /*
       * Step 4:
       * Refresh subscription status.
       */
      await refreshSubscriptionStatus();
      await loadData();

      setCreatedOrder(null);
      setSelectedPlan(null);

      Alert.alert(
        "Payment Successful",
        verifyResponse?.data?.message ||
          "Your SmartSociety subscription has been activated successfully.",
        [
          {
            text: "OK",
            onPress: () => {
              navigation.navigate("Dashboard");
            },
          },
        ]
      );
    } catch (error) {
      console.log(
        "RAZORPAY SUBSCRIPTION ERROR:",
        error?.response?.data || error
      );

      /*
       * Razorpay native checkout can reject its promise when:
       * - user cancels checkout
       * - payment fails
       * - network fails
       *
       * Backend Axios errors are handled using response.data.
       */
      const message = getErrorMessage(
        error,
        "The payment was cancelled or could not be completed."
      );

      Alert.alert("Payment Not Completed", message);
    } finally {
      setProcessingPlanId(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
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
            colors={["#2563EB"]}
            tintColor="#2563EB"
          />
        }
      >
        <View style={styles.headerCard}>
          <View style={styles.headerIconBox}>
            <Ionicons
              name="card-outline"
              size={32}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.siteName}>
            {status?.siteName || "Apartment Subscription"}
          </Text>

          <View
            style={[
              styles.statusBadge,
              getStatusStyle(status?.status),
            ]}
          >
            <Text style={styles.statusText}>
              {status?.status || "-"}
            </Text>
          </View>

          <Text style={styles.message}>
            {status?.message}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <InfoRow
            icon="time-outline"
            label={t("subscription.daysRemaining")}
            value={status?.daysRemaining ?? "-"}
          />

          <InfoRow
            icon="calendar-outline"
            label={t("subscription.trialEnd")}
            value={formatDate(status?.trialEndDate)}
          />

          <InfoRow
            icon="card-outline"
            label={t("subscription.subscriptionEnd")}
            value={formatDate(
              status?.subscriptionEndDate
            )}
          />
        </View>

        {createdOrder && processingPlanId && (
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View style={styles.orderIconBox}>
                <ActivityIndicator
                  size="small"
                  color="#2563EB"
                />
              </View>

              <View style={styles.orderHeaderText}>
                <Text style={styles.orderTitle}>
                  Processing Payment
                </Text>

                <Text style={styles.orderSubtitle}>
                  Complete the payment in Razorpay Checkout.
                </Text>
              </View>
            </View>

            <Text style={styles.orderText}>
              Plan: {selectedPlan?.durationMonths} Months
            </Text>

            <Text style={styles.orderText}>
              Amount: ₹{createdOrder.amount}
            </Text>

            <Text
              style={styles.orderTextSmall}
              numberOfLines={1}
            >
              Order ID: {createdOrder.razorpayOrderId}
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>
          {t("subscription.availablePlans")}
        </Text>

        {plans.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="card-outline"
              size={36}
              color="#9CA3AF"
            />

            <Text style={styles.emptyText}>
              No plans available
            </Text>
          </View>
        ) : (
          plans.map((plan) => {
            const isProcessing =
              processingPlanId === plan.planId;

            const isAnotherPlanProcessing =
              processingPlanId &&
              processingPlanId !== plan.planId;

            return (
              <TouchableOpacity
                key={plan.planId}
                style={[
                  styles.planCard,
                  selectedPlan?.planId === plan.planId &&
                    styles.planCardActive,
                  isAnotherPlanProcessing &&
                    styles.planCardDisabled,
                ]}
                onPress={() => subscribe(plan)}
                activeOpacity={0.85}
                disabled={Boolean(processingPlanId)}
              >
                <View style={styles.planLeft}>
                  <View style={styles.planIconBox}>
                    <Ionicons
                      name="calendar-outline"
                      size={22}
                      color="#2563EB"
                    />
                  </View>

                  <View style={styles.planTextBlock}>
                    <Text style={styles.planTitle}>
                      {plan.durationMonths} Months
                    </Text>

                    <Text style={styles.planRange}>
                      Flats {plan.minFlats}
                      {plan.maxFlats
                        ? ` - ${plan.maxFlats}`
                        : "+"}
                    </Text>
                  </View>
                </View>

                <View style={styles.planRight}>
                  <Text style={styles.amount}>
                    ₹{plan.amount}
                  </Text>

                  {isProcessing ? (
                    <View style={styles.processingRow}>
                      <ActivityIndicator
                        size="small"
                        color="#2563EB"
                      />

                      <Text style={styles.processingText}>
                        Opening...
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.buyNow}>
                      {t("subscription.subscribe")} →
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons
        name={icon}
        size={18}
        color="#6B7280"
      />

      <Text style={styles.infoLabel}>
        {label}
      </Text>

      <Text style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
}

function getStatusStyle(status) {
  switch (status) {
    case "ACTIVE":
      return {
        backgroundColor: "#DCFCE7",
      };

    case "TRIAL":
      return {
        backgroundColor: "#FEF3C7",
      };

    case "EXPIRED":
      return {
        backgroundColor: "#FEE2E2",
      };

    default:
      return {
        backgroundColor: "#F3F4F6",
      };
  }
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getErrorMessage(error, fallbackMessage) {
  const backendData = error?.response?.data;

  if (typeof backendData === "string" && backendData.trim()) {
    return backendData;
  }

  if (
    typeof backendData?.message === "string" &&
    backendData.message.trim()
  ) {
    return backendData.message;
  }

  if (
    typeof error?.description === "string" &&
    error.description.trim()
  ) {
    return error.description;
  }

  if (
    typeof error?.error?.description === "string" &&
    error.error.description.trim()
  ) {
    return error.error.description;
  }

  if (
    typeof error?.message === "string" &&
    error.message.trim() &&
    error.message !== "Network Error"
  ) {
    return error.message;
  }

  return fallbackMessage;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FB",
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

  headerCard: {
    backgroundColor: "#2563EB",
    borderRadius: 26,
    padding: 22,
    marginBottom: 16,
  },

  headerIconBox: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  siteName: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },

  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 12,
  },

  statusText: {
    fontWeight: "900",
    color: "#111827",
  },

  message: {
    marginTop: 10,
    color: "#DBEAFE",
    fontWeight: "600",
    lineHeight: 20,
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  infoLabel: {
    flex: 1,
    marginLeft: 10,
    color: "#6B7280",
    fontWeight: "700",
  },

  infoValue: {
    fontWeight: "900",
    color: "#111827",
  },

  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },

  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  orderIconBox: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#EEF4FF",
    justifyContent: "center",
    alignItems: "center",
  },

  orderHeaderText: {
    flex: 1,
    marginLeft: 12,
  },

  orderTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },

  orderSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 3,
  },

  orderText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#374151",
    marginTop: 4,
  },

  orderTextSmall: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 8,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 12,
    color: "#111827",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },

  emptyText: {
    marginTop: 8,
    color: "#6B7280",
    fontWeight: "800",
  },

  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  planCardActive: {
    borderWidth: 1.5,
    borderColor: "#2563EB",
  },

  planCardDisabled: {
    opacity: 0.55,
  },

  planLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
  },

  planIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#EEF4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  planTextBlock: {
    flex: 1,
  },

  planTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },

  planRange: {
    marginTop: 4,
    color: "#6B7280",
    fontWeight: "600",
  },

  planRight: {
    alignItems: "flex-end",
  },

  amount: {
    fontSize: 22,
    fontWeight: "900",
    color: "#16A34A",
    textAlign: "right",
  },

  buyNow: {
    marginTop: 5,
    color: "#2563EB",
    fontWeight: "800",
    textAlign: "right",
  },

  processingRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
  },

  processingText: {
    marginLeft: 6,
    color: "#2563EB",
    fontWeight: "800",
    fontSize: 12,
  },
});