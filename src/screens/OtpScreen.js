import React, { useState, useContext, useRef } from "react";

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

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { verifyOtp, sendOtp } from "../api/authApi";
import { AuthContext } from "../context/AuthContext";
import { t } from "../i18n";

export default function OtpScreen({ route, navigation }) {
  const { phoneNumber } = route.params;
  const { login } = useContext(AuthContext);

  const inputRef = useRef(null);

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  React.useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleResendOtp = async () => {
    if (timer > 0 || resendLoading) return;

    try {
      setResendLoading(true);
      setOtp("");

      await sendOtp(phoneNumber);

      Alert.alert("OTP Sent", "A new OTP has been sent to your mobile number.");
      setTimer(30);
    } catch (error) {
      console.log("RESEND OTP ERROR:", error?.response?.data);

      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        "Unable to resend OTP. Please try again.";

      Alert.alert(t("common.error"), message);
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert(t("otp.invalidOtpTitle"), t("otp.invalidOtp"));
      return;
    }

    try {
      setLoading(true);

      const response = await verifyOtp(phoneNumber, otp);

      const token = response.data.token;
      const role = response.data.role;

      await AsyncStorage.setItem("token", token);

      if (role) {
        await AsyncStorage.setItem("role", role);
      }

      login(token, role);
    } catch (error) {
      console.log("VERIFY OTP ERROR:", error?.response?.data);

      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        "Unable to verify OTP. Please try again.";

      Alert.alert(t("common.error"), message);
    } finally {
      setLoading(false);
    }
  };

  const otpBoxes = Array.from({ length: 6 }).map(
    (_, index) => otp[index] || ""
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>

        <View style={styles.logoBox}>
          <Ionicons name="shield-checkmark-outline" size={42} color="#2563EB" />
        </View>

        <Text style={styles.appName}>SmartSociety</Text>

        <Text style={styles.title}>Secure Verification</Text>

        <Text style={styles.subtitle}>
          Enter the OTP sent to +91 {phoneNumber}
        </Text>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.otpContainer}
            activeOpacity={1}
            onPress={() => inputRef.current?.focus()}
          >
            {otpBoxes.map((digit, index) => (
              <View
                key={index}
                style={[styles.otpBox, digit && styles.otpBoxFilled]}
              >
                <Text style={styles.otpDigit}>{digit}</Text>
              </View>
            ))}
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ""))}
            autoFocus
          />

          <TouchableOpacity
            style={[
              styles.button,
              otp.length !== 6 && styles.buttonDisabled,
            ]}
            onPress={handleVerifyOtp}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.buttonText}>{t("otp.verifyOtp")}</Text>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={21}
                  color="#FFFFFF"
                />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.resendButton,
              (timer > 0 || resendLoading) && styles.resendButtonDisabled,
            ]}
            onPress={handleResendOtp}
            disabled={timer > 0 || resendLoading}
            activeOpacity={0.85}
          >
            <Text style={styles.resendText}>
              {resendLoading
                ? "Sending OTP..."
                : timer > 0
                ? `Resend OTP in ${timer}s`
                : "Resend OTP"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.changeNumberButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Text style={styles.changeNumberText}>{t("otp.changeMobile")}</Text>
          </TouchableOpacity>

          <Text style={styles.secureText}>
            SmartSociety uses OTP verification to protect apartment user access.
          </Text>
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

  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 8 : 18,
    left: 24,
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
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
    marginBottom: 18,
  },

  appName: {
    fontSize: 30,
    fontWeight: "900",
    color: "#2563EB",
    textAlign: "center",
    marginBottom: 6,
  },

  title: {
    fontSize: 28,
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

  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  otpBox: {
    width: 44,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },

  otpBoxFilled: {
    borderColor: "#2563EB",
    backgroundColor: "#EEF5FF",
  },

  otpDigit: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },

  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 1,
    width: 1,
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

  resendButton: {
    marginTop: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  resendButtonDisabled: {
    opacity: 0.6,
  },

  resendText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "900",
  },

  changeNumberButton: {
    marginTop: 16,
    alignItems: "center",
  },

  changeNumberText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "900",
  },

  secureText: {
    marginTop: 14,
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
    fontWeight: "600",
  },
});