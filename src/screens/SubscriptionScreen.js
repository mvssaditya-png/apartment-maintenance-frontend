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

import {
  getSubscriptionStatus,
  getSubscriptionPlans,
  createSubscriptionOrder,
  testActivateSubscription,
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

  const [creatingOrder, setCreatingOrder] = useState(false);
  const [activating, setActivating] = useState(false);

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
      console.log("SUBSCRIPTION LOAD ERROR:", error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setCreatedOrder(null);
    setSelectedPlan(null);
    await loadData();
    setRefreshing(false);
  };

  const subscribe = async (plan) => {
    try {
      setCreatingOrder(true);
      setSelectedPlan(plan);
      setCreatedOrder(null);

      const response = await createSubscriptionOrder({
        planId: plan.planId,
      });

      setCreatedOrder(response.data);

      Alert.alert(
        t("subscription.orderCreated"),
        t("subscription.orderCreatedMessage")
      );
    } catch (error) {
      console.log("CREATE ORDER ERROR:", error?.response?.data || error);

      Alert.alert("Error", "Unable to create subscription order.");
    } finally {
      setCreatingOrder(false);
    }
  };

  const testActivate = async () => {
    if (!createdOrder?.razorpayOrderId) {
      Alert.alert("Error", "Please create an order first.");
      return;
    }

    try {
      setActivating(true);

      await testActivateSubscription({
        razorpayOrderId: createdOrder.razorpayOrderId,
        razorpayPaymentId: "TEST_PAYMENT",
        razorpaySignature: "TEST_SIGNATURE",
      });

      await refreshSubscriptionStatus();
      await loadData();

      Alert.alert(
        "Success",
        "Subscription activated successfully.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Dashboard"),
          },
        ]
      );
    } catch (error) {
      console.log("TEST ACTIVATE ERROR:", error?.response?.data || error);

      Alert.alert("Error", "Unable to activate subscription.");
    } finally {
      setActivating(false);
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2563EB"]}
          />
        }
      >
        <View style={styles.headerCard}>
          <View style={styles.headerIconBox}>
            <Ionicons name="card-outline" size={32} color="#FFFFFF" />
          </View>

          <Text style={styles.siteName}>
            {status?.siteName || "Apartment Subscription"}
          </Text>

          <View style={[styles.statusBadge, getStatusStyle(status?.status)]}>
            <Text style={styles.statusText}>{status?.status || "-"}</Text>
          </View>

          <Text style={styles.message}>{status?.message}</Text>
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
            value={formatDate(status?.subscriptionEndDate)}
          />
        </View>

        {createdOrder && (
          <View style={styles.orderCard}>
            <Text style={styles.orderTitle}>Order Created</Text>

            <Text style={styles.orderText}>
              Plan: {selectedPlan?.durationMonths} Months
            </Text>

            <Text style={styles.orderText}>
              Amount: ₹{createdOrder.amount}
            </Text>

            <Text style={styles.orderTextSmall}>
              Order ID: {createdOrder.razorpayOrderId}
            </Text>

            <TouchableOpacity
              style={styles.testButton}
              onPress={testActivate}
              disabled={activating}
              activeOpacity={0.85}
            >
              {activating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.testButtonText}>
                  {t("subscription.testActivate")}
                </Text>
              )}
            </TouchableOpacity>

            <Text style={styles.testNote}>
              {t("subscription.testNote")}
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>{t("subscription.availablePlans")}</Text>

        {plans.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="card-outline" size={36} color="#9CA3AF" />
            <Text style={styles.emptyText}>No plans available</Text>
          </View>
        ) : (
          plans.map((plan) => (
            <TouchableOpacity
              key={plan.planId}
              style={[
                styles.planCard,
                selectedPlan?.planId === plan.planId && styles.planCardActive,
              ]}
              onPress={() => subscribe(plan)}
              activeOpacity={0.85}
              disabled={creatingOrder}
            >
              <View style={styles.planLeft}>
                <View style={styles.planIconBox}>
                  <Ionicons name="calendar-outline" size={22} color="#2563EB" />
                </View>

                <View>
                  <Text style={styles.planTitle}>{plan.durationMonths} Months</Text>

                  <Text style={styles.planRange}>
                    Flats {plan.minFlats}
                    {plan.maxFlats ? ` - ${plan.maxFlats}` : "+"}
                  </Text>
                </View>
              </View>

              <View>
                <Text style={styles.amount}>₹{plan.amount}</Text>

                <Text style={styles.buyNow}>
                  {creatingOrder && selectedPlan?.planId === plan.planId
                    ? t("subscription.creating")
                    : `${t("subscription.subscribe")} →`}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color="#6B7280" />

      <Text style={styles.infoLabel}>{label}</Text>

      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function getStatusStyle(status) {
  switch (status) {
    case "ACTIVE":
      return { backgroundColor: "#DCFCE7" };

    case "TRIAL":
      return { backgroundColor: "#FEF3C7" };

    case "EXPIRED":
      return { backgroundColor: "#FEE2E2" };

    default:
      return { backgroundColor: "#F3F4F6" };
  }
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (isNaN(date.getTime())) return value;

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

  orderTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 8,
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

  testButton: {
    marginTop: 16,
    backgroundColor: "#2563EB",
    borderRadius: 16,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },

  testButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  testNote: {
    marginTop: 10,
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    lineHeight: 18,
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
});