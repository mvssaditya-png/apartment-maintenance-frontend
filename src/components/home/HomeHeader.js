import React from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../common/theme";
import { t } from "../../i18n";

export default function HomeHeader({
  user,
  greeting,
  notificationCount = 0,
  onNotificationPress,
}) {
  const userName =
    user?.name ||
    user?.fullName ||
    "Resident";

  const flatNumber =
    user?.flatNumber ||
    user?.flatNo ||
    "";

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={styles.greeting}>
          {greeting}
        </Text>

        <Text
          style={styles.userName}
          numberOfLines={1}
        >
          {userName}
        </Text>

        <View style={styles.infoRow}>
          {flatNumber ? (
            <View style={styles.flatContainer}>
              <Ionicons
                name="home-outline"
                size={14}
                color={COLORS.primary}
              />

              <Text
                style={styles.flatText}
                numberOfLines={1}
              >
                {t("home.flat")} {flatNumber}
              </Text>
            </View>
          ) : null}

          {user?.siteName ? (
            <View style={styles.apartmentContainer}>
              <Ionicons
                name="business-outline"
                size={14}
                color={COLORS.purple}
              />

              <Text
                style={styles.apartmentText}
                numberOfLines={1}
              >
                {user.siteName}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <TouchableOpacity
        style={styles.notificationButton}
        activeOpacity={0.85}
        onPress={onNotificationPress}
      >
        <Ionicons
          name="notifications-outline"
          size={24}
          color={COLORS.text}
        />

        {notificationCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {notificationCount > 99
                ? "99+"
                : notificationCount}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  leftSection: {
    flex: 1,
    paddingRight: 12,
  },

  greeting: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 4,
    fontWeight: "600",
  },

  userName: {
    fontSize: 26,
    color: COLORS.text,
    fontWeight: "900",
    marginBottom: 10,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  flatContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF5FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },

  flatText: {
    marginLeft: 5,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "700",
  },

  apartmentContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 8,
    maxWidth: "100%",
    flexShrink: 1,
  },

  apartmentText: {
    marginLeft: 5,
    fontSize: 12,
    color: COLORS.purple,
    fontWeight: "700",
    flexShrink: 1,
  },

  notificationButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    minWidth: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: COLORS.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "900",
  },
});