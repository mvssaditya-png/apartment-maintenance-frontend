import React, { useContext, useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { createPaymentRequest } from "../api/dashboardApi";
import { t } from "../i18n";
import { LanguageContext } from "../context/LanguageContext";

const REQUEST_TYPES = [
  {
    labelKey: "paymentRequest.maintenance",
    value: "Maintenance",
  },
  {
    labelKey: "paymentRequest.specialRequest",
    value: "Special Request",
  },
];

const MONTHS = [
  { label: "Jan", value: 1 },
  { label: "Feb", value: 2 },
  { label: "Mar", value: 3 },
  { label: "Apr", value: 4 },
  { label: "May", value: 5 },
  { label: "Jun", value: 6 },
  { label: "Jul", value: 7 },
  { label: "Aug", value: 8 },
  { label: "Sep", value: 9 },
  { label: "Oct", value: 10 },
  { label: "Nov", value: 11 },
  { label: "Dec", value: 12 },
];

export default function PaymentRequestScreen({ navigation }) {
  const { language } = useContext(LanguageContext);

  const currentDate = new Date();

  const [title, setTitle] = useState("Monthly Maintenance");
  const [description, setDescription] = useState("Monthly maintenance payment");
  const [amount, setAmount] = useState("");
  const [requestType, setRequestType] = useState("Maintenance");
  const [paymentMonth, setPaymentMonth] = useState(currentDate.getMonth() + 1);
  const [paymentYear, setPaymentYear] = useState(
    String(currentDate.getFullYear())
  );
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateRequest = async () => {
    if (!title.trim()) {
      Alert.alert(
        t("addExpense.validationError"),
        t("paymentRequest.enterTitle")
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

    if (!paymentMonth || Number(paymentMonth) < 1 || Number(paymentMonth) > 12) {
      Alert.alert(
        t("addExpense.validationError"),
        t("paymentRequest.selectValidMonth")
      );
      return;
    }

    if (!paymentYear || Number(paymentYear) < 2020) {
      Alert.alert(
        t("addExpense.validationError"),
        t("paymentRequest.enterValidYear")
      );
      return;
    }

    if (!dueDate.trim()) {
      Alert.alert(
        t("addExpense.validationError"),
        t("paymentRequest.enterDueDate")
      );
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      amount: Number(amount),
      requestType: requestType,
      paymentMonth: Number(paymentMonth),
      paymentYear: Number(paymentYear),
      dueDate: dueDate.trim(),
    };

    try {
      setLoading(true);

      await createPaymentRequest(payload);

      Alert.alert(
        t("common.success"),
        t("paymentRequest.createSuccess"),
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.log("PAYMENT REQUEST ERROR:", error?.response?.data || error);

      Alert.alert(
        t("common.error"),
        t("paymentRequest.createFailed")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>
            {t("paymentRequest.title")}
          </Text>

          <Text style={styles.subtitle}>
            {t("paymentRequest.subtitle")}
          </Text>

          <View style={styles.card}>
            <FieldLabel label={t("notices.noticeTitle")} />

            <TextInput
              style={styles.input}
              placeholder={t("paymentRequest.titlePlaceholder")}
              value={title}
              onChangeText={setTitle}
            />

            <FieldLabel label={t("addExpense.description")} />

            <TextInput
              style={[styles.input, styles.multiInput]}
              placeholder={t("paymentRequest.descriptionPlaceholder")}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <FieldLabel label={t("addExpense.amount")} />

            <TextInput
              style={styles.input}
              placeholder={t("paymentRequest.amountPlaceholder")}
              keyboardType="numeric"
              value={amount}
              onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ""))}
            />

            <FieldLabel label={t("paymentRequest.requestType")} />

            <View style={styles.optionRow}>
              {REQUEST_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.optionButton,
                    requestType === type.value && styles.optionButtonActive,
                  ]}
                  onPress={() => setRequestType(type.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      requestType === type.value && styles.optionTextActive,
                    ]}
                  >
                    {t(type.labelKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <FieldLabel label={t("paymentRequest.paymentMonth")} />

            <View style={styles.monthGrid}>
              {MONTHS.map((month) => (
                <TouchableOpacity
                  key={month.value}
                  style={[
                    styles.monthButton,
                    paymentMonth === month.value && styles.monthButtonActive,
                  ]}
                  onPress={() => setPaymentMonth(month.value)}
                >
                  <Text
                    style={[
                      styles.monthText,
                      paymentMonth === month.value && styles.monthTextActive,
                    ]}
                  >
                    {month.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <FieldLabel label={t("paymentRequest.year")} />

            <TextInput
              style={styles.input}
              placeholder="2026"
              keyboardType="numeric"
              value={paymentYear}
              onChangeText={(text) =>
                setPaymentYear(text.replace(/[^0-9]/g, ""))
              }
            />

            <FieldLabel label={t("paymentRequest.dueDate")} />

            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={dueDate}
              onChangeText={setDueDate}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleCreateRequest}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>
                  {t("paymentRequest.createRequest")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FieldLabel({ label }) {
  return <Text style={styles.label}>{label}</Text>;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  keyboardView: {
    flex: 1,
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
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
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

  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  optionButton: {
    width: "48%",
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },

  optionButtonActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  optionText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#374151",
  },

  optionTextActive: {
    color: "#FFFFFF",
  },

  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  monthButton: {
    width: "23%",
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    marginBottom: 10,
  },

  monthButtonActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  monthText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#374151",
  },

  monthTextActive: {
    color: "#FFFFFF",
  },

  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});