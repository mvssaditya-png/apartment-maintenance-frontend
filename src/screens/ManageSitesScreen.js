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

import { getSites, toggleSite } from "../api/superAdminApi";

export default function ManageSitesScreen({ navigation }) {
  const [sites, setSites] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadSites();
    }, [])
  );

  const loadSites = async () => {
    try {
      const response = await getSites();
      setSites(response.data || []);
    } catch (error) {
      console.log("LOAD SITES ERROR:", error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSites();
    setRefreshing(false);
  };

  const handleToggle = async (siteId, active) => {
    Alert.alert(
      active ? "Deactivate Apartment" : "Activate Apartment",
      active
        ? "Are you sure you want to deactivate this apartment?"
        : "Are you sure you want to activate this apartment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: active ? "Deactivate" : "Activate",
          style: active ? "destructive" : "default",
          onPress: async () => {
            try {
              await toggleSite(siteId);
              await loadSites();
            } catch (error) {
              console.log("TOGGLE SITE ERROR:", error?.response?.data || error);
              Alert.alert("Error", "Unable to update apartment status.");
            }
          },
        },
      ]
    );
  };

  const filteredSites = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return sites;

    return sites.filter((item) => {
      return (
        String(item.siteName || "").toLowerCase().includes(q) ||
        String(item.adminName || "").toLowerCase().includes(q) ||
        String(item.adminPhone || "").toLowerCase().includes(q) ||
        String(item.city || "").toLowerCase().includes(q) ||
        String(item.state || "").toLowerCase().includes(q)
      );
    });
  }, [search, sites]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loaderText}>Loading apartments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.header}>
        <View style={styles.headerTextBlock}>
          <Text style={styles.title}>Manage Apartments</Text>
          <Text style={styles.subtitle}>
            View and manage all registered apartment sites.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("CreateSite")}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={21} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search apartment, admin or phone"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.listContainer}
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
        {filteredSites.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="business-outline" size={42} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No apartments found</Text>
            <Text style={styles.emptySubtitle}>
              Create your first apartment using the plus button.
            </Text>
          </View>
        ) : (
          filteredSites.map((item) => (
            <SiteCard
              key={item.siteId}
              item={item}
              navigation={navigation}
              onToggle={handleToggle}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SiteCard({ item, navigation, onToggle }) {
  const statusColor = getStatusColor(item.subscriptionStatus);

  return (
    <View style={styles.siteCard}>
      <View style={styles.siteTopRow}>
        <View style={styles.siteIcon}>
          <Ionicons name="business-outline" size={26} color="#2563EB" />
        </View>

        <View style={styles.siteTextBlock}>
          <Text style={styles.siteName}>{item.siteName}</Text>

          <Text style={styles.flatText}>{item.totalFlats || 0} flats</Text>

          {(item.city || item.state) && (
            <Text style={styles.locationText}>
              {[item.city, item.state].filter(Boolean).join(", ")}
            </Text>
          )}
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
          <Text style={[styles.statusText, { color: statusColor.text }]}>
            {item.subscriptionStatus || "-"}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <InfoRow icon="person-outline" label="Admin" value={item.adminName || "-"} />
      <InfoRow icon="call-outline" label="Phone" value={item.adminPhone || "-"} />
      <InfoRow icon="mail-outline" label="Email" value={item.adminEmail || "-"} />
      <InfoRow
        icon="calendar-outline"
        label="Trial Ends"
        value={formatDate(item.trialEndDate)}
      />
      <InfoRow
        icon="card-outline"
        label="Subscription Ends"
        value={formatDate(item.subscriptionEndDate)}
      />

      <View
        style={[
          styles.activeBadge,
          item.active ? styles.activeOn : styles.activeOff,
        ]}
      >
        <Text
          style={[
            styles.activeText,
            item.active ? styles.activeTextOn : styles.activeTextOff,
          ]}
        >
          {item.active ? "Active Apartment" : "Inactive Apartment"}
        </Text>
      </View>

      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate("CreateSite", { site: item })}
          activeOpacity={0.85}
        >
          <Ionicons name="create-outline" size={18} color="#2563EB" />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.flatsButton}
          onPress={() =>
            navigation.navigate("ManageSiteFlats", {
              siteId: item.siteId,
              siteName: item.siteName,
            })
          }
          activeOpacity={0.85}
        >
          <Ionicons name="business-outline" size={18} color="#2563EB" />
          <Text style={styles.flatsButtonText}>Flats</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statusButton,
            item.active ? styles.deactivateButton : styles.activateButton,
          ]}
          onPress={() => onToggle(item.siteId, item.active)}
          activeOpacity={0.85}
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

          <Text style={styles.statusButtonText}>
            {item.active ? "Deactivate" : "Activate"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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

function getStatusColor(status) {
  switch (status) {
    case "ACTIVE":
      return { bg: "#DCFCE7", text: "#16A34A" };
    case "TRIAL":
      return { bg: "#FEF3C7", text: "#D97706" };
    case "EXPIRED":
      return { bg: "#FEE2E2", text: "#DC2626" };
    default:
      return { bg: "#F3F4F6", text: "#6B7280" };
  }
}

function formatDate(value) {
  if (!value) return "-";

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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  header: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  headerTextBlock: {
    flex: 1,
    paddingRight: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
  },

  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 5,
    lineHeight: 20,
    fontWeight: "600",
  },

  addButton: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  searchBox: {
    marginHorizontal: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 14,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#111827",
    fontWeight: "600",
  },

  listContainer: {
    padding: 18,
    paddingTop: 2,
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

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 28,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginTop: 12,
  },

  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 6,
    textAlign: "center",
    lineHeight: 20,
  },

  siteCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  siteTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  siteIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  siteTextBlock: {
    flex: 1,
    paddingRight: 8,
  },

  siteName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },

  flatText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "700",
    marginTop: 4,
  },

  locationText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "700",
    marginTop: 3,
  },

  statusBadge: {
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "900",
  },

  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 14,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },

  infoLabel: {
    width: 125,
    marginLeft: 8,
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "700",
  },

  infoValue: {
    flex: 1,
    fontSize: 13,
    color: "#111827",
    fontWeight: "800",
    textAlign: "right",
  },

  activeBadge: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: "center",
  },

  activeOn: {
    backgroundColor: "#DCFCE7",
  },

  activeOff: {
    backgroundColor: "#F3F4F6",
  },

  activeText: {
    fontSize: 13,
    fontWeight: "900",
  },

  activeTextOn: {
    color: "#16A34A",
  },

  activeTextOff: {
    color: "#6B7280",
  },

  actionGrid: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: 8,
  },

  editButton: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EEF5FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  editText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "900",
    color: "#2563EB",
  },

  flatsButton: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EEF5FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  flatsButtonText: {
    marginLeft: 5,
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "900",
  },

  statusButton: {
    flex: 1.25,
    height: 44,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  activateButton: {
    backgroundColor: "#16A34A",
  },

  deactivateButton: {
    backgroundColor: "#DC2626",
  },

  statusButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    marginLeft: 5,
    fontSize: 13,
  },
});