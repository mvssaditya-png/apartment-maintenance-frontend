import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import ImagePreviewModal from "../components/common/ImagePreviewModal";
import { Ionicons } from "@expo/vector-icons";

import {
  submitPayment,
  uploadReceiptImage,
} from "../api/dashboardApi";

const PAYMENT_MODES = ["UPI", "BANK_TRANSFER", "CASH", "CHEQUE"];

export default function SubmitPaymentScreen({ route, navigation }) {
  const { payment } = route.params;

  const [paymentMode, setPaymentMode] = useState("UPI");
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

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

  const handleSubmit = async () => {
    if (!selectedImage) {
      Alert.alert("Receipt Required", "Please upload payment screenshot.");
      return;
    }

    try {
      setLoading(true);

      const uploadRes = await uploadReceiptImage(selectedImage);

      const receiptUrl = uploadRes.data.fileUrl;

      await submitPayment({
        paymentId: payment.paymentId,
        paymentMode,
        receiptUrl,
      });

      Alert.alert("Success", "Payment submitted successfully.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.log("SUBMIT PAYMENT ERROR:", error?.response?.data || error);
      Alert.alert("Error", "Unable to submit payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Payment Amount</Text>
          <Text style={styles.amount}>₹{formatAmount(payment.amount)}</Text>
          <Text style={styles.detailText}>
            {payment.requestType} • {getMonthName(payment.paymentMonth)}{" "}
            {payment.paymentYear}
          </Text>
        </View>

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
          <Text style={styles.label}>Payment Screenshot</Text>

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
                <Ionicons
                  name="image-outline"
                  size={34}
                  color="#2563EB"
                />

                <Text style={styles.uploadTitle}>
                  Receipt Selected
                </Text>

                <Text style={styles.uploadText}>
                  Tap to preview image
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.uploadTitle}>
                  Upload Screenshot
                </Text>

                <Text style={styles.uploadText}>
                  Select payment receipt from gallery
                </Text>
              </>
            )}

          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Submit Payment</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      <ImagePreviewModal
  visible={!!previewImageUrl}
  imageUrl={previewImageUrl}
  onClose={() => setPreviewImageUrl(null)}
/>
    </SafeAreaView>
  );
}

function formatAmount(value) {
  if (!value) return "0";
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
    paddingBottom: 40,
  },

  summaryCard: {
    backgroundColor: "#2563EB",
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
  },

  summaryLabel: {
    color: "#DBEAFE",
    fontSize: 14,
    fontWeight: "700",
  },

  amount: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "900",
    marginTop: 6,
  },

  detailText: {
    color: "#E0E7FF",
    fontSize: 14,
    marginTop: 8,
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 14,
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

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 10,
  },

  uploadBox: {
    height: 210,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    overflow: "hidden",
  },

  previewImage: {
    width: "100%",
    height: "100%",
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

  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});