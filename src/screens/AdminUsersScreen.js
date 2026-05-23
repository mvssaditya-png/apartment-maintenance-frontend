import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import FlatSelector from "../components/common/FlatSelector";

import {
  getUsersBySite,
  createUser,
  updateUser,
} from "../api/adminUserApi";

import {
  getLoggedInUser,
  getFlatOptions,
} from "../api/dashboardApi";

export default function AdminUsersScreen() {
  const [users, setUsers] = useState([]);
  const [flats, setFlats] = useState([]);
  const [selectedFlat, setSelectedFlat] = useState(null);
  const [siteId, setSiteId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    role: "USER",
    isActive: true,
  });

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [])
  );

  const resetForm = () => {
    setSelectedFlat(null);
    setForm({
      name: "",
      phoneNumber: "",
      email: "",
      role: "USER",
      isActive: true,
    });
  };

  const loadUsers = async () => {
    try {
      setLoading(true);

      const userResult = await getLoggedInUser();
      const loggedInUser = userResult.data;

      const currentSiteId = loggedInUser?.siteId;

      if (!currentSiteId) {
        Alert.alert("Error", "Site ID missing for logged-in user");
        return;
      }

      setSiteId(currentSiteId);

      const [usersData, flatsResult] = await Promise.all([
        getUsersBySite(currentSiteId),
        getFlatOptions(),
      ]);

      setUsers(Array.isArray(usersData) ? usersData : []);
      setFlats(flatsResult.data || []);
    } catch (error) {
      console.log("LOAD USERS ERROR:", error?.response?.data || error);

      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);

    const flat = flats.find((f) => f.flatId === user.flatId);

    setSelectedFlat(
      flat || {
        flatId: user.flatId,
        flatNumber: user.flatNumber,
        ownerName: user.name,
      }
    );

    setForm({
      name: user?.name || "",
      phoneNumber: user?.phoneNumber || "",
      email: user?.email || "",
      role: user?.role || "USER",
      isActive: user?.isActive ?? true,
    });

    setModalVisible(true);
  };

  const saveUser = async () => {
    if (!siteId) {
      Alert.alert("Error", "Site ID missing");
      return;
    }

    if (!selectedFlat?.flatId) {
      Alert.alert("Validation", "Please select flat");
      return;
    }

    if (!form.name.trim()) {
      Alert.alert("Validation", "Name is required");
      return;
    }

    if (!form.phoneNumber.trim()) {
      Alert.alert("Validation", "Phone number is required");
      return;
    }

    if (!form.email.trim()) {
      Alert.alert("Validation", "Email is required");
      return;
    }

    const payload = {
      siteId,
      flatId: selectedFlat.flatId,
      flatNumber: selectedFlat.flatNumber,
      name: form.name.trim(),
      phoneNumber: form.phoneNumber.trim(),
      email: form.email.trim(),
      role: form.role,
      isActive: form.isActive,
    };

    try {
      setSaving(true);

      if (editingUser) {
        await updateUser(editingUser.userId, payload);
        Alert.alert("Success", "User updated successfully");
      } else {
        await createUser(payload);
        Alert.alert("Success", "User created successfully");
      }

      setModalVisible(false);
      resetForm();
      await loadUsers();
    } catch (error) {
      console.log("SAVE USER ERROR:", error?.response?.data || error);

      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          String(error?.response?.data || "Failed to save user")
      );
    } finally {
      setSaving(false);
    }
  };

  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => openEditModal(item)}
      activeOpacity={0.85}
    >
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.info}>Flat: {item.flatNumber || "-"}</Text>
      <Text style={styles.info}>Phone: {item.phoneNumber}</Text>
      <Text style={styles.info}>Email: {item.email}</Text>

      <View style={styles.row}>
        <Text style={styles.role}>{item.role}</Text>
        <Text style={item.isActive ? styles.active : styles.inactive}>
          {item.isActive ? "Active" : "Inactive"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Add User</Text>
        </TouchableOpacity>

        {loading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loaderText}>Loading users...</Text>
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item, index) =>
            `${item.userId || item.phoneNumber || item.flatId}-${index}`
            }
            renderItem={renderUser}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No users found</Text>
            }
          />
        )}

        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <SafeAreaView style={styles.modalSafeArea} edges={["top", "bottom"]}>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <ScrollView
                contentContainerStyle={styles.modalContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.modalTitle}>
                  {editingUser ? "Edit User" : "Add User"}
                </Text>

                <FlatSelector
                  flats={flats}
                  selectedFlat={selectedFlat}
                  onSelectFlat={setSelectedFlat}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor="#9CA3AF"
                  value={form.name}
                  onChangeText={(text) => setForm({ ...form, name: text })}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  value={form.phoneNumber}
                  onChangeText={(text) =>
                    setForm({ ...form, phoneNumber: text })
                  }
                />

                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={form.email}
                  onChangeText={(text) => setForm({ ...form, email: text })}
                />

                <Text style={styles.label}>Role</Text>

                <View style={styles.roleRow}>
                  {["RESIDENT", "CASHIER", "ADMIN"].map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleButton,
                        form.role === role && styles.selectedRole,
                      ]}
                      onPress={() => setForm({ ...form, role })}
                    >
                      <Text
                        style={[
                          styles.roleButtonText,
                          form.role === role && styles.selectedRoleText,
                        ]}
                      >
                        {role}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.statusButton}
                  onPress={() =>
                    setForm({ ...form, isActive: !form.isActive })
                  }
                >
                  <Text style={styles.statusText}>
                    Status: {form.isActive ? "Active" : "Inactive"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveUser}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {editingUser ? "Update User" : "Create User"}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                  disabled={saving}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  container: {
    flex: 1,
    padding: 18,
    backgroundColor: "#F5F7FB",
  },

  addButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 15,
    borderRadius: 14,
    marginBottom: 16,
  },

  addButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 16,
  },

  loaderBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loaderText: {
    marginTop: 10,
    color: "#6B7280",
    fontWeight: "600",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#6B7280",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  name: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 6,
  },

  info: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 4,
    fontWeight: "500",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  role: {
    color: "#2563EB",
    fontWeight: "900",
  },

  active: {
    color: "#16A34A",
    fontWeight: "900",
  },

  inactive: {
    color: "#DC2626",
    fontWeight: "900",
  },

  modalSafeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  modalContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 30,
    paddingBottom: 40,
    backgroundColor: "#FFFFFF",
  },

  modalTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 22,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 16 : 12,
    borderRadius: 14,
    marginBottom: 14,
    fontSize: 16,
    color: "#111827",
  },

  label: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 10,
  },

  roleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 18,
  },

  roleButton: {
    borderWidth: 1.5,
    borderColor: "#2563EB",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 10,
    marginBottom: 10,
  },

  selectedRole: {
    backgroundColor: "#2563EB",
  },

  roleButtonText: {
    color: "#2563EB",
    fontWeight: "900",
    fontSize: 15,
  },

  selectedRoleText: {
    color: "#FFFFFF",
  },

  statusButton: {
    paddingVertical: 15,
    backgroundColor: "#E5E7EB",
    borderRadius: 14,
    marginBottom: 16,
  },

  statusText: {
    textAlign: "center",
    fontWeight: "900",
    color: "#111827",
    fontSize: 16,
  },

  saveButton: {
    backgroundColor: "#059669",
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 14,
  },

  saveButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 16,
  },

  cancelButton: {
    backgroundColor: "#9CA3AF",
    paddingVertical: 16,
    borderRadius: 14,
  },

  cancelButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 16,
  },
});