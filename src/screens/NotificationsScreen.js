import React, { useCallback, useContext, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import {
  getMyNotifications,
  markNotificationRead,
} from "../api/dashboardApi";

import { t } from "../i18n";
import { LanguageContext } from "../context/LanguageContext";

export default function NotificationsScreen() {
  const { language } = useContext(LanguageContext);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const res = await getMyNotifications();

      setNotifications(res.data || []);
    } catch (error) {
      console.log("NOTIFICATIONS ERROR:", error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkRead = async (item) => {
    if (item.isRead) return;

    try {
      await markNotificationRead(item.notificationId);
      await loadNotifications();
    } catch (error) {
      console.log("MARK READ ERROR:", error?.response?.data || error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563EB" />

          <Text style={styles.loaderText}>
            {t("notifications.loading")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>
          {t("notifications.title")}
        </Text>

        {notifications.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="notifications-outline" size={46} color="#2563EB" />

            <Text style={styles.emptyTitle}>
              {t("notifications.noNotifications")}
            </Text>

            <Text style={styles.emptyText}>
              {t("notifications.noNotificationsSubtitle")}
            </Text>
          </View>
        ) : (
          notifications.map((item) => (
            <TouchableOpacity
              key={item.notificationId}
              style={[
                styles.card,
                !item.isRead && styles.unreadCard,
              ]}
              onPress={() => handleMarkRead(item)}
              activeOpacity={0.8}
            >
              <View style={styles.topRow}>
                <View style={styles.iconBox}>
                  <Ionicons
                    name={getIcon(item.type)}
                    size={24}
                    color="#2563EB"
                  />
                </View>

                <View style={styles.textBlock}>
                  <Text style={styles.title}>
                    {item.title}
                  </Text>

                  <Text style={styles.date}>
                    {formatDate(item.createdAt)}
                  </Text>
                </View>

                {!item.isRead && <View style={styles.unreadDot} />}
              </View>

              <Text style={styles.message}>
                {item.message}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getIcon(type) {
  if (type === "NOTICE") return "megaphone-outline";
  if (type === "DUE_REMINDER") return "alarm-outline";
  if (type === "PAYMENT") return "wallet-outline";

  return "notifications-outline";
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return String(value).substring(0, 10);
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

  heading: {
    fontSize: 30,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 20,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginTop: 12,
  },

  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  unreadCard: {
    borderColor: "#2563EB",
    backgroundColor: "#EEF4FF",
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  textBlock: {
    flex: 1,
  },

  title: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },

  date: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },

  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563EB",
  },

  message: {
    fontSize: 14,
    color: "#374151",
    marginTop: 14,
    lineHeight: 21,
  },
});