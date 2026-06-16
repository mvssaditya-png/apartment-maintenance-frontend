import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import {
  getSubscriptionPlans,
  toggleSubscriptionPlan,
} from "../api/superAdminApi";

export default function SubscriptionPlansScreen({ navigation }) {
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadPlans();
    }, [])
  );

  const loadPlans = async () => {
    try {
      const response = await getSubscriptionPlans();
      setPlans(response.data || []);
    } catch (error) {
      console.log(
        "LOAD PLANS ERROR:",
        error?.response?.data || error
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPlans();
    setRefreshing(false);
  };

  const handleToggle = async (planId) => {
    try {
      await toggleSubscriptionPlan(planId);
      await loadPlans();
    } catch (error) {
      Alert.alert(
        "Error",
        "Unable to update subscription plan."
      );
    }
  };

  const filteredPlans = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return plans;

    return plans.filter((item) =>
      item.label?.toLowerCase().includes(q)
    );
  }, [plans, search]);

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
    <SafeAreaView
      style={styles.safeArea}
      edges={["bottom"]}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Subscription Plans
          </Text>

          <Text style={styles.subtitle}>
            Manage apartment pricing plans.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate("CreatePlan")
          }
        >
          <Ionicons
            name="add"
            size={28}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#6B7280"
        />

        <TextInput
          style={styles.searchInput}
          placeholder="Search plans..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2563EB"]}
          />
        }
      >
        {filteredPlans.map((item) => (
          <PlanCard
            key={item.planId}
            item={item}
            navigation={navigation}
            onToggle={handleToggle}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function PlanCard({
  item,
  navigation,
  onToggle,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <Ionicons
            name="card-outline"
            size={24}
            color="#2563EB"
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.planTitle}>
            {item.minFlats}
            {item.maxFlats
              ? ` - ${item.maxFlats}`
              : "+"}
            {" Flats"}
          </Text>

          <Text style={styles.planSubTitle}>
            {item.durationMonths} Months
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            item.active
              ? styles.activeBadge
              : styles.inactiveBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.active
                ? styles.activeText
                : styles.inactiveText,
            ]}
          >
            {item.active
              ? "ACTIVE"
              : "INACTIVE"}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>
          Price
        </Text>

        <Text style={styles.priceValue}>
          ₹{item.amount}
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            navigation.navigate(
              "CreatePlan",
              { plan: item }
            )
          }
        >
          <Ionicons
            name="create-outline"
            size={18}
            color="#2563EB"
          />

          <Text style={styles.editText}>
            Edit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() =>
            onToggle(item.planId)
          }
        >
          <Ionicons
            name={
              item.active
                ? "close-circle-outline"
                : "checkmark-circle-outline"
            }
            size={18}
            color="#FFFFFF"
          />

          <Text style={styles.toggleText}>
            {item.active
              ? "Deactivate"
              : "Activate"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },

  addButton: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },

  searchBox: {
    marginHorizontal: 18,
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 54,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
  },

  listContainer: {
    padding: 18,
    paddingTop: 0,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#EEF4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  planTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
  },

  planSubTitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 14,
  },

  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  priceLabel: {
    fontWeight: "700",
    color: "#6B7280",
  },

  priceValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#16A34A",
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
  },

  editText: {
    marginLeft: 5,
    color: "#2563EB",
    fontWeight: "800",
  },

  toggleButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  toggleText: {
    color: "#FFFFFF",
    fontWeight: "800",
    marginLeft: 5,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  activeBadge: {
    backgroundColor: "#DCFCE7",
  },

  inactiveBadge: {
    backgroundColor: "#FEE2E2",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "900",
  },

  activeText: {
    color: "#16A34A",
  },

  inactiveText: {
    color: "#DC2626",
  },
});