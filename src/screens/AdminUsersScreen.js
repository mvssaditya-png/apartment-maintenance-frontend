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
import { Ionicons } from "@expo/vector-icons";

import FlatSelector from "../components/common/FlatSelector";

import {
  getUsersBySite,
  getOwnersBySite,
  createUser,
  updateUser,
} from "../api/adminUserApi";

import {
  getLoggedInUser,
  getFlatOptions,
} from "../api/dashboardApi";

export default function AdminUsersScreen() {
  const [users, setUsers] = useState([]);
  const [owners, setOwners] = useState([]);
  const [flats, setFlats] = useState([]);

  const [selectedFlat, setSelectedFlat] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [siteId, setSiteId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    role: "RESIDENT",
    residentType: "OWNER",
    isActive: true,
  });

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [])
  );

  const resetForm = () => {
    setSelectedFlat(null);
    setSelectedOwner(null);

    setForm({
      name: "",
      phoneNumber: "",
      email: "",
      role: "RESIDENT",
      residentType: "OWNER",
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

      const [usersData, ownersData, flatsResult] = await Promise.all([
        getUsersBySite(currentSiteId),
        getOwnersBySite(currentSiteId),
        getFlatOptions(),
      ]);

      setUsers(Array.isArray(usersData) ? usersData : []);
      setOwners(Array.isArray(ownersData) ? ownersData : []);
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
      }
    );

    const owner = owners.find((o) => o.userId === user.ownerUserId);

    setSelectedOwner(owner || null);

    setForm({
      name: user?.name || "",
      phoneNumber: user?.phoneNumber || "",
      email: user?.email || "",
      role: user?.role || "RESIDENT",
      residentType: user?.residentType || "OWNER",
      isActive: user?.isActive ?? true,
    });

    setModalVisible(true);
  };

  const handleFlatSelect = (flat) => {
    setSelectedFlat(flat);
    setSelectedOwner(null);
  };

  const handleResidentTypeChange = (residentType) => {
    setForm({
      ...form,
      residentType,
    });

    if (residentType === "OWNER") {
      setSelectedOwner(null);
    }
  };

  const saveUser = async () => {
    if (!siteId) {
      Alert.alert("Validation", "Site ID missing");
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

    if (!form.role) {
      Alert.alert("Validation", "Please select role");
      return;
    }

    if (!form.residentType) {
      Alert.alert("Validation", "Please select resident type");
      return;
    }

    if (form.residentType === "TENANT" && !selectedOwner?.userId) {
      Alert.alert("Validation", "Please select owner for tenant");
      return;
    }

    const payload = {
      siteId,
      flatId: selectedFlat.flatId,
      flatNumber: selectedFlat.flatNumber,
      name: form.name.trim(),
      phoneNumber: form.phoneNumber.trim(),
      email: form.email?.trim() || null,
      role: form.role,
      residentType: form.residentType,
      ownerUserId:
        form.residentType === "TENANT" ? selectedOwner.userId : null,
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

  const filteredOwners = owners.filter((owner) => {
    if (!selectedFlat?.flatId) {
      return false;
    }

    if (editingUser?.userId && owner.userId === editingUser.userId) {
      return false;
    }

    return owner.flatId === selectedFlat.flatId;
  });

  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => openEditModal(item)}
      activeOpacity={0.9}
    >
      <View style={styles.userTopRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name?.charAt(0)?.toUpperCase() || "U"}
          </Text>
        </View>

        <View style={styles.userTitleBlock}>
          <Text style={styles.name}>{item.name}</Text>

          <Text style={styles.flatInfo}>
            Flat {item.flatNumber || "-"}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            item.isActive ? styles.activeBadge : styles.inactiveBadge,
          ]}
        >
          <Text
            style={[
              styles.statusBadgeText,
              item.isActive ? styles.activeBadgeText : styles.inactiveBadgeText,
            ]}
          >
            {item.isActive ? "ACTIVE" : "INACTIVE"}
          </Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <InfoItem icon="call-outline" value={item.phoneNumber || "-"} />

        {item.email ? (
          <InfoItem icon="mail-outline" value={item.email} />
        ) : null}

        <InfoItem icon="shield-outline" value={item.role || "-"} />

        {item.residentType ? (
          <InfoItem
            icon="people-outline"
            value={
              item.ownerName
                ? `${item.residentType} • Owner: ${item.ownerName}`
                : item.residentType
            }
          />
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.heading}>Manage Users</Text>
            <Text style={styles.subtitle}>
              Add, edit and manage residents
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addIconButton}
            onPress={openAddModal}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

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
            contentContainerStyle={styles.listContent}
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
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>
                      {editingUser ? "Edit User" : "Add User"}
                    </Text>

                    <Text style={styles.modalSubtitle}>
                      {editingUser
                        ? "Update resident details"
                        : "Create a new resident profile"}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                    disabled={saving}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="close" size={24} color="#111827" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>Flat</Text>

                <FlatSelector
                  flats={flats}
                  selectedFlat={selectedFlat}
                  onSelectFlat={handleFlatSelect}
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
                  placeholder="Email Optional"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={form.email}
                  onChangeText={(text) => setForm({ ...form, email: text })}
                />

                <Text style={styles.label}>Role</Text>

                <View style={styles.chipRow}>
                  {["RESIDENT", "CASHIER", "ADMIN"].map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.chipButton,
                        form.role === role && styles.selectedChip,
                      ]}
                      onPress={() => setForm({ ...form, role })}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          form.role === role && styles.selectedChipText,
                        ]}
                      >
                        {role}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Resident Type</Text>

                <View style={styles.chipRow}>
                  {["OWNER", "TENANT"].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.chipButton,
                        form.residentType === type && styles.selectedChip,
                      ]}
                      onPress={() => handleResidentTypeChange(type)}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          form.residentType === type && styles.selectedChipText,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {form.residentType === "TENANT" && (
                  <>
                    <Text style={styles.label}>Select Owner</Text>

                    {!selectedFlat?.flatId ? (
                      <Text style={styles.helperText}>
                        Please select flat first.
                      </Text>
                    ) : filteredOwners.length === 0 ? (
                      <Text style={styles.helperText}>
                        No owner found for this flat. Please create owner first.
                      </Text>
                    ) : (
                      <View style={styles.ownerList}>
                        {filteredOwners.map((owner) => (
                          <TouchableOpacity
                            key={owner.userId}
                            style={[
                              styles.ownerCard,
                              selectedOwner?.userId === owner.userId &&
                                styles.ownerCardActive,
                            ]}
                            onPress={() => setSelectedOwner(owner)}
                            activeOpacity={0.85}
                          >
                            <View style={styles.ownerIconBox}>
                              <Ionicons
                                name="person-outline"
                                size={20}
                                color={
                                  selectedOwner?.userId === owner.userId
                                    ? "#FFFFFF"
                                    : "#2563EB"
                                }
                              />
                            </View>

                            <View style={{ flex: 1 }}>
                              <Text
                                style={[
                                  styles.ownerName,
                                  selectedOwner?.userId === owner.userId &&
                                    styles.ownerNameActive,
                                ]}
                              >
                                {owner.name}
                              </Text>

                              <Text
                                style={[
                                  styles.ownerInfo,
                                  selectedOwner?.userId === owner.userId &&
                                    styles.ownerInfoActive,
                                ]}
                              >
                                Flat {owner.flatNumber} • {owner.phoneNumber}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </>
                )}

                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    form.isActive ? styles.statusActive : styles.statusInactive,
                  ]}
                  onPress={() =>
                    setForm({ ...form, isActive: !form.isActive })
                  }
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={
                      form.isActive
                        ? "checkmark-circle-outline"
                        : "close-circle-outline"
                    }
                    size={21}
                    color={form.isActive ? "#16A34A" : "#DC2626"}
                  />

                  <Text
                    style={[
                      styles.statusText,
                      form.isActive
                        ? styles.statusTextActive
                        : styles.statusTextInactive,
                    ]}
                  >
                    {form.isActive ? "Active User" : "Inactive User"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveUser}
                  disabled={saving}
                  activeOpacity={0.85}
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
                  activeOpacity={0.85}
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

function InfoItem({ icon, value }) {
  return (
    <View style={styles.infoItem}>
      <Ionicons name={icon} size={16} color="#6B7280" />

      <Text style={styles.infoItemText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 0,
    backgroundColor: "#F5F7FB",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 18,
  },

  heading: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
  },

  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 4,
  },

  addIconButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  listContent: {
    paddingBottom: 100,
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
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },

  userTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#EEF4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  avatarText: {
    color: "#2563EB",
    fontWeight: "900",
    fontSize: 20,
  },

  userTitleBlock: {
    flex: 1,
    paddingRight: 8,
  },

  name: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },

  flatInfo: {
    color: "#6B7280",
    fontWeight: "700",
    marginTop: 4,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },

  activeBadge: {
    backgroundColor: "#DCFCE7",
  },

  inactiveBadge: {
    backgroundColor: "#FEE2E2",
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: "900",
  },

  activeBadgeText: {
    color: "#15803D",
  },

  inactiveBadgeText: {
    color: "#DC2626",
  },

  infoSection: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  infoItemText: {
    marginLeft: 8,
    color: "#374151",
    fontWeight: "600",
    fontSize: 14,
  },

  modalSafeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  modalContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 28 : 22,
    paddingBottom: 40,
    backgroundColor: "#FFFFFF",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 22,
  },

  modalTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
  },

  modalSubtitle: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },

  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 10,
  },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 18,
  },

  chipButton: {
    borderWidth: 1.5,
    borderColor: "#2563EB",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
    marginRight: 10,
    marginBottom: 10,
  },

  selectedChip: {
    backgroundColor: "#2563EB",
  },

  chipText: {
    color: "#2563EB",
    fontWeight: "900",
    fontSize: 14,
  },

  selectedChipText: {
    color: "#FFFFFF",
  },

  ownerList: {
    marginBottom: 18,
  },

  ownerCard: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
  },

  ownerCardActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  ownerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(37,99,235,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  ownerName: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },

  ownerNameActive: {
    color: "#FFFFFF",
  },

  ownerInfo: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
    fontWeight: "600",
  },

  ownerInfoActive: {
    color: "#DBEAFE",
  },

  helperText: {
    color: "#DC2626",
    fontWeight: "700",
    marginBottom: 18,
  },

  statusButton: {
    paddingVertical: 15,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  statusActive: {
    backgroundColor: "#DCFCE7",
  },

  statusInactive: {
    backgroundColor: "#FEE2E2",
  },

  statusText: {
    marginLeft: 8,
    fontWeight: "900",
    fontSize: 15,
  },

  statusTextActive: {
    color: "#15803D",
  },

  statusTextInactive: {
    color: "#DC2626",
  },

  saveButton: {
    backgroundColor: "#059669",
    paddingVertical: 16,
    borderRadius: 16,
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
    borderRadius: 16,
  },

  cancelButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 16,
  },
});