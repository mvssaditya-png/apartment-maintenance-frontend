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
  getMeetings,
  createMeeting,
  updateMeeting,
  toggleMeeting,
} from "../api/dashboardApi";

const MEETING_STATUSES = [
  "UPCOMING",
  "ONGOING",
  "COMPLETED",
  "CANCELLED",
];

export default function MeetingsScreen() {
  const [user, setUser] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [editingMeeting, setEditingMeeting] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
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
      Alert.alert("Error", "Unable to load meetings.");
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
    setLocation("");
    setActive(true);
    setStatus("UPCOMING");
  };

  const startEdit = (item) => {
    setEditingMeeting(item);
    setTitle(item.title || "");
    setDescription(item.description || "");
    setMeetingDate(formatInputDate(item.meetingDate));
    setLocation(item.location || "");
    setActive(Boolean(item.active));
    setStatus(item.status || "UPCOMING");
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Please enter meeting title.");
      return;
    }

    if (!meetingDate.trim()) {
      Alert.alert("Validation Error", "Please enter meeting date and time.");
      return;
    }

    const parsedDate = new Date(toLocalDateTime(meetingDate.trim()));

    if (isNaN(parsedDate.getTime())) {
      Alert.alert(
        "Validation Error",
        "Please enter date in format YYYY-MM-DD HH:mm"
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
        Alert.alert("Success", "Meeting updated successfully.");
      } else {
        await createMeeting(payload);
        Alert.alert("Success", "Meeting created successfully.");
      }

      resetForm();
      await loadData();
    } catch (error) {
      console.log("SAVE MEETING ERROR:", error?.response?.data || error);
      Alert.alert("Error", "Unable to save meeting.");
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
      Alert.alert("Error", "Unable to update meeting status.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loaderText}>Loading meetings...</Text>
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
        <View style={styles.headerCard}>
          <Ionicons name="people-outline" size={42} color="#FFFFFF" />
          <Text style={styles.heading}>Meetings</Text>
          <Text style={styles.subtitle}>
            View society meetings and important discussions.
          </Text>
        </View>

        {isAdmin && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {editingMeeting ? "Update Meeting" : "Create Meeting"}
            </Text>

            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Example: Monthly Society Meeting"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Meeting agenda..."
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Text style={styles.label}>Meeting Date & Time</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD HH:mm"
              value={meetingDate}
              onChangeText={setMeetingDate}
            />

            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Example: Clubhouse / Parking Area"
              value={location}
              onChangeText={setLocation}
            />

            <Text style={styles.label}>Meeting Status</Text>

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
                style={[styles.activeButton, active && styles.activeButtonOn]}
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
                  {active ? "Active" : "Inactive"}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {editingMeeting ? "Update Meeting" : "Create Meeting"}
                </Text>
              )}
            </TouchableOpacity>

            {editingMeeting && (
              <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                <Text style={styles.cancelButtonText}>Cancel Edit</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <Text style={styles.sectionTitle}>Upcoming / Recent Meetings</Text>

        {meetings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={46} color="#2563EB" />
            <Text style={styles.emptyTitle}>No meetings found</Text>
            <Text style={styles.emptyText}>
              Society meetings will appear here.
            </Text>
          </View>
        ) : (
          meetings.map((item) => (
            <View key={item.meetingId} style={styles.meetingCard}>
              <View style={styles.meetingTop}>
                <View style={styles.iconBox}>
                  <Ionicons name="calendar-outline" size={24} color="#2563EB" />
                </View>

                <View style={styles.meetingTextBlock}>
                  <Text style={styles.meetingTitle}>{item.title}</Text>
                  <Text style={styles.meetingDate}>
                    {formatDisplayDate(item.meetingDate)}
                  </Text>
                </View>

                <View style={[styles.meetingStatusBadge, getStatusStyle(item.status)]}>
                  <Text style={styles.meetingStatusText}>
                    {formatStatus(item.status)}
                  </Text>
                </View>
              </View>

              {item.location ? (
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={18} color="#6B7280" />
                  <Text style={styles.locationText}>{item.location}</Text>
                </View>
              ) : null}

              {item.description ? (
                <Text style={styles.description}>{item.description}</Text>
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
                      {item.active ? "Visible to residents" : "Hidden from residents"}
                    </Text>
                  </View>

                  <View style={styles.adminActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => startEdit(item)}
                    >
                      <Text style={styles.editText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.toggleButton}
                      onPress={() => handleToggle(item.meetingId)}
                    >
                      <Text style={styles.toggleText}>
                        {item.active ? "Deactivate" : "Activate"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
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
  if (!value) return "Upcoming";

  return value
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStatusStyle(status) {
  if (status === "ONGOING") {
    return {
      backgroundColor: "#DBEAFE",
    };
  }

  if (status === "COMPLETED") {
    return {
      backgroundColor: "#DCFCE7",
    };
  }

  if (status === "CANCELLED") {
    return {
      backgroundColor: "#FEE2E2",
    };
  }

  return {
    backgroundColor: "#FEF3C7",
  };
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
    padding: 22,
    marginBottom: 24,
  },

  heading: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 10,
  },

  subtitle: {
    fontSize: 14,
    color: "#DBEAFE",
    marginTop: 6,
    lineHeight: 21,
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
    minHeight: 100,
    textAlignVertical: "top",
  },

  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },

  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginRight: 8,
    marginBottom: 10,
  },

  statusButtonActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  statusButtonText: {
    color: "#374151",
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
    borderRadius: 14,
    paddingVertical: 13,
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

  cancelButton: {
    marginTop: 12,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },

  cancelButtonText: {
    color: "#374151",
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

  meetingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  meetingTop: {
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

  meetingTextBlock: {
    flex: 1,
  },

  meetingTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },

  meetingDate: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },

  meetingStatusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },

  meetingStatusText: {
    color: "#111827",
    fontSize: 11,
    fontWeight: "900",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },

  locationText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#374151",
    fontWeight: "700",
  },

  description: {
    fontSize: 14,
    color: "#374151",
    marginTop: 12,
    lineHeight: 21,
  },

  activeInfoBadge: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
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
    marginTop: 14,
  },

  editButton: {
    width: "48%",
    backgroundColor: "#EEF4FF",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },

  editText: {
    color: "#2563EB",
    fontWeight: "900",
  },

  toggleButton: {
    width: "48%",
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },

  toggleText: {
    color: "#374151",
    fontWeight: "900",
  },
});