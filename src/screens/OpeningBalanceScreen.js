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
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { updateOpeningBalance } from "../api/dashboardApi";
import { t } from "../i18n";
import { LanguageContext } from "../context/LanguageContext";

export default function OpeningBalanceScreen({ navigation }) {
  const { language } = useContext(LanguageContext);

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      Alert.alert(
        t("openingBalance.invalidAmount"),
        t("openingBalance.enterValidAmount")
      );
      return;
    }

    try {
      setLoading(true);

      await updateOpeningBalance(Number(amount));

      Alert.alert(
        t("common.success"),
        t("openingBalance.updateSuccess"),
        [
          {
            text: "OK",
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.log("OPENING BALANCE ERROR:", error?.response?.data || error);

      Alert.alert(
        t("common.error"),
        t("openingBalance.updateFailed")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View>
          <Text style={styles.title}>
            {t("openingBalance.title")}
          </Text>

          <Text style={styles.subtitle}>
            {t("openingBalance.subtitle")}
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>
              {t("openingBalance.amountLabel")}
            </Text>

            <TextInput
              style={styles.input}
              placeholder={t("openingBalance.amountPlaceholder")}
              keyboardType="numeric"
              value={amount}
              onChangeText={(text) =>
                setAmount(text.replace(/[^0-9.]/g, ""))
              }
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>
                  {t("openingBalance.updateBalance")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  container: {
    flex: 1,
    padding: 18,
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
    fontSize: 18,
    backgroundColor: "#F9FAFB",
    marginBottom: 18,
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