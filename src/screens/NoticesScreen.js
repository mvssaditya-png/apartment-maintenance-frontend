import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import {
  getLoggedInUser,
  getNotices,
  createNotice,
  toggleNotice,
} from "../api/dashboardApi";

export default function NoticesScreen() {
  const [user, setUser] = useState(null);
  const [notices, setNotices] = useState([]);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);

      const [userRes, noticesRes] = await Promise.all([
        getLoggedInUser(),
        getNotices(),
      ]);

      setUser(userRes.data);
      setNotices(noticesRes.data || []);
    } catch (error) {
      console.log("NOTICES ERROR:", error?.response?.data || error);
      Alert.alert("Error", "Unable to load notices.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  const handleCreateNotice = async () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Please enter notice title.");
      return;
    }

    if (!message.trim()) {
      Alert.alert("Validation Error", "Please enter notice message.");
      return;
    }

    try {
      setSaving(true);

      await createNotice({
        title: title.trim(),
        message: message.trim(),
      });

      setTitle("");
      setMessage("");

      Alert.alert("Success", "Notice created successfully.");

      await loadData();
    } catch (error) {
      console.log("CREATE NOTICE ERROR:", error?.response?.data || error);
      Alert.alert("Error", "Unable to create notice.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleNotice = async (noticeId) => {
    try {
      await toggleNotice(noticeId);
      await loadData();
    } catch (error) {
      console.log("TOGGLE NOTICE ERROR:", error?.response?.data || error);
      Alert.alert("Error", "Unable to update notice.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loaderText}>Loading notices...</Text>
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
        <Text style={styles.heading}>Notices</Text>
        <Text style={styles.subtitle}>
          View society announcements and important updates.
        </Text>

        {isAdmin && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Create Notice</Text>

            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Example: Water supply maintenance"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Message</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Write notice message..."
              value={message}
              onChangeText={setMessage}
              multiline
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleCreateNotice}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Publish Notice</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Recent Notices</Text>

        {notices.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="megaphone-outline" size={44} color="#2563EB" />
            <Text style={styles.emptyTitle}>No notices found</Text>
            <Text style={styles.emptyText}>
              Society announcements will appear here.
            </Text>
          </View>
        ) : (
          notices.map((item) => (
            <View key={item.noticeId} style={styles.noticeCard}>
              <View style={styles.noticeTop}>
                <View style={styles.iconBox}>
                  <Ionicons name="megaphone-outline" size={24} color="#2563EB" />
                </View>

                <View style={styles.noticeTextBlock}>
                  <Text style={styles.noticeTitle}>{item.title}</Text>
                  <Text style={styles.noticeDate}>
                    {formatDate(item.createdAt)}
                  </Text>
                </View>

                {isAdmin && (
                  <View
                    style={[
                      styles.statusBadge,
                      item.active ? styles.activeBadge : styles.inactiveBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        item.active
                          ? styles.activeStatusText
                          : styles.inactiveStatusText,
                      ]}
                    >
                      {item.active ? "Active" : "Inactive"}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.noticeMessage}>{item.message}</Text>

              {isAdmin && (
                <TouchableOpacity
                  style={styles.toggleButton}
                  onPress={() => handleToggleNotice(item.noticeId)}
                >
                  <Text style={styles.toggleButtonText}>
                    {item.active ? "Deactivate" : "Activate"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
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
  },

  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 22,
    lineHeight: 22,
  },

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 24,
  },

  formTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: "800",
    color: "#374151",
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
    marginBottom: 16,
  },

  messageInput: {
    minHeight: 110,
    textAlignVertical: "top",
  },

  saveButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 14,
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

  noticeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  noticeTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  noticeTextBlock: {
    flex: 1,
  },

  noticeTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },

  noticeDate: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },

  noticeMessage: {
    fontSize: 14,
    color: "#374151",
    marginTop: 14,
    lineHeight: 21,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },

  activeBadge: {
    backgroundColor: "#DCFCE7",
  },

  inactiveBadge: {
    backgroundColor: "#F3F4F6",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "900",
  },

  activeStatusText: {
    color: "#16A34A",
  },

  inactiveStatusText: {
    color: "#6B7280",
  },

  toggleButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },

  toggleButtonText: {
    color: "#374151",
    fontWeight: "900",
  },
});