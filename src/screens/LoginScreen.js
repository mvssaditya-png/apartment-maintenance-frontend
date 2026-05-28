import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { sendOtp } from "../api/authApi";
import { t } from "../i18n";

export default function LoginScreen({ navigation }) {
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (mobile.length !== 10) {
      Alert.alert("Invalid Mobile", t("login.invalidMobile"));
      return;
    }

    try {
      setLoading(true);

      const response = await sendOtp(mobile);

      if (response.data.success) {
        navigation.navigate("Otp", {
          phoneNumber: mobile,
        });
      } else {
        Alert.alert(
          t("common.error"),
          response.data.message || "Unable to send OTP"
        );
      }
    } catch (error) {
      console.log("API ERROR:", error);
      Alert.alert(t("common.error"), t("login.unableToConnect"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.logoBox}>
          <Ionicons name="business-outline" size={42} color="#2563EB" />
        </View>

        <Text style={styles.title}>{t("login.welcomeBack")}</Text>

        <Text style={styles.subtitle}>{t("login.subtitle")}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>{t("login.mobileNumber")}</Text>

          <View style={styles.inputRow}>
            <View style={styles.countryBox}>
              <Text style={styles.countryText}>+91</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder={t("login.enterMobile")}
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              maxLength={10}
              value={mobile}
              onChangeText={(text) =>
                setMobile(text.replace(/[^0-9]/g, ""))
              }
            />
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              mobile.length !== 10 && styles.buttonDisabled,
            ]}
            onPress={handleSendOtp}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.buttonText}>{t("login.sendOtp")}</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.footerText}>{t("login.otpInfo")}</Text>
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
    paddingHorizontal: 24,
    justifyContent: "center",
  },

  logoBox: {
    width: 82,
    height: 82,
    borderRadius: 28,
    backgroundColor: "#EEF5FF",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 22,
  },

  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 28,
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 5,
  },

  label: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "900",
    marginBottom: 10,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    backgroundColor: "#F9FAFB",
    marginBottom: 18,
    overflow: "hidden",
  },

  countryBox: {
    paddingHorizontal: 14,
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },

  countryText: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "900",
  },

  input: {
    flex: 1,
    height: 54,
    paddingHorizontal: 14,
    fontSize: 17,
    color: "#111827",
    fontWeight: "700",
  },

  button: {
    backgroundColor: "#2563EB",
    borderRadius: 18,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  buttonDisabled: {
    opacity: 0.75,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    marginRight: 8,
  },

  footerText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 18,
    fontWeight: "600",
  },
});