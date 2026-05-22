import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HomeHeader({ user, greeting }) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>{greeting} 👋</Text>

        <Text style={styles.userName}>
          {user?.name || "Resident"}
        </Text>

        <Text style={styles.flatText}>
          Flat {user?.flatNumber || user?.flat_number || "-"}
          {(user?.siteName || user?.site_name)
            ? `, ${user?.siteName || user?.site_name}`
            : ""}
        </Text>
      </View>

      <TouchableOpacity style={styles.notificationButton}>
        <Ionicons name="notifications-outline" size={24} color="#111827" />

        <View style={styles.badge}>
          <Text style={styles.badgeText}>3</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  greeting: {
    fontSize: 15,
    color: "#4B5563",
    marginBottom: 4,
  },

  userName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
  },

  flatText: {
    fontSize: 15,
    color: "#4B5563",
    marginTop: 4,
  },

  notificationButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  badge: {
    position: "absolute",
    top: 5,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
});