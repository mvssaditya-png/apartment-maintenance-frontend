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
import * as ImagePicker from "expo-image-picker";

import API from "../api/axios";
import {
  getLoggedInUser,
  getComplaints,
  createComplaint,
  updateComplaintStatus,
  uploadReceiptImage,
} from "../api/dashboardApi";

import ImagePreviewModal from "../components/common/ImagePreviewModal";

const CATEGORIES = [
  "WATER",
  "ELECTRICITY",
  "CLEANING",
  "SECURITY",
  "PARKING",
  "MAINTENANCE",
  "OTHER",
];

const STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED",
];

export default function ComplaintsScreen() {
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("MAINTENANCE");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [status, setStatus] = useState("IN_PROGRESS");
  const [adminResponse, setAdminResponse] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);

      const [userRes, complaintsRes] = await Promise.all([
        getLoggedInUser(),
        getComplaints(),
      ]);

      setUser(userRes.data);
      setComplaints(complaintsRes.data || []);
    } catch (error) {
      console.log("COMPLAINTS ERROR:", error?.response?.data || error);
      Alert.alert("Error", "Unable to load complaints.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const isAdminOrCashier =
    user?.role?.toUpperCase() === "ADMIN" ||
    user?.role?.toUpperCase() === "CASHIER";

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("MAINTENANCE");
    setSelectedImage(null);
  };

  const resetStatusForm = () => {
    setSelectedComplaint(null);
    setStatus("IN_PROGRESS");
    setAdminResponse("");
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required", "Please allow gallery access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const getFullImageUrl = (url) => {
    if (!url) return null;

    if (url.startsWith("http")) {
      return url;
    }

    return API.defaults.baseURL.replace("/api", "") + url;
  };

  const handleCreateComplaint = async () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Please enter complaint title.");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Validation Error", "Please enter complaint description.");
      return;
    }

    try {
      setSaving(true);

      let imageUrl = "";

      if (selectedImage) {
        const uploadRes = await uploadReceiptImage(selectedImage);
        imageUrl = uploadRes.data.fileUrl;
      }

      await createComplaint({
        title: title.trim(),
        description: description.trim(),
        category,
        imageUrl,
      });

      Alert.alert("Success", "Complaint raised successfully.");
      resetForm();
      await loadData();
    } catch (error) {
      console.log("CREATE COMPLAINT ERROR:", error?.response?.data || error);
      Alert.alert("Error", "Unable to raise complaint.");
    } finally {
      setSaving(false);
    }
  };

  const startStatusUpdate = (item) => {
    setSelectedComplaint(item);
    setStatus(item.status || "IN_PROGRESS");
    setAdminResponse(item.adminResponse || "");
  };

  const handleUpdateStatus = async () => {
    if (!selectedComplaint) {
      return;
    }

    try {
      setStatusSaving(true);

      await updateComplaintStatus(selectedComplaint.complaintId, {
        status,
        adminResponse: adminResponse.trim(),
      });

      Alert.alert("Success", "Complaint status updated.");
      resetStatusForm();
      await loadData();
    } catch (error) {
      console.log("UPDATE COMPLAINT ERROR:", error?.response?.data || error);
      Alert.alert("Error", "Unable to update complaint.");
    } finally {
      setStatusSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loaderText}>Loading complaints...</Text>
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
          <Ionicons name="chatbox-ellipses-outline" size={42} color="#FFFFFF" />
          <Text style={styles.heading}>Complaints</Text>
          <Text style={styles.subtitle}>
            Raise and track apartment maintenance issues.
          </Text>
        </View>

        <View style={styles.formCard}>
            <Text style={styles.formTitle}>Raise Complaint</Text>

            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Example: Water leakage"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Explain the issue..."
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.chipGrid}>
              {CATEGORIES.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.chip,
                    category === item && styles.chipActive,
                  ]}
                  onPress={() => setCategory(item)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      category === item && styles.chipTextActive,
                    ]}
                  >
                    {formatText(item)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Image Optional</Text>
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={() => {
                if (selectedImage) {
                  setPreviewImageUrl(selectedImage.uri);
                } else {
                  pickImage();
                }
              }}
            >
              <Ionicons name="image-outline" size={34} color="#2563EB" />
              <Text style={styles.uploadTitle}>
                {selectedImage ? "Image Selected" : "Upload Image"}
              </Text>
              <Text style={styles.uploadText}>
                {selectedImage ? "Tap to preview image" : "Select image from gallery"}
              </Text>
            </TouchableOpacity>

            {selectedImage && (
              <TouchableOpacity style={styles.changeButton} onPress={pickImage}>
                <Text style={styles.changeButtonText}>Change Image</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleCreateComplaint}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Submit Complaint</Text>
              )}
            </TouchableOpacity>
        </View>

        {selectedComplaint && isAdminOrCashier && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Update Complaint</Text>

            <Text style={styles.selectedTitle}>{selectedComplaint.title}</Text>

            <Text style={styles.label}>Status</Text>
            <View style={styles.chipGrid}>
              {STATUSES.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.chip,
                    status === item && styles.chipActive,
                  ]}
                  onPress={() => setStatus(item)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      status === item && styles.chipTextActive,
                    ]}
                  >
                    {formatText(item)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Admin Response</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Write response..."
              value={adminResponse}
              onChangeText={setAdminResponse}
              multiline
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleUpdateStatus}
              disabled={statusSaving}
            >
              {statusSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Update Status</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={resetStatusForm}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>
          {isAdminOrCashier ? "All Complaints" : "My Complaints"}
        </Text>

        {complaints.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="chatbox-outline" size={46} color="#2563EB" />
            <Text style={styles.emptyTitle}>No complaints found</Text>
            <Text style={styles.emptyText}>
              Complaints will appear here.
            </Text>
          </View>
        ) : (
          complaints.map((item) => (
            <View key={item.complaintId} style={styles.complaintCard}>
              <View style={styles.complaintTop}>
                <View style={styles.iconBox}>
                  <Ionicons name="construct-outline" size={24} color="#2563EB" />
                </View>

                <View style={styles.complaintTextBlock}>
                  <Text style={styles.complaintTitle}>{item.title}</Text>
                  <Text style={styles.complaintDate}>
                    {formatDate(item.createdAt)}
                  </Text>
                </View>

                <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                  <Text style={styles.statusText}>{formatText(item.status)}</Text>
                </View>
              </View>

              <Text style={styles.categoryText}>
                {formatText(item.category || "OTHER")}
              </Text>

              <Text style={styles.description}>{item.description}</Text>

              {item.imageUrl ? (
                <TouchableOpacity
                  style={styles.previewBox}
                  onPress={() => setPreviewImageUrl(getFullImageUrl(item.imageUrl))}
                >
                  <Ionicons name="image-outline" size={28} color="#2563EB" />
                  <Text style={styles.previewTitle}>Image Attached</Text>
                  <Text style={styles.previewText}>Tap to view image</Text>
                </TouchableOpacity>
              ) : null}

              {item.adminResponse ? (
                <View style={styles.responseBox}>
                  <Text style={styles.responseLabel}>Admin Response</Text>
                  <Text style={styles.responseText}>{item.adminResponse}</Text>
                </View>
              ) : null}

              {isAdminOrCashier && (
                <TouchableOpacity
                  style={styles.updateButton}
                  onPress={() => startStatusUpdate(item)}
                >
                  <Text style={styles.updateButtonText}>Update Complaint</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}

        <ImagePreviewModal
          visible={!!previewImageUrl}
          imageUrl={previewImageUrl}
          onClose={() => setPreviewImageUrl(null)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function formatText(value) {
  if (!value) return "-";

  return value
    .replace("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
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

function getStatusStyle(status) {
  if (status === "RESOLVED") {
    return { backgroundColor: "#DCFCE7" };
  }

  if (status === "REJECTED") {
    return { backgroundColor: "#FEE2E2" };
  }

  if (status === "IN_PROGRESS") {
    return { backgroundColor: "#DBEAFE" };
  }

  return { backgroundColor: "#FEF3C7" };
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

  selectedTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#2563EB",
    marginBottom: 14,
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

  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginRight: 8,
    marginBottom: 10,
  },

  chipActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  chipText: {
    color: "#374151",
    fontWeight: "800",
    fontSize: 13,
  },

  chipTextActive: {
    color: "#FFFFFF",
  },

  uploadBox: {
    height: 145,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  uploadTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
    marginTop: 8,
  },

  uploadText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },

  changeButton: {
    backgroundColor: "#EEF4FF",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },

  changeButtonText: {
    color: "#2563EB",
    fontWeight: "900",
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

  complaintCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  complaintTop: {
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

  complaintTextBlock: {
    flex: 1,
  },

  complaintTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },

  complaintDate: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },

  statusText: {
    color: "#111827",
    fontSize: 11,
    fontWeight: "900",
  },

  categoryText: {
    marginTop: 14,
    color: "#2563EB",
    fontWeight: "900",
    fontSize: 13,
  },

  description: {
    fontSize: 14,
    color: "#374151",
    marginTop: 8,
    lineHeight: 21,
  },

  previewBox: {
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    backgroundColor: "#EFF6FF",
    paddingVertical: 22,
    alignItems: "center",
  },

  previewTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#1E3A8A",
    marginTop: 8,
  },

  previewText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },

  responseBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
  },

  responseLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "900",
    marginBottom: 4,
  },

  responseText: {
    fontSize: 14,
    color: "#111827",
    lineHeight: 20,
  },

  updateButton: {
    marginTop: 14,
    backgroundColor: "#EEF4FF",
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
  },

  updateButtonText: {
    color: "#2563EB",
    fontWeight: "900",
  },
});