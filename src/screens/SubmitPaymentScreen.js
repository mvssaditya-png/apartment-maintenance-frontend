import React, { useState } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

import ImagePreviewModal from "../components/common/ImagePreviewModal";

import AppCard from "../components/common/AppCard";
import AppButton from "../components/common/AppButton";
import { COLORS } from "../components/common/theme";

import {
  submitPayment,
  uploadReceiptImage,
} from "../api/dashboardApi";

import { t } from "../i18n";

const PAYMENT_MODES = [
  "UPI",
  "BANK_TRANSFER",
  "CASH",
  "CHEQUE",
];

export default function SubmitPaymentScreen({
  route,
  navigation,
}) {
  const { payment } = route.params;

  const [paymentMode, setPaymentMode] =
    useState("UPI");

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [previewImageUrl, setPreviewImageUrl] =
    useState(null);

  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        t("submitPayment.permissionRequired"),
        t("submitPayment.allowGalleryAccess")
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
      setSelectedImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      Alert.alert(
        t("submitPayment.receiptRequired"),
        t("submitPayment.uploadReceipt")
      );
      return;
    }

    try {
      setLoading(true);

      const uploadRes =
        await uploadReceiptImage(
          selectedImage
        );

      const receiptUrl =
        uploadRes.data.fileUrl;

      await submitPayment({
        paymentId: payment.paymentId,
        paymentMode,
        receiptUrl,
      });

      Alert.alert(
        t("submitPayment.success"),
        t("submitPayment.paymentSubmitted"),
        [
          {
            text: "OK",
            onPress: () =>
              navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.log(
        "SUBMIT PAYMENT ERROR:",
        error?.response?.data || error
      );

      Alert.alert(
        t("submitPayment.error"),
        t("submitPayment.submitFailed")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["bottom"]}
    >
      <ScrollView
        contentContainerStyle={
          styles.container
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <AppCard style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>
                {t("submitPayment.paymentAmount")}
              </Text>

              <Text style={styles.amount}>
                ₹
                {formatAmount(
                  payment.amount
                )}
              </Text>

              <Text style={styles.detailText}>
                {payment.requestType} •{" "}
                {getMonthName(
                  payment.paymentMonth
                )}{" "}
                {payment.paymentYear}
              </Text>
            </View>

            <View
              style={styles.summaryIconBox}
            >
              <Ionicons
                name="wallet-outline"
                size={30}
                color="#FFFFFF"
              />
            </View>
          </View>
        </AppCard>

        <Text style={styles.sectionTitle}>
          {t("submitPayment.paymentMode")}
        </Text>

        <View style={styles.modeGrid}>
          {PAYMENT_MODES.map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.modeButton,
                paymentMode === mode &&
                  styles.modeButtonActive,
              ]}
              onPress={() =>
                setPaymentMode(mode)
              }
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.modeIconBox,
                  paymentMode === mode &&
                    styles.modeIconBoxActive,
                ]}
              >
                <Ionicons
                  name={getPaymentModeIcon(
                    mode
                  )}
                  size={22}
                  color={
                    paymentMode === mode
                      ? "#FFFFFF"
                      : COLORS.primary
                  }
                />
              </View>

              <Text
                style={[
                  styles.modeText,
                  paymentMode === mode &&
                    styles.modeTextActive,
                ]}
              >
                {formatMode(mode)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <AppCard style={styles.card}>
          <Text style={styles.label}>
            {t("submitPayment.paymentScreenshot")}
          </Text>

          <TouchableOpacity
            style={styles.uploadBox}
            onPress={() => {
              if (selectedImage) {
                setPreviewImageUrl(
                  selectedImage.uri
                );
              } else {
                pickImage();
              }
            }}
            activeOpacity={0.85}
          >
            {selectedImage ? (
              <>
                <Ionicons
                  name="image-outline"
                  size={38}
                  color={COLORS.primary}
                />

                <Text
                  style={
                    styles.uploadTitle
                  }
                >
                  {t("submitPayment.receiptSelected")}
                </Text>

                <Text
                  style={
                    styles.uploadText
                  }
                >
                  {t("submitPayment.tapToPreview")}
                </Text>
              </>
            ) : (
              <>
                <View
                  style={
                    styles.uploadIconCircle
                  }
                >
                  <Ionicons
                    name="cloud-upload-outline"
                    size={36}
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
                  {t("submitPayment.uploadScreenshot")}
                </Text>

                <Text
                  style={
                    styles.uploadText
                  }
                >
                  {t("submitPayment.selectReceipt")}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <AppButton
            title={t("submitPayment.submitPayment")}
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </AppCard>

        <View style={{ height: 30 }} />
      </ScrollView>

      <ImagePreviewModal
        visible={!!previewImageUrl}
        imageUrl={previewImageUrl}
        onClose={() =>
          setPreviewImageUrl(null)
        }
      />
    </SafeAreaView>
  );
}

function formatAmount(value) {
  if (!value) return "0";

  return Number(value).toLocaleString(
    "en-IN"
  );
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

  return (
    months[Number(monthNumber)] || "-"
  );
}

function formatMode(mode) {
  switch (mode) {
    case "UPI":
      return t("submitPayment.upi");

    case "BANK_TRANSFER":
      return t("submitPayment.bankTransfer");

    case "CASH":
      return t("submitPayment.cash");

    case "CHEQUE":
      return t("submitPayment.cheque");

    default:
      return mode;
  }
}

function getPaymentModeIcon(mode) {
  switch (mode) {
    case "UPI":
      return "phone-portrait-outline";

    case "BANK_TRANSFER":
      return "business-outline";

    case "CASH":
      return "cash-outline";

    case "CHEQUE":
      return "document-text-outline";

    default:
      return "wallet-outline";
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  container: {
    padding: 18,
    paddingBottom: 40,
  },

  summaryCard: {
    backgroundColor:
      COLORS.primary,
    borderWidth: 0,
    marginBottom: 24,
    borderRadius: 26,
  },

  summaryTopRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  summaryContent: {
    flex: 1,
    paddingRight: 14,
  },

  summaryLabel: {
    color: "#DBEAFE",
    fontSize: 14,
    fontWeight: "700",
  },

  amount: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "900",
    marginTop: 6,
  },

  detailText: {
    color: "#E0E7FF",
    fontSize: 14,
    marginTop: 8,
    fontWeight: "600",
  },

  summaryIconBox: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor:
      "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 14,
  },

  modeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent:
      "space-between",
    marginBottom: 20,
  },

  modeButton: {
    width: "48%",
    backgroundColor:
      COLORS.white,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  modeButtonActive: {
    backgroundColor:
      COLORS.primary,
    borderColor: COLORS.primary,
  },

  modeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: "#EEF5FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  modeIconBoxActive: {
    backgroundColor:
      "rgba(255,255,255,0.18)",
  },

  modeText: {
    color: COLORS.textSecondary,
    fontWeight: "800",
    fontSize: 14,
  },

  modeTextActive: {
    color: "#FFFFFF",
  },

  card: {
    borderRadius: 22,
  },

  label: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textSecondary,
    marginBottom: 12,
  },

  uploadBox: {
    height: 220,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    backgroundColor: "#FAFBFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    overflow: "hidden",
  },

  uploadIconCircle: {
    width: 74,
    height: 74,
    borderRadius: 26,
    backgroundColor: "#EEF5FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  uploadTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.text,
  },

  uploadText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 6,
    fontWeight: "600",
    textAlign: "center",
  },

  submitButton: {
    marginTop: 4,
  },
});