import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
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
  addExpense,
  uploadReceiptImage,
} from "../api/dashboardApi";

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
    if (!title.trim()) {
      Alert.alert("Validation Error", "Please enter expense title.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      Alert.alert("Validation Error", "Please enter valid amount.");
      return;
    }

    if (!expenseDate.trim()) {
      Alert.alert("Validation Error", "Please enter expense date.");
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

      Alert.alert("Success", "Expense added successfully.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.log("ADD EXPENSE ERROR:", error?.response?.data || error);
      Alert.alert("Error", "Unable to add expense.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Add Expense</Text>

        <Text style={styles.subtitle}>
          Record society expenses such as repairs, cleaning, electricity, water,
          or maintenance work.
        </Text>

        <View style={styles.card}>
          <FieldLabel label="Expense Title" />
          <TextInput
            style={styles.input}
            placeholder="Example: Generator Repair"
            value={title}
            onChangeText={setTitle}
          />

          <FieldLabel label="Description" />
          <TextInput
            style={[styles.input, styles.multiInput]}
            placeholder="Example: Motor replacement"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <FieldLabel label="Amount" />
          <TextInput
            style={styles.input}
            placeholder="Example: 5000"
            keyboardType="numeric"
            value={amount}
            onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ""))}
          />

          <FieldLabel label="Expense Date" />
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={expenseDate}
            onChangeText={setExpenseDate}
          />

          <FieldLabel label="Category" />
          <View style={styles.categoryGrid}>
            {EXPENSE_CATEGORIES.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.categoryButton,
                  category === item && styles.categoryButtonActive,
                ]}
                onPress={() => setCategory(item)}
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

          <FieldLabel label="Receipt Image (Optional)" />
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
                    Upload Receipt
                </Text>

                <Text style={styles.uploadText}>
                    Select receipt image from gallery
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
              <Text style={styles.buttonText}>Add Expense</Text>
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

function FieldLabel({ label }) {
  return <Text style={styles.label}>{label}</Text>;
}

function formatCategory(value) {
  return value.charAt(0) + value.slice(1).toLowerCase();
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

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
    marginTop: 8,
  },

  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 22,
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

  multiInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },

  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginRight: 8,
    marginBottom: 10,
  },

  categoryButtonActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  categoryText: {
    color: "#374151",
    fontWeight: "800",
    fontSize: 13,
  },

  categoryTextActive: {
    color: "#FFFFFF",
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