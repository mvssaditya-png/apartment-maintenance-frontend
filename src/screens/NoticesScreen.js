import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
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

import AppCard from "../components/common/AppCard";
import AppButton from "../components/common/AppButton";
import AppInput from "../components/common/AppInput";
import EmptyState from "../components/common/EmptyState";
import StatusBadge from "../components/common/StatusBadge";

import { COLORS } from "../components/common/theme";

export default function NoticesScreen() {
  const [user, setUser] = useState(null);

  const [notices, setNotices] = useState([]);

  const [title, setTitle] = useState("");

  const [message, setMessage] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);

      const [userRes, noticesRes] =
        await Promise.all([
          getLoggedInUser(),
          getNotices(),
        ]);

      setUser(userRes.data);

      setNotices(
        noticesRes.data || []
      );
    } catch (error) {
      console.log(
        "NOTICES ERROR:",
        error?.response?.data ||
          error
      );

      Alert.alert(
        "Error",
        "Unable to load notices."
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);

    await loadData();

    setRefreshing(false);
  };

  const isAdmin =
    user?.role?.toUpperCase() ===
    "ADMIN";

  const handleCreateNotice =
    async () => {
      if (!title.trim()) {
        Alert.alert(
          "Validation Error",
          "Please enter notice title."
        );

        return;
      }

      if (!message.trim()) {
        Alert.alert(
          "Validation Error",
          "Please enter notice message."
        );

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

        Alert.alert(
          "Success",
          "Notice created successfully."
        );

        await loadData();
      } catch (error) {
        console.log(
          "CREATE NOTICE ERROR:",
          error?.response?.data ||
            error
        );

        Alert.alert(
          "Error",
          "Unable to create notice."
        );
      } finally {
        setSaving(false);
      }
    };

  const handleToggleNotice =
    async (noticeId) => {
      try {
        await toggleNotice(
          noticeId
        );

        await loadData();
      } catch (error) {
        console.log(
          "TOGGLE NOTICE ERROR:",
          error?.response?.data ||
            error
        );

        Alert.alert(
          "Error",
          "Unable to update notice."
        );
      }
    };

  if (loading) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={
            styles.loaderContainer
          }
        >
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />

          <Text
            style={
              styles.loaderText
            }
          >
            Loading notices...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["bottom"]}
    >
      <ScrollView
        contentContainerStyle={
          styles.container
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={onRefresh}
            colors={[
              COLORS.primary,
            ]}
            tintColor={
              COLORS.primary
            }
          />
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <View
          style={
            styles.headerCard
          }
        >
          <Ionicons
            name="megaphone-outline"
            size={42}
            color="#FFFFFF"
          />

          <Text
            style={styles.heading}
          >
            Notices
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Society announcements,
            maintenance updates and
            important information.
          </Text>
        </View>

        {isAdmin && (
          <AppCard
            style={styles.formCard}
          >
            <Text
              style={
                styles.formTitle
              }
            >
              Create Notice
            </Text>

            <AppInput
              label="Title"
              placeholder="Example: Water supply maintenance"
              value={title}
              onChangeText={setTitle}
            />

            <AppInput
              label="Message"
              placeholder="Write notice message..."
              value={message}
              onChangeText={
                setMessage
              }
              multiline
            />

            <AppButton
              title="Publish Notice"
              onPress={
                handleCreateNotice
              }
              loading={saving}
            />
          </AppCard>
        )}

        <Text
          style={
            styles.sectionTitle
          }
        >
          Recent Notices
        </Text>

        {notices.length ===
        0 ? (
          <AppCard>
            <EmptyState
              icon="megaphone-outline"
              title="No notices found"
              subtitle="Society announcements will appear here."
            />
          </AppCard>
        ) : (
          notices.map((item) => (
            <AppCard
              key={item.noticeId}
              style={
                styles.noticeCard
              }
            >
              <View
                style={
                  styles.noticeTop
                }
              >
                <View
                  style={
                    styles.iconBox
                  }
                >
                  <Ionicons
                    name="megaphone-outline"
                    size={24}
                    color={
                      COLORS.primary
                    }
                  />
                </View>

                <View
                  style={
                    styles.noticeTextBlock
                  }
                >
                  <Text
                    style={
                      styles.noticeTitle
                    }
                  >
                    {item.title}
                  </Text>

                  <Text
                    style={
                      styles.noticeDate
                    }
                  >
                    {formatDate(
                      item.createdAt
                    )}
                  </Text>
                </View>

                {isAdmin && (
                  <StatusBadge
                    status={
                      item.active
                        ? "ACTIVE"
                        : "INACTIVE"
                    }
                  />
                )}
              </View>

              <Text
                style={
                  styles.noticeMessage
                }
              >
                {item.message}
              </Text>

              {isAdmin && (
                <AppButton
                  title={
                    item.active
                      ? "Deactivate"
                      : "Activate"
                  }
                  variant={
                    item.active
                      ? "secondary"
                      : "primary"
                  }
                  onPress={() =>
                    handleToggleNotice(
                      item.noticeId
                    )
                  }
                  style={
                    styles.toggleButton
                  }
                />
              )}
            </AppCard>
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
    return String(
      value
    ).substring(0, 10);
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  container: {
    padding: 18,
    paddingBottom: 100,
  },

  loaderContainer: {
    flex: 1,
    justifyContent:
      "center",
    alignItems: "center",
  },

  loaderText: {
    marginTop: 10,
    color:
      COLORS.textMuted,
    fontWeight: "600",
  },

  headerCard: {
    backgroundColor:
      COLORS.primary,
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
  },

  heading: {
    fontSize: 30,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 10,
  },

  subtitle: {
    fontSize: 14,
    color: "#DBEAFE",
    marginTop: 6,
    lineHeight: 21,
    fontWeight: "600",
  },

  formCard: {
    marginBottom: 24,
    borderRadius: 24,
  },

  formTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 23,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 14,
  },

  noticeCard: {
    marginBottom: 16,
    borderRadius: 22,
  },

  noticeTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor:
      "#EEF5FF",
    alignItems: "center",
    justifyContent:
      "center",
    marginRight: 12,
  },

  noticeTextBlock: {
    flex: 1,
    paddingRight: 10,
  },

  noticeTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
  },

  noticeDate: {
    fontSize: 12,
    color:
      COLORS.textMuted,
    marginTop: 4,
    fontWeight: "600",
  },

  noticeMessage: {
    fontSize: 14,
    color:
      COLORS.textSecondary,
    marginTop: 16,
    lineHeight: 22,
    fontWeight: "500",
  },

  toggleButton: {
    marginTop: 18,
  },
});