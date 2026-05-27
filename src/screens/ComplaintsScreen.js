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

import AppCard from "../components/common/AppCard";
import AppButton from "../components/common/AppButton";
import AppInput from "../components/common/AppInput";
import EmptyState from "../components/common/EmptyState";
import StatusBadge from "../components/common/StatusBadge";

import { COLORS } from "../components/common/theme";

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

  const [complaints, setComplaints] =
    useState([]);

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [category, setCategory] =
    useState("MAINTENANCE");

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [previewImageUrl, setPreviewImageUrl] =
    useState(null);

  const [
    selectedComplaint,
    setSelectedComplaint,
  ] = useState(null);

  const [status, setStatus] =
    useState("IN_PROGRESS");

  const [adminResponse, setAdminResponse] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [statusSaving, setStatusSaving] =
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

      const [
        userRes,
        complaintsRes,
      ] = await Promise.all([
        getLoggedInUser(),
        getComplaints(),
      ]);

      setUser(userRes.data);

      setComplaints(
        complaintsRes.data || []
      );
    } catch (error) {
      console.log(
        "COMPLAINTS ERROR:",
        error?.response?.data ||
          error
      );

      Alert.alert(
        "Error",
        "Unable to load complaints."
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

  const isAdminOrCashier =
    user?.role?.toUpperCase() ===
      "ADMIN" ||
    user?.role?.toUpperCase() ===
      "CASHIER";

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
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow gallery access."
      );

      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

    if (!result.canceled) {
      setSelectedImage(
        result.assets[0]
      );
    }
  };

  const getFullImageUrl = (
    url
  ) => {
    if (!url) return null;

    if (url.startsWith("http")) {
      return url;
    }

    return (
      API.defaults.baseURL.replace(
        "/api",
        ""
      ) + url
    );
  };

  const handleCreateComplaint =
    async () => {
      if (!title.trim()) {
        Alert.alert(
          "Validation Error",
          "Please enter complaint title."
        );

        return;
      }

      if (!description.trim()) {
        Alert.alert(
          "Validation Error",
          "Please enter complaint description."
        );

        return;
      }

      try {
        setSaving(true);

        let imageUrl = "";

        if (selectedImage) {
          const uploadRes =
            await uploadReceiptImage(
              selectedImage
            );

          imageUrl =
            uploadRes.data.fileUrl;
        }

        await createComplaint({
          title: title.trim(),
          description:
            description.trim(),
          category,
          imageUrl,
        });

        Alert.alert(
          "Success",
          "Complaint raised successfully."
        );

        resetForm();

        await loadData();
      } catch (error) {
        console.log(
          "CREATE COMPLAINT ERROR:",
          error?.response?.data ||
            error
        );

        Alert.alert(
          "Error",
          "Unable to raise complaint."
        );
      } finally {
        setSaving(false);
      }
    };

  const startStatusUpdate = (
    item
  ) => {
    setSelectedComplaint(item);

    setStatus(
      item.status ||
        "IN_PROGRESS"
    );

    setAdminResponse(
      item.adminResponse || ""
    );
  };

  const handleUpdateStatus =
    async () => {
      if (!selectedComplaint) {
        return;
      }

      try {
        setStatusSaving(true);

        await updateComplaintStatus(
          selectedComplaint.complaintId,
          {
            status,
            adminResponse:
              adminResponse.trim(),
          }
        );

        Alert.alert(
          "Success",
          "Complaint status updated."
        );

        resetStatusForm();

        await loadData();
      } catch (error) {
        console.log(
          "UPDATE COMPLAINT ERROR:",
          error?.response?.data ||
            error
        );

        Alert.alert(
          "Error",
          "Unable to update complaint."
        );
      } finally {
        setStatusSaving(false);
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
            Loading complaints...
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
            name="chatbox-ellipses-outline"
            size={42}
            color="#FFFFFF"
          />

          <Text
            style={styles.heading}
          >
            Complaints
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Raise and track
            apartment maintenance
            issues.
          </Text>
        </View>

        <AppCard
          style={styles.formCard}
        >
          <Text
            style={
              styles.formTitle
            }
          >
            Raise Complaint
          </Text>

          <AppInput
            label="Title"
            placeholder="Example: Water leakage"
            value={title}
            onChangeText={setTitle}
          />

          <AppInput
            label="Description"
            placeholder="Explain the issue..."
            value={description}
            onChangeText={
              setDescription
            }
            multiline
          />

          <Text
            style={styles.label}
          >
            Category
          </Text>

          <View
            style={styles.chipGrid}
          >
            {CATEGORIES.map(
              (item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.chip,
                    category ===
                      item &&
                      styles.chipActive,
                  ]}
                  onPress={() =>
                    setCategory(
                      item
                    )
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      category ===
                        item &&
                        styles.chipTextActive,
                    ]}
                  >
                    {formatText(
                      item
                    )}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>

          <Text
            style={styles.label}
          >
            Image Optional
          </Text>

          <TouchableOpacity
            style={
              styles.uploadBox
            }
            onPress={() => {
              if (
                selectedImage
              ) {
                setPreviewImageUrl(
                  selectedImage.uri
                );
              } else {
                pickImage();
              }
            }}
            activeOpacity={0.85}
          >
            <View
              style={
                styles.uploadIconCircle
              }
            >
              <Ionicons
                name="cloud-upload-outline"
                size={34}
                color={
                  COLORS.primary
                }
              />
            </View>

            <Text
              style={
                styles.uploadTitle
              }
            >
              {selectedImage
                ? "Image Selected"
                : "Upload Image"}
            </Text>

            <Text
              style={
                styles.uploadText
              }
            >
              {selectedImage
                ? "Tap to preview image"
                : "Select image from gallery"}
            </Text>
          </TouchableOpacity>

          {selectedImage && (
            <AppButton
              title="Change Image"
              variant="secondary"
              onPress={pickImage}
              style={
                styles.changeButton
              }
            />
          )}

          <AppButton
            title="Submit Complaint"
            onPress={
              handleCreateComplaint
            }
            loading={saving}
          />
        </AppCard>

        {selectedComplaint &&
          isAdminOrCashier && (
            <AppCard
              style={
                styles.formCard
              }
            >
              <Text
                style={
                  styles.formTitle
                }
              >
                Update Complaint
              </Text>

              <Text
                style={
                  styles.selectedTitle
                }
              >
                {
                  selectedComplaint.title
                }
              </Text>

              <Text
                style={
                  styles.label
                }
              >
                Status
              </Text>

              <View
                style={
                  styles.chipGrid
                }
              >
                {STATUSES.map(
                  (item) => (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.chip,
                        status ===
                          item &&
                          styles.chipActive,
                      ]}
                      onPress={() =>
                        setStatus(
                          item
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.chipText,
                          status ===
                            item &&
                            styles.chipTextActive,
                        ]}
                      >
                        {formatText(
                          item
                        )}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              <AppInput
                label="Admin Response"
                placeholder="Write response..."
                value={
                  adminResponse
                }
                onChangeText={
                  setAdminResponse
                }
                multiline
              />

              <AppButton
                title="Update Status"
                onPress={
                  handleUpdateStatus
                }
                loading={
                  statusSaving
                }
              />

              <AppButton
                title="Cancel"
                variant="secondary"
                onPress={
                  resetStatusForm
                }
                style={
                  styles.cancelButton
                }
              />
            </AppCard>
          )}

        <Text
          style={
            styles.sectionTitle
          }
        >
          {isAdminOrCashier
            ? "All Complaints"
            : "My Complaints"}
        </Text>

        {complaints.length ===
        0 ? (
          <AppCard>
            <EmptyState
              icon="chatbox-outline"
              title="No complaints found"
              subtitle="Complaints will appear here."
            />
          </AppCard>
        ) : (
          complaints.map(
            (item) => (
              <AppCard
                key={
                  item.complaintId
                }
                style={
                  styles.complaintCard
                }
              >
                <View
                  style={
                    styles.complaintTop
                  }
                >
                  <View
                    style={
                      styles.iconBox
                    }
                  >
                    <Ionicons
                      name="construct-outline"
                      size={24}
                      color={
                        COLORS.primary
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.complaintTextBlock
                    }
                  >
                    <Text
                      style={
                        styles.complaintTitle
                      }
                    >
                      {item.title}
                    </Text>

                    <Text
                      style={
                        styles.complaintDate
                      }
                    >
                      {formatDate(
                        item.createdAt
                      )}
                    </Text>
                  </View>

                  <StatusBadge
                    status={
                      item.status
                    }
                  />
                </View>

                <Text
                  style={
                    styles.categoryText
                  }
                >
                  {formatText(
                    item.category ||
                      "OTHER"
                  )}
                </Text>

                <Text
                  style={
                    styles.description
                  }
                >
                  {
                    item.description
                  }
                </Text>

                {item.imageUrl ? (
                  <TouchableOpacity
                    style={
                      styles.previewBox
                    }
                    onPress={() =>
                      setPreviewImageUrl(
                        getFullImageUrl(
                          item.imageUrl
                        )
                      )
                    }
                    activeOpacity={
                      0.85
                    }
                  >
                    <View
                      style={
                        styles.previewIconCircle
                      }
                    >
                      <Ionicons
                        name="image-outline"
                        size={30}
                        color={
                          COLORS.primary
                        }
                      />
                    </View>

                    <Text
                      style={
                        styles.previewTitle
                      }
                    >
                      Image Attached
                    </Text>

                    <Text
                      style={
                        styles.previewText
                      }
                    >
                      Tap to view image
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {item.adminResponse ? (
                  <View
                    style={
                      styles.responseBox
                    }
                  >
                    <Text
                      style={
                        styles.responseLabel
                      }
                    >
                      Admin Response
                    </Text>

                    <Text
                      style={
                        styles.responseText
                      }
                    >
                      {
                        item.adminResponse
                      }
                    </Text>
                  </View>
                ) : null}

                {isAdminOrCashier && (
                  <AppButton
                    title="Update Complaint"
                    variant="outline"
                    onPress={() =>
                      startStatusUpdate(
                        item
                      )
                    }
                    style={
                      styles.updateButton
                    }
                  />
                )}
              </AppCard>
            )
          )
        )}

        <ImagePreviewModal
          visible={
            !!previewImageUrl
          }
          imageUrl={
            previewImageUrl
          }
          onClose={() =>
            setPreviewImageUrl(
              null
            )
          }
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
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
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

  selectedTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.primary,
    marginBottom: 14,
  },

  label: {
    fontSize: 14,
    fontWeight: "800",
    color:
      COLORS.textSecondary,
    marginBottom: 10,
  },

  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 18,
  },

  chip: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor:
      "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginRight: 8,
    marginBottom: 10,
  },

  chipActive: {
    backgroundColor:
      COLORS.primary,
    borderColor:
      COLORS.primary,
  },

  chipText: {
    color:
      COLORS.textSecondary,
    fontWeight: "800",
    fontSize: 13,
  },

  chipTextActive: {
    color: "#FFFFFF",
  },

  uploadBox: {
    height: 180,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    backgroundColor: "#FAFBFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  uploadIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor:
      "#EEF5FF",
    alignItems: "center",
    justifyContent:
      "center",
    marginBottom: 14,
  },

  uploadTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.text,
  },

  uploadText: {
    fontSize: 13,
    color:
      COLORS.textMuted,
    marginTop: 5,
    fontWeight: "600",
  },

  changeButton: {
    marginBottom: 14,
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

  complaintCard: {
    marginBottom: 16,
    borderRadius: 22,
  },

  complaintTop: {
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

  complaintTextBlock: {
    flex: 1,
    paddingRight: 10,
  },

  complaintTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
  },

  complaintDate: {
    fontSize: 12,
    color:
      COLORS.textMuted,
    marginTop: 4,
    fontWeight: "600",
  },

  categoryText: {
    marginTop: 15,
    color:
      COLORS.primary,
    fontWeight: "900",
    fontSize: 13,
  },

  description: {
    fontSize: 14,
    color:
      COLORS.textSecondary,
    marginTop: 8,
    lineHeight: 22,
    fontWeight: "500",
  },

  previewBox: {
    marginTop: 18,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
    paddingVertical: 24,
    alignItems: "center",
  },

  previewIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor:
      "#DBEAFE",
    alignItems: "center",
    justifyContent:
      "center",
    marginBottom: 12,
  },

  previewTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#1E3A8A",
  },

  previewText: {
    fontSize: 13,
    color:
      COLORS.textMuted,
    marginTop: 4,
    fontWeight: "600",
  },

  responseBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor:
      "#F9FAFB",
  },

  responseLabel: {
    fontSize: 12,
    color:
      COLORS.textMuted,
    fontWeight: "900",
    marginBottom: 6,
  },

  responseText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 21,
    fontWeight: "500",
  },

  updateButton: {
    marginTop: 16,
  },
});