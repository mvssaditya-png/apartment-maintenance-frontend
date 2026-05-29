import React, { useCallback, useContext, useState } from "react";

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
  Linking,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import {
  getLoggedInUser,
  getEmergencyContacts,
  createEmergencyContact,
  updateEmergencyContact,
  toggleEmergencyContact,
} from "../api/dashboardApi";

import { t } from "../i18n";
import { LanguageContext } from "../context/LanguageContext";

const ROLES = [
  "SECURITY",
  "WATCHMAN",
  "ADMIN",
  "CASHIER",
  "PLUMBER",
  "ELECTRICIAN",
  "AMBULANCE",
  "FIRE",
  "POLICE",
  "OTHER",
];

export default function SOSScreen() {
  const { language } = useContext(LanguageContext);

  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [editingContact, setEditingContact] = useState(null);

  const [name, setName] = useState("");
  const [role, setRole] = useState("SECURITY");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [priority, setPriority] = useState("1");
  const [active, setActive] = useState(true);

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

      const [userRes, contactsRes] = await Promise.all([
        getLoggedInUser(),
        getEmergencyContacts(),
      ]);

      setUser(userRes.data);
      setContacts(contactsRes.data || []);
    } catch (error) {
      console.log("SOS ERROR:", error?.response?.data || error);
      Alert.alert(t("common.error"), t("sos.loadFailed"));
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
    setEditingContact(null);
    setName("");
    setRole("SECURITY");
    setPhoneNumber("");
    setPriority("1");
    setActive(true);
  };

  const startEdit = (item) => {
    setEditingContact(item);
    setName(item.name || "");
    setRole(item.role || "SECURITY");
    setPhoneNumber(item.phoneNumber || item.phone_number || "");
    setPriority(String(item.priority || "1"));
    setActive(Boolean(item.active));
  };

  const handleCall = (number) => {
    if (!number) {
      Alert.alert(t("common.error"), t("sos.phoneUnavailable"));
      return;
    }

    Linking.openURL(`tel:${number}`);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t("addExpense.validationError"), t("sos.enterName"));
      return;
    }

    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      Alert.alert(t("addExpense.validationError"), t("sos.enterValidPhone"));
      return;
    }

    const payload = {
      name: name.trim(),
      role,
      phoneNumber: phoneNumber.trim(),
      priority: Number(priority || 1),
      active,
    };

    try {
      setSaving(true);

      if (editingContact) {
        await updateEmergencyContact(editingContact.contactId, payload);
        Alert.alert(t("common.success"), t("sos.updateSuccess"));
      } else {
        await createEmergencyContact(payload);
        Alert.alert(t("common.success"), t("sos.createSuccess"));
      }

      resetForm();
      await loadData();
    } catch (error) {
      console.log("SAVE SOS ERROR:", error?.response?.data || error);
      Alert.alert(t("common.error"), t("sos.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (contactId) => {
    try {
      await toggleEmergencyContact(contactId);
      await loadData();
    } catch (error) {
      console.log("TOGGLE SOS ERROR:", error?.response?.data || error);
      Alert.alert(t("common.error"), t("sos.updateStatusFailed"));
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#DC2626" />
          <Text style={styles.loaderText}>{t("sos.loading")}</Text>
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
          <Ionicons name="alert-circle-outline" size={42} color="#FFFFFF" />

          <Text style={styles.heading}>{t("sos.title")}</Text>

          <Text style={styles.subtitle}>{t("sos.subtitle")}</Text>
        </View>

        {isAdmin && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {editingContact
                ? t("sos.updateContact")
                : t("sos.addEmergencyContact")}
            </Text>

            <Text style={styles.label}>{t("adminUsers.name")}</Text>

            <TextInput
              style={styles.input}
              placeholder={t("sos.namePlaceholder")}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>{t("adminUsers.phoneNumber")}</Text>

            <TextInput
              style={styles.input}
              placeholder={t("sos.phonePlaceholder")}
              value={phoneNumber}
              onChangeText={(text) =>
                setPhoneNumber(text.replace(/[^0-9+]/g, ""))
              }
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>{t("profile.role")}</Text>

            <View style={styles.roleGrid}>
              {ROLES.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.roleButton,
                    role === item && styles.roleButtonActive,
                  ]}
                  onPress={() => setRole(item)}
                >
                  <Text
                    style={[
                      styles.roleText,
                      role === item && styles.roleTextActive,
                    ]}
                  >
                    {formatRole(item)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>{t("sos.priority")}</Text>

            <TextInput
              style={styles.input}
              placeholder="1"
              value={priority}
              onChangeText={(text) => setPriority(text.replace(/[^0-9]/g, ""))}
              keyboardType="numeric"
            />

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
                {active ? t("adminUsers.active") : t("adminUsers.inactive")}
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
                  {editingContact ? t("sos.updateContact") : t("sos.addContact")}
                </Text>
              )}
            </TouchableOpacity>

            {editingContact && (
              <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                <Text style={styles.cancelButtonText}>
                  {t("meetings.cancelEdit")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <Text style={styles.sectionTitle}>{t("sos.emergencyContacts")}</Text>

        {contacts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="call-outline" size={46} color="#DC2626" />

            <Text style={styles.emptyTitle}>{t("sos.noContacts")}</Text>

            <Text style={styles.emptyText}>{t("sos.noContactsSubtitle")}</Text>
          </View>
        ) : (
          contacts.map((item) => (
            <View key={item.contactId} style={styles.contactCard}>
              <View style={styles.contactTop}>
                <View style={styles.iconBox}>
                  <Ionicons
                    name={getRoleIcon(item.role)}
                    size={26}
                    color="#DC2626"
                  />
                </View>

                <View style={styles.contactTextBlock}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  <Text style={styles.contactRole}>{formatRole(item.role)}</Text>
                  <Text style={styles.phoneText}>
                    {item.phoneNumber || item.phone_number}
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
                      {item.active
                        ? t("adminUsers.active")
                        : t("adminUsers.inactive")}
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.callButton}
                onPress={() => handleCall(item.phoneNumber || item.phone_number)}
              >
                <Ionicons name="call" size={20} color="#FFFFFF" />

                <Text style={styles.callButtonText}>{t("sos.callNow")}</Text>
              </TouchableOpacity>

              {isAdmin && (
                <View style={styles.adminActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => startEdit(item)}
                  >
                    <Text style={styles.editText}>{t("meetings.edit")}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={() => handleToggle(item.contactId)}
                  >
                    <Text style={styles.toggleText}>
                      {item.active
                        ? t("notices.deactivate")
                        : t("notices.activate")}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatRole(value) {
  if (!value) return "-";

  switch (value) {
    case "SECURITY":
      return t("sos.roles.security");

    case "WATCHMAN":
      return t("sos.roles.watchman");

    case "ADMIN":
      return t("adminUsers.roles.admin");

    case "CASHIER":
      return t("adminUsers.roles.cashier");

    case "PLUMBER":
      return t("sos.roles.plumber");

    case "ELECTRICIAN":
      return t("sos.roles.electrician");

    case "AMBULANCE":
      return t("sos.roles.ambulance");

    case "FIRE":
      return t("sos.roles.fire");

    case "POLICE":
      return t("sos.roles.police");

    case "OTHER":
      return t("addExpense.categories.other");

    default:
      return value;
  }
}

function getRoleIcon(role) {
  if (role === "SECURITY") return "shield-checkmark-outline";
  if (role === "ADMIN") return "person-circle-outline";
  if (role === "CASHIER") return "cash-outline";
  if (role === "PLUMBER") return "water-outline";
  if (role === "ELECTRICIAN") return "flash-outline";
  if (role === "AMBULANCE") return "medkit-outline";
  if (role === "FIRE") return "flame-outline";
  if (role === "POLICE") return "car-outline";
  return "call-outline";
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
    backgroundColor: "#DC2626",
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
    color: "#FEE2E2",
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

  roleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },

  roleButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginRight: 8,
    marginBottom: 10,
  },

  roleButtonActive: {
    backgroundColor: "#DC2626",
    borderColor: "#DC2626",
  },

  roleText: {
    color: "#374151",
    fontWeight: "800",
    fontSize: 13,
  },

  roleTextActive: {
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
    backgroundColor: "#DC2626",
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

  contactCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  contactTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  contactTextBlock: {
    flex: 1,
  },

  contactName: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
  },

  contactRole: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 3,
    fontWeight: "700",
  },

  phoneText: {
    fontSize: 14,
    color: "#374151",
    marginTop: 4,
    fontWeight: "800",
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

  callButton: {
    marginTop: 16,
    backgroundColor: "#DC2626",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  callButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
    marginLeft: 8,
  },

  adminActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
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