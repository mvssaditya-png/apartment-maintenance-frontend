import React, { useContext, useState } from "react";

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

import {
  addExpense,
  uploadReceiptImage,
} from "../api/dashboardApi";

import AppCard from "../components/common/AppCard";
import AppButton from "../components/common/AppButton";
import AppInput from "../components/common/AppInput";

import { COLORS } from "../components/common/theme";
import { t } from "../i18n";
import { LanguageContext } from "../context/LanguageContext";

const EXPENSE_CATEGORIES = [
  "MAINTENANCE",
  "REPAIR",
  "ELECTRICITY",
  "WATER",
  "SECURITY",
  "CLEANING",
  "OTHER",
];

export default function AddExpenseScreen({ navigation }) {
  const { language } = useContext(LanguageContext);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [category, setCategory] = useState("MAINTENANCE");

  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert(
        t("addExpense.validationError"),
        t("addExpense.enterTitle")
      );
      return;
    }

    if (!amount || Number(amount) <= 0) {
      Alert.alert(
        t("addExpense.validationError"),
        t("addExpense.enterValidAmount")
      );
      return;
    }

    if (!expenseDate.trim()) {
      Alert.alert(
        t("addExpense.validationError"),
        t("addExpense.enterExpenseDate")
      );
      return;
    }

    try {
      setLoading(true);

      let receiptUrl = "";

      if (selectedImage) {
        const uploadRes = await uploadReceiptImage(selectedImage);
        receiptUrl = uploadRes.data.fileUrl;
      }

      await addExpense({
        title: title.trim(),
        description: description.trim(),
        amount: Number(amount),
        expenseDate: expenseDate.trim(),
        category,
        receiptUrl,
      });

      Alert.alert(
        t("common.success"),
        t("addExpense.expenseAdded"),
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.log(
        "ADD EXPENSE ERROR:",
        error?.response?.data || error
      );

      Alert.alert(
        t("common.error"),
        t("addExpense.addFailed")
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
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <Ionicons
            name="add-circle-outline"
            size={42}
            color="#FFFFFF"
          />

          <Text style={styles.title}>
            {t("addExpense.title")}
          </Text>

          <Text style={styles.subtitle}>
            {t("addExpense.subtitle")}
          </Text>
        </View>

        <AppCard style={styles.card}>
          <AppInput
            label={t("addExpense.expenseTitle")}
            placeholder={t("addExpense.expenseTitlePlaceholder")}
            value={title}
            onChangeText={setTitle}
          />

          <AppInput
            label={t("addExpense.description")}
            placeholder={t("addExpense.descriptionPlaceholder")}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <AppInput
            label={t("addExpense.amount")}
            placeholder={t("addExpense.amountPlaceholder")}
            keyboardType="numeric"
            value={amount}
            onChangeText={(text) =>
              setAmount(text.replace(/[^0-9.]/g, ""))
            }
          />

          <AppInput
            label={t("addExpense.expenseDate")}
            placeholder="YYYY-MM-DD"
            value={expenseDate}
            onChangeText={setExpenseDate}
          />

          <Text style={styles.label}>
            {t("addExpense.category")}
          </Text>

          <View style={styles.categoryGrid}>
            {EXPENSE_CATEGORIES.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.categoryButton,
                  category === item && styles.categoryButtonActive,
                ]}
                onPress={() => setCategory(item)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.categoryText,
                    category === item && styles.categoryTextActive,
                  ]}
                >
                  {formatCategory(item)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>
            {t("addExpense.receiptImageOptional")}
          </Text>

          <TouchableOpacity
            style={styles.uploadBox}
            onPress={() => {
              if (selectedImage) {
                setPreviewImageUrl(selectedImage.uri);
              } else {
                pickImage();
              }
            }}
            activeOpacity={0.85}
          >
            <View style={styles.uploadIconCircle}>
              <Ionicons
                name={
                  selectedImage
                    ? "image-outline"
                    : "cloud-upload-outline"
                }
                size={36}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.uploadTitle}>
              {selectedImage
                ? t("submitPayment.receiptSelected")
                : t("addExpense.uploadReceipt")}
            </Text>

            <Text style={styles.uploadText}>
              {selectedImage
                ? t("submitPayment.tapToPreview")
                : t("addExpense.selectReceipt")}
            </Text>
          </TouchableOpacity>

          {selectedImage ? (
            <AppButton
              title={t("addExpense.changeReceipt")}
              variant="secondary"
              onPress={pickImage}
              style={styles.changeButton}
            />
          ) : null}

          <AppButton
            title={t("addExpense.addExpense")}
            onPress={handleSubmit}
            loading={loading}
          />
        </AppCard>
      </ScrollView>

      <ImagePreviewModal
        visible={!!previewImageUrl}
        imageUrl={previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
      />
    </SafeAreaView>
  );
}

function formatCategory(value) {
  if (!value) return "-";

  switch (value) {
    case "MAINTENANCE":
      return t("addExpense.categories.maintenance");

    case "REPAIR":
      return t("addExpense.categories.repair");

    case "ELECTRICITY":
      return t("addExpense.categories.electricity");

    case "WATER":
      return t("addExpense.categories.water");

    case "SECURITY":
      return t("addExpense.categories.security");

    case "CLEANING":
      return t("addExpense.categories.cleaning");

    case "OTHER":
      return t("addExpense.categories.other");

    default:
      return value;
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    padding: 18,
    paddingBottom: 40,
  },

  headerCard: {
    backgroundColor: "#DC2626",
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 10,
  },

  subtitle: {
    fontSize: 14,
    color: "#FEE2E2",
    marginTop: 6,
    lineHeight: 21,
    fontWeight: "600",
  },

  card: {
    borderRadius: 24,
  },

  label: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textSecondary,
    marginBottom: 10,
  },

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 18,
  },

  categoryButton: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginRight: 8,
    marginBottom: 10,
  },

  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  categoryText: {
    color: COLORS.textSecondary,
    fontWeight: "800",
    fontSize: 13,
  },

  categoryTextActive: {
    color: "#FFFFFF",
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
  },

  uploadIconCircle: {
    width: 74,
    height: 74,
    borderRadius: 26,
    backgroundColor: "#EEF5FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
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

  changeButton: {
    marginBottom: 14,
  },
});