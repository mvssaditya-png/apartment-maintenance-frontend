import React, { useCallback, useContext, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { getLoggedInUser, getMySite } from "../api/dashboardApi";
import { AuthContext } from "../context/AuthContext";

export default function ProfileScreen() {
  const { logout } = useContext(AuthContext);

  const [user, setUser] = useState(null);
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    try {
      setLoading(true);

      const [userRes, siteRes] = await Promise.all([
        getLoggedInUser(),
        getMySite(),
      ]);

      setUser(userRes.data);
      setSite(siteRes.data);
    } catch (error) {
      console.log("PROFILE ERROR:", error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: logout,
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loaderText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const initials = getInitials(user?.name);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <Text style={styles.name}>{user?.name || "User"}</Text>

          <View style={styles.rolePill}>
            <Text style={styles.roleText}>{user?.role || "-"}</Text>
          </View>

          <Text style={styles.flatText}>
            Flat {user?.flatNumber || user?.flat_number || "-"}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>User Details</Text>

        <View style={styles.card}>
          <InfoRow
            icon="call-outline"
            label="Phone Number"
            value={user?.phoneNumber || user?.phone_number || "-"}
          />

          <InfoRow
            icon="mail-outline"
            label="Email"
            value={user?.email || "-"}
          />

          <InfoRow
            icon="person-outline"
            label="Role"
            value={user?.role || "-"}
          />

          <InfoRow
            icon="home-outline"
            label="Flat Number"
            value={user?.flatNumber || user?.flat_number || "-"}
          />
        </View>

        <Text style={styles.sectionTitle}>Society Details</Text>

        <View style={styles.card}>
          <InfoRow
            icon="business-outline"
            label="Society Name"
            value={site?.siteName || site?.site_name || "-"}
          />

          <InfoRow
            icon="location-outline"
            label="Address"
            value={site?.address || "-"}
          />

          <InfoRow
            icon="albums-outline"
            label="Total Flats"
            value={String(site?.totalFlats ?? "-")}
          />
        </View>

        <Text style={styles.sectionTitle}>App</Text>

        <View style={styles.card}>
          <InfoRow
            icon="information-circle-outline"
            label="App Version"
            value="1.0.0"
          />

          <InfoRow
            icon="shield-checkmark-outline"
            label="Privacy"
            value="Coming soon"
          />

          <InfoRow
            icon="help-circle-outline"
            label="Support"
            value="Coming soon"
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconBox}>
        <Ionicons name={icon} size={20} color="#2563EB" />
      </View>

      <View style={styles.infoTextBlock}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function getInitials(name) {
  if (!name) return "U";

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
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
    color: "#6B7280",
  },

  headerCard: {
    backgroundColor: "#2563EB",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },

  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  avatarText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#2563EB",
  },

  name: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  rolePill: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 10,
  },

  roleText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },

  flatText: {
    color: "#DBEAFE",
    marginTop: 10,
    fontSize: 14,
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  infoIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoTextBlock: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "700",
  },

  infoValue: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "800",
    marginTop: 3,
  },

  logoutButton: {
    backgroundColor: "#DC2626",
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 6,
  },

  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    marginLeft: 8,
  },
});