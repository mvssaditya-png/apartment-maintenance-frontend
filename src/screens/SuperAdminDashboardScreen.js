import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { getSuperAdminDashboard } from "../api/superAdminApi";
import { AuthContext } from "../context/AuthContext";

export default function SuperAdminDashboardScreen({ navigation }) {
  const { logout } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [dashboard, setDashboard] = useState({
    totalSites: 0,
    trialSites: 0,
    activeSites: 0,
    expiredSites: 0,
    inactiveSites: 0,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await getSuperAdminDashboard();
      setDashboard(response.data || {});
    } catch (error) {
      console.log("SUPER ADMIN DASHBOARD ERROR:", error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loaderText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
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
          <View style={styles.headerTopRow}>
            <View style={styles.logoBox}>
              <Ionicons name="shield-checkmark-outline" size={34} color="#FFFFFF" />
            </View>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={logout}
              activeOpacity={0.85}
            >
              <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.headerTitle}>Super Admin</Text>
          <Text style={styles.headerSubtitle}>
            Manage apartments, subscriptions, plans and platform access.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Overview</Text>

        <View style={styles.cardGrid}>
          <DashboardCard
            title="Apartments"
            value={dashboard.totalSites}
            icon="business-outline"
            bg="#EEF4FF"
            color="#2563EB"
          />

          <DashboardCard
            title="Trial"
            value={dashboard.trialSites}
            icon="time-outline"
            bg="#FFF7ED"
            color="#EA580C"
          />

          <DashboardCard
            title="Active"
            value={dashboard.activeSites}
            icon="checkmark-circle-outline"
            bg="#ECFDF5"
            color="#059669"
          />

          <DashboardCard
            title="Expired"
            value={dashboard.expiredSites}
            icon="alert-circle-outline"
            bg="#FEF2F2"
            color="#DC2626"
          />

          <DashboardCard
            title="Inactive"
            value={dashboard.inactiveSites}
            icon="close-circle-outline"
            bg="#F3F4F6"
            color="#6B7280"
          />
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <ActionCard
          title="Manage Apartments"
          subtitle="Create apartments and manage trial status"
          icon="business-outline"
          onPress={() => navigation.navigate("ManageSites")}
        />

        <ActionCard
          title="Subscription Plans"
          subtitle="Create and update pricing plans"
          icon="card-outline"
          onPress={() => navigation.navigate("SubscriptionPlans")}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function DashboardCard({ title, value, icon, bg, color }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconBox, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={25} color={color} />
      </View>

      <Text style={styles.statValue}>{value ?? 0}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

function ActionCard({ title, subtitle, icon, onPress }) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.actionIconBox}>
        <Ionicons name={icon} size={25} color="#2563EB" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>

      <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
    </TouchableOpacity>
  );
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
    color: "#6B7280",
    fontWeight: "700",
  },

  headerCard: {
    backgroundColor: "#2563EB",
    borderRadius: 28,
    padding: 22,
    marginBottom: 24,
  },

  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  logoBox: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  logoutButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  welcomeText: {
    color: "#DBEAFE",
    fontSize: 15,
    fontWeight: "700",
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
    marginTop: 4,
  },

  headerSubtitle: {
    color: "#DBEAFE",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
    marginTop: 8,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 14,
  },

  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  statIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  statValue: {
    fontSize: 30,
    fontWeight: "900",
    color: "#111827",
    marginTop: 14,
  },

  statTitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "700",
    marginTop: 4,
  },

  actionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  actionIconBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  actionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
  },

  actionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 4,
    lineHeight: 18,
  },
});