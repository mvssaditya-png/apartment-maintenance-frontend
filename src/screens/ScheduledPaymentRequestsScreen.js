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
  getScheduledPaymentRequests,
  createScheduledPaymentRequest,
  updateScheduledPaymentRequest,
  toggleScheduledPaymentRequest,
} from "../api/dashboardApi";

export default function ScheduledPaymentRequestsScreen() {
  const [schedules, setSchedules] = useState([]);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const [title, setTitle] = useState("Monthly Maintenance");
  const [description, setDescription] = useState("Monthly maintenance payment");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("10");
  const [reminderFrequencyDays, setReminderFrequencyDays] = useState("3");
  const [active, setActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadSchedules();
    }, [])
  );

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const res = await getScheduledPaymentRequests();
      setSchedules(res.data || []);
    } catch (error) {
      console.log("SCHEDULE LOAD ERROR:", error?.response?.data || error);
      Alert.alert("Error", "Unable to load schedules.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSchedules();
    setRefreshing(false);
  };

  const resetForm = () => {
    setEditingSchedule(null);
    setTitle("Monthly Maintenance");
    setDescription("Monthly maintenance payment");
    setAmount("");
    setDueDay("10");
    setReminderFrequencyDays("3");
    setActive(true);
  };

  const startEdit = (item) => {
    setEditingSchedule(item);
    setTitle(item.title || "");
    setDescription(item.description || "");
    setAmount(String(item.amount || ""));
    setDueDay(String(item.dueDay || ""));
    setReminderFrequencyDays(String(item.reminderFrequencyDays || "3"));
    setActive(Boolean(item.active));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Please enter title.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      Alert.alert("Validation Error", "Please enter valid amount.");
      return;
    }

    if (!dueDay || Number(dueDay) < 1 || Number(dueDay) > 31) {
      Alert.alert("Validation Error", "Due day must be between 1 and 31.");
      return;
    }

    if (
      !reminderFrequencyDays ||
      Number(reminderFrequencyDays) < 1 ||
      Number(reminderFrequencyDays) > 30
    ) {
      Alert.alert(
        "Validation Error",
        "Reminder frequency must be between 1 and 30 days."
      );
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      amount: Number(amount),
      dueDay: Number(dueDay),
      reminderFrequencyDays: Number(reminderFrequencyDays),
      active,
    };

    try {
      setSaving(true);

      if (editingSchedule) {
        await updateScheduledPaymentRequest(editingSchedule.scheduleId, payload);
        Alert.alert("Success", "Schedule updated successfully.");
      } else {
        await createScheduledPaymentRequest(payload);
        Alert.alert("Success", "Schedule created successfully.");
      }

      resetForm();
      await loadSchedules();
    } catch (error) {
      console.log("SAVE SCHEDULE ERROR:", error?.response?.data || error);
      Alert.alert("Error", "Unable to save schedule.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (scheduleId) => {
    try {
      await toggleScheduledPaymentRequest(scheduleId);
      await loadSchedules();
    } catch (error) {
      console.log("TOGGLE SCHEDULE ERROR:", error?.response?.data || error);
      Alert.alert("Error", "Unable to update schedule status.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loaderText}>Loading schedules...</Text>
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
        <Text style={styles.heading}>Scheduled Maintenance</Text>
        <Text style={styles.subtitle}>
          Automatically generate monthly maintenance on 1st day at 6 AM.
        </Text>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            {editingSchedule ? "Update Schedule" : "Create Schedule"}
          </Text>

          <FieldLabel label="Title" />
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Monthly Maintenance"
          />

          <FieldLabel label="Description" />
          <TextInput
            style={[styles.input, styles.multiInput]}
            value={description}
            onChangeText={setDescription}
            placeholder="Monthly maintenance payment"
            multiline
          />

          <FieldLabel label="Amount" />
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ""))}
            placeholder="2000"
            keyboardType="numeric"
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <FieldLabel label="Due Day" />
              <TextInput
                style={styles.input}
                value={dueDay}
                onChangeText={(text) => setDueDay(text.replace(/[^0-9]/g, ""))}
                placeholder="10"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.half}>
              <FieldLabel label="Reminder Days" />
              <TextInput
                style={styles.input}
                value={reminderFrequencyDays}
                onChangeText={(text) =>
                  setReminderFrequencyDays(text.replace(/[^0-9]/g, ""))
                }
                placeholder="3"
                keyboardType="numeric"
              />
            </View>
          </View>

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

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>
                {editingSchedule ? "Update Schedule" : "Create Schedule"}
              </Text>
            )}
          </TouchableOpacity>

          {editingSchedule && (
            <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
              <Text style={styles.cancelButtonText}>Cancel Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionTitle}>Existing Schedules</Text>

        {schedules.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={44} color="#2563EB" />
            <Text style={styles.emptyTitle}>No schedules found</Text>
            <Text style={styles.emptyText}>
              Create a schedule to automate monthly maintenance.
            </Text>
          </View>
        ) : (
          schedules.map((item) => (
            <View key={item.scheduleId} style={styles.scheduleCard}>
              <View style={styles.scheduleTop}>
                <View style={styles.iconBox}>
                  <Ionicons name="calendar-outline" size={24} color="#2563EB" />
                </View>

                <View style={styles.scheduleTextBlock}>
                  <Text style={styles.scheduleTitle}>{item.title}</Text>
                  <Text style={styles.scheduleSubtitle}>
                    Due day {item.dueDay} • Reminder every{" "}
                    {item.reminderFrequencyDays} days
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    item.active ? styles.statusActive : styles.statusInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      item.active
                        ? styles.statusTextActive
                        : styles.statusTextInactive,
                    ]}
                  >
                    {item.active ? "Active" : "Inactive"}
                  </Text>
                </View>
              </View>

              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Amount</Text>
                <Text style={styles.amount}>₹{formatAmount(item.amount)}</Text>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => startEdit(item)}
                >
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.toggleButton}
                  onPress={() => handleToggle(item.scheduleId)}
                >
                  <Text style={styles.toggleText}>
                    {item.active ? "Deactivate" : "Activate"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function FieldLabel({ label }) {
  return <Text style={styles.label}>{label}</Text>;
}

function formatAmount(value) {
  if (value === null || value === undefined || value === "") return "0";
  return Number(value).toLocaleString("en-IN");
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
    alignItems: "center",
    justifyContent: "center",
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
  multiInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  half: {
    width: "48%",
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
  scheduleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
  },
  scheduleTop: {
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
  scheduleTextBlock: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },
  scheduleSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: "#DCFCE7",
  },
  statusInactive: {
    backgroundColor: "#F3F4F6",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "900",
  },
  statusTextActive: {
    color: "#16A34A",
  },
  statusTextInactive: {
    color: "#6B7280",
  },
  amountRow: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  amountLabel: {
    color: "#6B7280",
    fontWeight: "800",
  },
  amount: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  editButton: {
    width: "48%",
    backgroundColor: "#EEF4FF",
    paddingVertical: 13,
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
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
  },
  toggleText: {
    color: "#374151",
    fontWeight: "900",
  },
});