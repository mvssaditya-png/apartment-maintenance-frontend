import React, { useCallback, useContext, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

import {
  getLoggedInUser,
  getMeetings,
  createMeeting,
  updateMeeting,
  toggleMeeting,
} from "../api/dashboardApi";

import AppCard from "../components/common/AppCard";
import AppButton from "../components/common/AppButton";
import AppInput from "../components/common/AppInput";
import EmptyState from "../components/common/EmptyState";
import StatusBadge from "../components/common/StatusBadge";

import { COLORS } from "../components/common/theme";
import { t } from "../i18n";
import { LanguageContext } from "../context/LanguageContext";

const MEETING_STATUSES = [
  "UPCOMING",
  "ONGOING",
  "COMPLETED",
  "CANCELLED",
];

export default function MeetingsScreen() {
  const { language } = useContext(LanguageContext);

  const [user, setUser] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [editingMeeting, setEditingMeeting] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [selectedMeetingDate, setSelectedMeetingDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [location, setLocation] = useState("");
  const [active, setActive] = useState(true);
  const [status, setStatus] = useState("UPCOMING");

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

      const [userRes, meetingsRes] = await Promise.all([
        getLoggedInUser(),
        getMeetings(),
      ]);

      setUser(userRes.data);
      setMeetings(meetingsRes.data || []);
    } catch (error) {
      console.log("MEETINGS ERROR:", error?.response?.data || error);

      Alert.alert(t("common.error"), t("meetings.loadFailed"));
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

  const resetForm = () => {
    setEditingMeeting(null);
    setTitle("");
    setDescription("");
    setMeetingDate("");
    setSelectedMeetingDate(new Date());
    setShowDatePicker(false);
    setShowTimePicker(false);
    setLocation("");
    setActive(true);
    setStatus("UPCOMING");
  };

  const startEdit = (item) => {
    const formattedDate = formatInputDate(item.meetingDate);
    const dateObject = formattedDate
      ? new Date(toLocalDateTime(formattedDate))
      : new Date();

    setEditingMeeting(item);
    setTitle(item.title || "");
    setDescription(item.description || "");
    setMeetingDate(formattedDate);
    setSelectedMeetingDate(
      isNaN(dateObject.getTime()) ? new Date() : dateObject
    );
    setLocation(item.location || "");
    setActive(Boolean(item.active));
    setStatus(item.status || "UPCOMING");
  };

  const formatDateTimeForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const openDatePicker = () => {
    const dateObject = meetingDate
      ? new Date(toLocalDateTime(meetingDate))
      : new Date();

    setSelectedMeetingDate(
      isNaN(dateObject.getTime()) ? new Date() : dateObject
    );
    setShowDatePicker(true);
  };

  const openTimePicker = () => {
    const dateObject = meetingDate
      ? new Date(toLocalDateTime(meetingDate))
      : new Date();

    setSelectedMeetingDate(
      isNaN(dateObject.getTime()) ? new Date() : dateObject
    );
    setShowTimePicker(true);
  };

  const onMeetingDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event?.type === "dismissed" || !selectedDate) {
      return;
    }

    const updatedDate = new Date(selectedMeetingDate);
    updatedDate.setFullYear(selectedDate.getFullYear());
    updatedDate.setMonth(selectedDate.getMonth());
    updatedDate.setDate(selectedDate.getDate());

    setSelectedMeetingDate(updatedDate);
    setMeetingDate(formatDateTimeForInput(updatedDate));
  };

  const onMeetingTimeChange = (event, selectedTime) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }

    if (event?.type === "dismissed" || !selectedTime) {
      return;
    }

    const updatedDate = new Date(selectedMeetingDate);
    updatedDate.setHours(selectedTime.getHours());
    updatedDate.setMinutes(selectedTime.getMinutes());
    updatedDate.setSeconds(0);

    setSelectedMeetingDate(updatedDate);
    setMeetingDate(formatDateTimeForInput(updatedDate));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert(t("addExpense.validationError"), t("meetings.enterTitle"));
      return;
    }

    if (!meetingDate.trim()) {
      Alert.alert(t("addExpense.validationError"), t("meetings.enterDateTime"));
      return;
    }

    const parsedDate = new Date(toLocalDateTime(meetingDate.trim()));

    if (isNaN(parsedDate.getTime())) {
      Alert.alert(
        t("addExpense.validationError"),
        t("meetings.invalidDateFormat")
      );
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      meetingDate: toLocalDateTime(meetingDate.trim()),
      location: location.trim(),
      active,
      status,
    };

    try {
      setSaving(true);

      if (editingMeeting) {
        await updateMeeting(editingMeeting.meetingId, payload);
        Alert.alert(t("common.success"), t("meetings.updateSuccess"));
      } else {
        await createMeeting(payload);
        Alert.alert(t("common.success"), t("meetings.createSuccess"));
      }

      resetForm();
      await loadData();
    } catch (error) {
      console.log("SAVE MEETING ERROR:", error?.response?.data || error);

      Alert.alert(t("common.error"), t("meetings.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (meetingId) => {
    try {
      await toggleMeeting(meetingId);
      await loadData();
    } catch (error) {
      console.log("TOGGLE MEETING ERROR:", error?.response?.data || error);

      Alert.alert(t("common.error"), t("meetings.updateStatusFailed"));
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />

          <Text style={styles.loaderText}>
            {t("meetings.loading")}
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <Ionicons name="people-outline" size={42} color="#FFFFFF" />

          <Text style={styles.heading}>
            {t("meetings.title")}
          </Text>

          <Text style={styles.subtitle}>
            {t("meetings.subtitle")}
          </Text>
        </View>

        {isAdmin && (
          <AppCard style={styles.formCard}>
            <Text style={styles.formTitle}>
              {editingMeeting
                ? t("meetings.updateMeeting")
                : t("meetings.createMeeting")}
            </Text>

            <AppInput
              label={t("meetings.meetingTitle")}
              placeholder={t("meetings.titlePlaceholder")}
              value={title}
              onChangeText={setTitle}
            />

            <AppInput
              label={t("addExpense.description")}
              placeholder={t("meetings.descriptionPlaceholder")}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Text style={styles.label}>
              {t("meetings.meetingDateTime")}
            </Text>

            <View style={styles.dateTimeRow}>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={openDatePicker}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.dateTimeText,
                    !meetingDate && styles.placeholderText,
                  ]}
                >
                  {meetingDate ? meetingDate.substring(0, 10) : "Select Date"}
                </Text>

                <Ionicons
                  name="calendar-outline"
                  size={21}
                  color={COLORS.primary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={openTimePicker}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.dateTimeText,
                    !meetingDate && styles.placeholderText,
                  ]}
                >
                  {meetingDate ? meetingDate.substring(11, 16) : "Select Time"}
                </Text>

                <Ionicons
                  name="time-outline"
                  size={21}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={selectedMeetingDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                minimumDate={new Date()}
                onChange={onMeetingDateChange}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={selectedMeetingDate}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onMeetingTimeChange}
              />
            )}

            <AppInput
              label={t("meetings.location")}
              placeholder={t("meetings.locationPlaceholder")}
              value={location}
              onChangeText={setLocation}
            />

            <Text style={styles.label}>
              {t("meetings.meetingStatus")}
            </Text>

            <View style={styles.statusGrid}>
              {MEETING_STATUSES.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.statusButton,
                    status === item && styles.statusButtonActive,
                  ]}
                  onPress={() => setStatus(item)}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      status === item && styles.statusButtonTextActive,
                    ]}
                  >
                    {formatStatus(item)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {editingMeeting && (
              <TouchableOpacity
                style={[
                  styles.activeButton,
                  active && styles.activeButtonOn,
                ]}
                onPress={() => setActive(!active)}
              >
                <Ionicons
                  name={active ? "checkmark-circle" : "close-circle-outline"}
                  size={22}
                  color={active ? "#FFFFFF" : "#374151"}
                />

                <Text
                  style={[
                    styles.activeButtonText,
                    active && styles.activeButtonTextOn,
                  ]}
                >
                  {active ? t("meetings.active") : t("meetings.inactive")}
                </Text>
              </TouchableOpacity>
            )}

            <AppButton
              title={
                editingMeeting
                  ? t("meetings.updateMeeting")
                  : t("meetings.createMeeting")
              }
              onPress={handleSave}
              loading={saving}
            />

            {editingMeeting && (
              <AppButton
                title={t("meetings.cancelEdit")}
                variant="secondary"
                onPress={resetForm}
                style={styles.cancelButton}
              />
            )}
          </AppCard>
        )}

        <Text style={styles.sectionTitle}>
          {t("meetings.upcomingRecent")}
        </Text>

        {meetings.length === 0 ? (
          <AppCard>
            <EmptyState
              icon="calendar-outline"
              title={t("meetings.noMeetings")}
              subtitle={t("meetings.noMeetingsSubtitle")}
            />
          </AppCard>
        ) : (
          meetings.map((item) => (
            <AppCard key={item.meetingId} style={styles.meetingCard}>
              <View style={styles.meetingTop}>
                <View style={styles.iconBox}>
                  <Ionicons
                    name="calendar-outline"
                    size={24}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.meetingTextBlock}>
                  <Text style={styles.meetingTitle}>
                    {item.title}
                  </Text>

                  <Text style={styles.meetingDate}>
                    {formatDisplayDate(item.meetingDate)}
                  </Text>
                </View>

                <StatusBadge status={item.status} />
              </View>

              {item.location ? (
                <View style={styles.locationRow}>
                  <Ionicons
                    name="location-outline"
                    size={18}
                    color={COLORS.textMuted}
                  />

                  <Text style={styles.locationText}>
                    {item.location}
                  </Text>
                </View>
              ) : null}

              {item.description ? (
                <Text style={styles.description}>
                  {item.description}
                </Text>
              ) : null}

              {isAdmin && (
                <>
                  <View
                    style={[
                      styles.activeInfoBadge,
                      item.active ? styles.activeBadge : styles.inactiveBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.activeInfoText,
                        item.active
                          ? styles.activeStatusText
                          : styles.inactiveStatusText,
                      ]}
                    >
                      {item.active
                        ? t("meetings.visibleToResidents")
                        : t("meetings.hiddenFromResidents")}
                    </Text>
                  </View>

                  <View style={styles.adminActions}>
                    <AppButton
                      title={t("meetings.edit")}
                      variant="outline"
                      onPress={() => startEdit(item)}
                      style={styles.actionButton}
                    />

                    <AppButton
                      title={
                        item.active
                          ? t("notices.deactivate")
                          : t("notices.activate")
                      }
                      variant="secondary"
                      onPress={() => handleToggle(item.meetingId)}
                      style={styles.actionButton}
                    />
                  </View>
                </>
              )}
            </AppCard>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function toLocalDateTime(value) {
  if (!value) return "";

  if (value.includes("T")) {
    return value.length === 16 ? `${value}:00` : value;
  }

  return `${value.replace(" ", "T")}:00`;
}

function formatInputDate(value) {
  if (!value) return "";

  return String(value).replace("T", " ").substring(0, 16);
}

function formatDisplayDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return String(value).replace("T", " ").substring(0, 16);
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStatus(value) {
  if (!value) {
    return t("meetings.status.upcoming");
  }

  switch (value) {
    case "UPCOMING":
      return t("meetings.status.upcoming");

    case "ONGOING":
      return t("meetings.status.ongoing");

    case "COMPLETED":
      return t("meetings.status.completed");

    case "CANCELLED":
      return t("meetings.status.cancelled");

    default:
      return value;
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    color: COLORS.textMuted,
    fontWeight: "600",
  },

  headerCard: {
    backgroundColor: COLORS.primary,
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

  label: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textSecondary,
    marginBottom: 10,
  },

  dateTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  dateTimeButton: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dateTimeText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: "800",
  },

  placeholderText: {
    color: "#9CA3AF",
  },

  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 18,
  },

  statusButton: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginRight: 8,
    marginBottom: 10,
  },

  statusButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  statusButtonText: {
    color: COLORS.textSecondary,
    fontWeight: "800",
    fontSize: 13,
  },

  statusButtonTextActive: {
    color: "#FFFFFF",
  },

  activeButton: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 14,
  },

  activeButtonOn: {
    backgroundColor: "#16A34A",
    borderColor: "#16A34A",
  },

  activeButtonText: {
    marginLeft: 8,
    fontWeight: "900",
    color: "#374151",
  },

  activeButtonTextOn: {
    color: "#FFFFFF",
  },

  cancelButton: {
    marginTop: 12,
  },

  sectionTitle: {
    fontSize: 23,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 14,
  },

  meetingCard: {
    marginBottom: 16,
    borderRadius: 22,
  },

  meetingTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: "#EEF5FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  meetingTextBlock: {
    flex: 1,
    paddingRight: 10,
  },

  meetingTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
  },

  meetingDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    fontWeight: "600",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },

  locationText: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "700",
  },

  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
    lineHeight: 22,
    fontWeight: "500",
  },

  activeInfoBadge: {
    marginTop: 16,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignSelf: "flex-start",
  },

  activeBadge: {
    backgroundColor: "#DCFCE7",
  },

  inactiveBadge: {
    backgroundColor: "#F3F4F6",
  },

  activeInfoText: {
    fontSize: 12,
    fontWeight: "900",
  },

  activeStatusText: {
    color: "#16A34A",
  },

  inactiveStatusText: {
    color: "#6B7280",
  },

  adminActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },

  actionButton: {
    width: "48%",
  },
});