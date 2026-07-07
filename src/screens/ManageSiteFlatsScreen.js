import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import {
  getSiteFlats,
  addSiteFlat,
  updateSiteFlat,
  toggleSiteFlat,
} from "../api/superAdminApi";

export default function ManageSiteFlatsScreen({ route, navigation }) {
  const { siteId, siteName } = route.params;

  const [flats, setFlats] = useState([]);
  const [filteredFlats, setFilteredFlats] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingFlat, setEditingFlat] = useState(null);

  const [flatNumber, setFlatNumber] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [role, setRole] = useState("RESIDENT");
  const [saving, setSaving] = useState(false);

  const loadFlats = async () => {
    try {
      setLoading(true);
      const response = await getSiteFlats(siteId);
      const data = response.data || [];
      setFlats(data);
      applySearch(search, data);
    } catch (error) {
      console.log("LOAD FLATS ERROR:", error?.response?.data);
      Alert.alert("Error", "Unable to load flats.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFlats();
    }, [siteId])
  );

  const applySearch = (text, list = flats) => {
    setSearch(text);

    const value = text.trim().toLowerCase();

    if (!value) {
      setFilteredFlats(list);
      return;
    }

    setFilteredFlats(
      list.filter(
        (flat) =>
          String(flat.flatNumber || "").toLowerCase().includes(value) ||
          String(flat.ownerName || "").toLowerCase().includes(value) ||
          String(flat.ownerPhone || "").toLowerCase().includes(value) ||
          String(flat.role || "").toLowerCase().includes(value)
      )
    );
  };

  const openAddModal = () => {
    setEditingFlat(null);
    setFlatNumber("");
    setOwnerName("");
    setOwnerPhone("");
    setOwnerEmail("");
    setRole("RESIDENT");
    setModalVisible(true);
  };

  const openEditModal = (flat) => {
    setEditingFlat(flat);
    setFlatNumber(flat.flatNumber || "");
    setOwnerName(flat.ownerName || "");
    setOwnerPhone(flat.ownerPhone || "");
    setOwnerEmail(flat.ownerEmail || "");
    setRole(flat.role || "RESIDENT");
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!flatNumber.trim()) {
      Alert.alert("Validation", "Flat number is required.");
      return;
    }

    if (!ownerName.trim()) {
      Alert.alert("Validation", "Owner name is required.");
      return;
    }

    if (!ownerPhone.trim() || ownerPhone.trim().length !== 10) {
      Alert.alert("Validation", "Enter valid 10 digit owner phone number.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        flatNumber: flatNumber.trim(),
        ownerName: ownerName.trim(),
        ownerPhone: ownerPhone.trim(),
        ownerEmail: ownerEmail.trim(),
        role,
      };

      if (editingFlat) {
        await updateSiteFlat(editingFlat.flatId, payload);
      } else {
        await addSiteFlat(siteId, payload);
      }

      setModalVisible(false);
      await loadFlats();
    } catch (error) {
      console.log("SAVE FLAT ERROR:", error?.response?.data);

      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        "Unable to save flat.";

      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (flat) => {
    Alert.alert(
      flat.active ? "Deactivate Flat" : "Activate Flat",
      flat.active
        ? `Deactivate Flat ${flat.flatNumber}? Owner user will also be deactivated.`
        : `Activate Flat ${flat.flatNumber}? Owner user will also be activated.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: flat.active ? "Deactivate" : "Activate",
          style: flat.active ? "destructive" : "default",
          onPress: async () => {
            try {
              await toggleSiteFlat(flat.flatId);
              await loadFlats();
            } catch (error) {
              console.log("TOGGLE FLAT ERROR:", error?.response?.data);
              Alert.alert("Error", "Unable to update flat status.");
            }
          },
        },
      ]
    );
  };

  const RoleButton = ({ value }) => (
    <TouchableOpacity
      style={[styles.roleButton, role === value && styles.roleButtonActive]}
      onPress={() => setRole(value)}
      activeOpacity={0.85}
    >
      <Text
        style={[styles.roleButtonText, role === value && styles.roleButtonTextActive]}
      >
        {value}
      </Text>
    </TouchableOpacity>
  );

  const renderFlat = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.iconBox}>
          <Ionicons name="home-outline" size={26} color="#2563EB" />
        </View>

        <View style={styles.flatInfo}>
          <Text style={styles.flatNumber}>Flat {item.flatNumber}</Text>
          <Text style={styles.ownerText}>
            {item.ownerName ? item.ownerName : "Owner not added"}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            item.active ? styles.activeBadge : styles.inactiveBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.active ? styles.activeText : styles.inactiveText,
            ]}
          >
            {item.active ? "ACTIVE" : "INACTIVE"}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={18} color="#6B7280" />
          <Text style={styles.detailLabel}>Phone</Text>
          <Text style={styles.detailValue}>{item.ownerPhone || "-"}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={18} color="#6B7280" />
          <Text style={styles.detailLabel}>Email</Text>
          <Text style={styles.detailValue}>{item.ownerEmail || "-"}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#6B7280" />
          <Text style={styles.detailLabel}>Role</Text>
          <Text style={styles.detailValue}>{item.role || "-"}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEditModal(item)}
          activeOpacity={0.85}
        >
          <Ionicons name="create-outline" size={18} color="#2563EB" />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            item.active ? styles.deactivateButton : styles.activateButton,
          ]}
          onPress={() => handleToggle(item)}
          activeOpacity={0.85}
        >
          <Ionicons
            name={item.active ? "close-circle-outline" : "checkmark-circle-outline"}
            size={18}
            color="#FFFFFF"
          />
          <Text style={styles.toggleText}>
            {item.active ? "Deactivate" : "Activate"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Ionicons name="chevron-back" size={28} color="#111827" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Manage Flats</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Manage Flats</Text>
            <Text style={styles.subtitle}>{siteName}</Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={openAddModal}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={34} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={24} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search flat, owner, phone or role"
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={applySearch}
          />
        </View>

        <Text style={styles.countText}>
          {filteredFlats.length} flat{filteredFlats.length === 1 ? "" : "s"}
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredFlats}
            keyExtractor={(item) => item.flatId}
            renderItem={renderFlat}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Ionicons name="business-outline" size={44} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>No flats added</Text>
                <Text style={styles.emptyText}>Tap + to add flat and owner details.</Text>
              </View>
            }
          />
        )}
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingFlat ? "Edit Flat & Owner" : "Add Flat & Owner"}
            </Text>

            <Text style={styles.inputLabel}>Flat Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Example: 101 or A-101"
              placeholderTextColor="#9CA3AF"
              value={flatNumber}
              onChangeText={setFlatNumber}
            />

            <Text style={styles.inputLabel}>Owner Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter owner name"
              placeholderTextColor="#9CA3AF"
              value={ownerName}
              onChangeText={setOwnerName}
            />

            <Text style={styles.inputLabel}>Owner Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="10 digit mobile number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              maxLength={10}
              value={ownerPhone}
              onChangeText={(text) => setOwnerPhone(text.replace(/[^0-9]/g, ""))}
            />

            <Text style={styles.inputLabel}>Owner Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Optional"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              value={ownerEmail}
              onChangeText={setOwnerEmail}
            />

            <Text style={styles.inputLabel}>Role</Text>
            <View style={styles.roleRow}>
              <RoleButton value="ADMIN" />
              <RoleButton value="CASHIER" />
              <RoleButton value="RESIDENT" />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
                disabled={saving}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F7FB" },
  header: {
    height: 88,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backText: { fontSize: 20, fontWeight: "800", color: "#111827" },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#111827" },
  container: { flex: 1, padding: 20 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 34, fontWeight: "900", color: "#111827" },
  subtitle: { marginTop: 6, fontSize: 17, fontWeight: "700", color: "#6B7280" },
  addButton: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    marginTop: 22,
    height: 58,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, fontWeight: "700", color: "#111827" },
  countText: { marginTop: 14, fontSize: 14, fontWeight: "800", color: "#6B7280" },
  listContent: { paddingTop: 14, paddingBottom: 30 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 26, padding: 18, marginBottom: 16 },
  cardTop: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: "#EEF5FF",
    alignItems: "center",
    justifyContent: "center",
  },
  flatInfo: { flex: 1, marginLeft: 14 },
  flatNumber: { fontSize: 22, fontWeight: "900", color: "#111827" },
  ownerText: { marginTop: 4, fontSize: 14, fontWeight: "800", color: "#6B7280" },
  statusBadge: { borderRadius: 16, paddingVertical: 8, paddingHorizontal: 12 },
  activeBadge: { backgroundColor: "#DCFCE7" },
  inactiveBadge: { backgroundColor: "#FEE2E2" },
  statusText: { fontSize: 12, fontWeight: "900" },
  activeText: { color: "#16A34A" },
  inactiveText: { color: "#DC2626" },
  details: { marginTop: 16, borderTopWidth: 1, borderTopColor: "#F3F4F6", paddingTop: 14 },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  detailLabel: { marginLeft: 8, fontSize: 15, fontWeight: "800", color: "#6B7280" },
  detailValue: { flex: 1, textAlign: "right", fontSize: 15, fontWeight: "900", color: "#111827" },
  actions: { marginTop: 16, flexDirection: "row", justifyContent: "space-between" },
  editButton: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 12 },
  editText: { marginLeft: 6, fontSize: 16, fontWeight: "900", color: "#2563EB" },
  toggleButton: { flexDirection: "row", alignItems: "center", borderRadius: 16, paddingVertical: 12, paddingHorizontal: 16 },
  deactivateButton: { backgroundColor: "#DC2626" },
  activateButton: { backgroundColor: "#16A34A" },
  toggleText: { marginLeft: 6, color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  emptyBox: { marginTop: 60, alignItems: "center" },
  emptyTitle: { marginTop: 14, fontSize: 22, fontWeight: "900", color: "#111827" },
  emptyText: { marginTop: 6, fontSize: 15, color: "#6B7280", fontWeight: "700", textAlign: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22 },
  modalTitle: { fontSize: 26, fontWeight: "900", color: "#111827", marginBottom: 18 },
  inputLabel: { fontSize: 15, fontWeight: "900", color: "#374151", marginBottom: 8 },
  input: {
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
  },
  roleRow: { flexDirection: "row", marginBottom: 16 },
  roleButton: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: "#F9FAFB",
  },
  roleButtonActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  roleButtonText: { fontSize: 12, fontWeight: "900", color: "#374151" },
  roleButtonTextActive: { color: "#FFFFFF" },
  modalActions: { flexDirection: "row", marginTop: 8 },
  cancelButton: {
    flex: 1,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  cancelText: { fontSize: 16, fontWeight: "900", color: "#374151" },
  saveButton: {
    flex: 1,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: { fontSize: 16, fontWeight: "900", color: "#FFFFFF" },
});