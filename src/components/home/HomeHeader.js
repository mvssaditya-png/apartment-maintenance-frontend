import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HomeHeader({
  user,
  greeting,
  notificationCount = 0,
  onNotificationPress,
}) {
  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
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

      <TouchableOpacity
        style={styles.notificationButton}
        onPress={onNotificationPress}
        activeOpacity={0.8}
      >
        <Ionicons name="notifications-outline" size={24} color="#111827" />

        {notificationCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {notificationCount > 99 ? "99+" : notificationCount}
            </Text>
          </View>
        )}
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

  leftSection: {
    flex: 1,
    paddingRight: 12,
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
    top: 3,
    right: 3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },
});