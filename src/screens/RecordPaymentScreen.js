import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import FlatSelector from "../components/common/FlatSelector";
import {
  getFlatOptions,
  getFlatPendingPayments,
  recordPayment,
  uploadReceiptImage,
} from "../api/dashboardApi";

import ImagePreviewModal from "../components/common/ImagePreviewModal";

const PAYMENT_MODES = ["UPI", "BANK_TRANSFER", "CASH", "CHEQUE"];

export default function RecordPaymentScreen({ navigation }) {
  const [flats, setFlats] = useState([]);
  const [selectedFlat, setSelectedFlat] = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    loadFlats();
  }, []);

  const loadFlats = async () => {
    try {
      setLoading(true);
      const res = await getFlatOptions();
      setFlats(res.data || []);
    } catch (error) {
      console.log("LOAD FLATS ERROR:", error?.response?.data || error);
      Alert.alert("Error", "Unable to load flats.");
    } finally {
      setLoading(false);
    }
  };

  const loadPendingPayments = async (flat) => {
    try {
      setSelectedFlat(flat);
      setSelectedPayment(null);
      setPendingPayments([]);

      const res = await getFlatPendingPayments(flat.flatId);
      setPendingPayments(res.data || []);
    } catch (error) {
      console.log("LOAD FLAT PAYMENTS ERROR:", error?.response?.data || error);
      Alert.alert("Error", "Unable to load pending payments.");
    }
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

  const handleRecordPayment = async () => {
    if (!selectedFlat) {
      Alert.alert("Validation Error", "Please select a flat.");
      return;
    }

    if (!selectedPayment) {
      Alert.alert("Validation Error", "Please select a pending payment.");
      return;
    }

    try {
      setSubmitLoading(true);

      let receiptUrl = "";

      if (selectedImage) {
        const uploadRes = await uploadReceiptImage(selectedImage);
        receiptUrl = uploadRes.data.fileUrl;
      }

      await recordPayment({
        paymentId: selectedPayment.paymentId,
        paymentMode,
        receiptUrl,
      });

      Alert.alert("Success", "Payment recorded successfully.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.log("RECORD PAYMENT ERROR:", error?.response?.data || error);
      Alert.alert("Error", "Unable to record payment.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loaderText}>Loading flats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Record Payment</Text>
        <Text style={styles.subtitle}>
          Select flat, choose pending due and record payment directly.
        </Text>

        <FlatSelector
            flats={flats}
            selectedFlat={selectedFlat}
            onSelectFlat={loadPendingPayments}
            />

        {selectedFlat && (
          <>
            <Text style={styles.sectionTitle}>Pending Payments</Text>

            {pendingPayments.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No pending dues for this flat.</Text>
              </View>
            ) : (
              pendingPayments.map((payment) => (
                <TouchableOpacity
                  key={payment.paymentId}
                  style={[
                    styles.paymentCard,
                    selectedPayment?.paymentId === payment.paymentId &&
                      styles.selectedPaymentCard,
                  ]}
                  onPress={() => setSelectedPayment(payment)}
                >
                  <View>
                    <Text style={styles.paymentTitle}>
                      {payment.requestType}
                    </Text>
                    <Text style={styles.paymentSub}>
                      {getMonthName(payment.paymentMonth)} {payment.paymentYear} •{" "}
                      {payment.paymentStatus}
                    </Text>
                  </View>

                  <Text style={styles.amount}>₹{formatAmount(payment.amount)}</Text>
                </TouchableOpacity>
              ))
            )}
          </>
        )}

        {selectedPayment && (
          <>
            <Text style={styles.sectionTitle}>Payment Mode</Text>

            <View style={styles.modeGrid}>
              {PAYMENT_MODES.map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.modeButton,
                    paymentMode === mode && styles.modeButtonActive,
                  ]}
                  onPress={() => setPaymentMode(mode)}
                >
                  <Text
                    style={[
                      styles.modeText,
                      paymentMode === mode && styles.modeTextActive,
                    ]}
                  >
                    {formatMode(mode)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Receipt Image Optional</Text>

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
                {selectedImage ? (
                  <>
                    <Ionicons name="image-outline" size={34} color="#2563EB" />
                    <Text style={styles.uploadTitle}>Receipt Selected</Text>
                    <Text style={styles.uploadText}>Tap to preview image</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.uploadTitle}>Upload Receipt</Text>
                    <Text style={styles.uploadText}>
                      Select receipt image from gallery
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {selectedImage && (
                <TouchableOpacity
                  style={styles.changeButton}
                  onPress={pickImage}
                >
                  <Text style={styles.changeButtonText}>Change Image</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleRecordPayment}
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Record Payment</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
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

function formatAmount(value) {
  if (value === null || value === undefined || value === "") return "0";
  return Number(value).toLocaleString("en-IN");
}

function getMonthName(monthNumber) {
  const months = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return months[Number(monthNumber)] || "-";
}

function formatMode(mode) {
  if (mode === "BANK_TRANSFER") return "Bank Transfer";
  return mode;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  container: {
    padding: 18,
    paddingBottom: 50,
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

  heading: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
  },

  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 22,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
    marginTop: 8,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 20,
  },
  
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },

  emptyText: {
    color: "#6B7280",
    fontWeight: "600",
  },

  paymentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  selectedPaymentCard: {
    borderColor: "#2563EB",
    backgroundColor: "#EEF4FF",
  },

  paymentTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },

  paymentSub: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 3,
  },

  amount: {
    fontSize: 18,
    fontWeight: "900",
    color: "#2563EB",
  },

  modeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  modeButton: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },

  modeButtonActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  modeText: {
    color: "#374151",
    fontWeight: "800",
    fontSize: 14,
  },

  modeTextActive: {
    color: "#FFFFFF",
  },

  label: {
    fontSize: 14,
    fontWeight: "800",
    color: "#374151",
    marginBottom: 10,
  },

  uploadBox: {
    height: 150,
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
    fontWeight: "800",
    color: "#111827",
  },

  uploadText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 6,
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
    fontWeight: "800",
  },

  submitButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },

  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});