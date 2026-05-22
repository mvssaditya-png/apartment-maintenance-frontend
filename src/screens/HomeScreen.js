import React, { useCallback, useState } from "react";

import {
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  View,
  Text,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useFocusEffect } from "@react-navigation/native";

import {
  getResidentDashboard,
  getMonthlySummary,
  getLoggedInUser,
  getSocietyBalance,
} from "../api/dashboardApi";

import HomeHeader from "../components/home/HomeHeader";
import BalanceCard from "../components/home/BalanceCard";
import QuickActions from "../components/home/QuickActions";
import OverviewStats from "../components/home/OverviewStats";
import RecentActivity from "../components/home/RecentActivity";

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [balance, setBalance] = useState(null);
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadHomeData();
    }, [])
  );

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return "Good Morning";
    }

    if (hour >= 12 && hour < 17) {
      return "Good Afternoon";
    }

    if (hour >= 17 && hour < 21) {
      return "Good Evening";
    }

    return "Good Night";
  };

  const loadHomeData = async () => {
    try {
      setLoading(true);

      const [
        userResult,
        dashboardResult,
        balanceResult,
        summaryResult,
      ] = await Promise.allSettled([
        getLoggedInUser(),
        getResidentDashboard(),
        getSocietyBalance(),
        getMonthlySummary(),
      ]);

      if (userResult.status === "fulfilled") {
        setUser(userResult.value.data);
      } else {
        console.log("USER API ERROR:", userResult.reason);
      }

      if (dashboardResult.status === "fulfilled") {
        setDashboard(dashboardResult.value.data);
      } else {
        console.log("DASHBOARD API ERROR:", dashboardResult.reason);
      }

      if (balanceResult.status === "fulfilled") {
        setBalance(balanceResult.value.data);
      } else {
        console.log("BALANCE API ERROR:", balanceResult.reason);
      }

      if (summaryResult.status === "fulfilled") {
        setSummary(summaryResult.value.data);
      } else {
        console.log("SUMMARY API ERROR:", summaryResult.reason);
      }
    } catch (error) {
      console.log("HOME LOAD ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const currentBalance =
    balance?.currentBalance ??
    dashboard?.currentBalance ??
    0;

  const totalDue =
    dashboard?.myPendingAmount ??
    dashboard?.myDue ??
    0;

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
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <HomeHeader user={user} greeting={getGreeting()} />

        <BalanceCard
          currentBalance={currentBalance}
          totalDue={totalDue}
          onPayPress={() => navigation.navigate("MyDues")}
        />

        <QuickActions role={user?.role} navigation={navigation} />

        <OverviewStats
          summary={summary}
          dashboard={dashboard}
        />

        <RecentActivity dashboard={dashboard} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  container: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 95,
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
});